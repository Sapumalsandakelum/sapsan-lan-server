import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors({ origin: '*' }));
app.get('/', (req, res) => res.send('✅ SapSan Sync Server is running.'));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
  transports: ['websocket', 'polling'],
});

// In-memory store (resets on redeploy - fine for sync relay)
const store = {};

io.on('connection', (socket) => {
  console.log('PC connected:', socket.id);

  socket.on('push_change', (change) => {
    const { table, globalId, operation, payload } = change || {};
    if (!table || !globalId) return;
    if (!store[table]) store[table] = {};
    store[table][globalId] = { operation, payload, updatedAt: new Date().toISOString() };
    socket.broadcast.emit('remote_change', change);
  });

  socket.on('request_full_sync', (tables, callback) => {
    const result = {};
    (tables || []).forEach((table) => {
      const records = store[table] || {};
      result[table] = Object.entries(records)
        .filter(([, r]) => r.operation !== 'delete')
        .map(([globalId, r]) => ({ globalId, payload: r.payload }));
    });
    callback({ success: true, data: result });
  });

  socket.on('disconnect', () => {
    console.log('PC disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ SapSan Sync Server running on port ${PORT}`);
});