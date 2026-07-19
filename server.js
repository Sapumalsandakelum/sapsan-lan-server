// server.js — SapSan LAN Sync Server
// Runs on ONE PC (the "server machine") on your local WiFi/Ethernet network.
// Every other POS PC ("client") connects to this over the LAN — no internet
// needed at all. Relays sales/data changes between PCs in real time, and
// keeps a small local file so a PC that was briefly offline can catch up.
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STORE_FILE = path.join(__dirname, 'sync-store.json');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static client files if they exist in the 'client' directory (POS frontend)
const clientPath = path.join(__dirname, 'client');
if (fs.existsSync(clientPath)) {
  console.log(`📂 Serving client files from: ${clientPath}`);
  app.use(express.static(clientPath));
  
  // Single Page App fallback routing
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/socket.io/')) return next();
    res.sendFile(path.join(clientPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => res.send('✅ SapSan LAN Sync Server is running. (Place built client in /client to host POS app locally)'));
}

const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });

// store shape: { [tableName]: { [globalId]: { operation, payload, updatedAt } } }
const loadStore = () => {
  try {
    return JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8'));
  } catch (e) {
    return {};
  }
};
let store = loadStore();

let saveTimer = null;
const saveStoreDebounced = () => {
  // Debounced so a burst of changes doesn't hammer the disk
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      fs.writeFileSync(STORE_FILE, JSON.stringify(store));
    } catch (e) {
      console.error('⚠️  Failed to save sync store:', e.message);
    }
  }, 500);
};

let connectedCount = 0;

io.on('connection', (socket) => {
  connectedCount++;
  console.log(`✅ PC connected (${connectedCount} online) — ${socket.id}`);

  socket.on('push_change', (change) => {
    const { table, globalId, operation, payload } = change || {};
    if (!table || !globalId) return;
    if (!store[table]) store[table] = {};
    store[table][globalId] = { operation, payload, updatedAt: new Date().toISOString() };
    saveStoreDebounced();
    // Send to every OTHER connected PC immediately (not back to the sender)
    socket.broadcast.emit('remote_change', change);
  });

  socket.on('request_full_sync', (tables, callback) => {
    try {
      const result = {};
      (tables || []).forEach((table) => {
        const records = store[table] || {};
        result[table] = Object.entries(records)
          .filter(([, r]) => r.operation !== 'delete')
          .map(([globalId, r]) => ({ globalId, payload: r.payload }));
      });
      callback({ success: true, data: result });
    } catch (err) {
      callback({ success: false, error: err.message });
    }
  });

  socket.on('disconnect', () => {
    connectedCount--;
    console.log(`❌ PC disconnected (${connectedCount} online)`);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('🖥️  ═══════════════════════════════════════════');
  console.log('    SapSan LAN Sync Server — RUNNING');
  console.log('═══════════════════════════════════════════');
  console.log('');
  console.log(`   Keep this window open while the restaurant is operating.`);
  console.log('');
  console.log('   On EVERY OTHER PC, go to Admin Panel → Network Sync,');
  console.log('   and enter one of these addresses as the Server Address:');
  console.log('');

  const interfaces = os.networkInterfaces();
  let found = false;
  Object.entries(interfaces).forEach(([name, ifaceList]) => {
    ifaceList.forEach((iface) => {
      if (iface.family === 'IPv4' && !iface.internal) {
        const kind = /eth|ethernet/i.test(name) ? '🔌 Ethernet (recommended, faster)' : '📶 WiFi';
        console.log(`   ${kind}: http://${iface.address}:${PORT}`);
        found = true;
      }
    });
  });
  if (!found) {
    console.log('   ⚠️  No network address found — check this PC is connected to WiFi or Ethernet.');
  }
  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('');
});