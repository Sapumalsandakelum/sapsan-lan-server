# SapSan POS — LAN Sync Server

Keeps sales and data in real-time sync across every POS PC in the restaurant,
over your local WiFi or Ethernet network — no internet needed at all.

## Choosing the Server Machine

Pick **one** PC (or a spare small computer, if you have one) to be the
"server". It should ideally stay switched on throughout business hours,
since if it's off, PCs can't sync with each other (though each PC still
keeps working normally on its own local data — sync just pauses until the
server PC is back).

A good choice: your main counter/reception PC, since it's usually on all day
anyway.

## Setup (one time, on the Server PC only)

1. Make sure [Node.js](https://nodejs.org) is installed on this PC (same as
   you already have on your main POS development machine). If unsure, open
   Command Prompt and type `node -v` — if it shows a version number, you're set.

2. Copy this whole `sapsan-lan-server` folder onto the server PC (a USB
   drive, or however you like).

3. Double-click **`START_SERVER.bat`**.
   - The first time, it will take a minute to install what it needs
     automatically — just wait.
   - After that, a window will open showing something like:
     ```
     📶 WiFi: http://192.168.1.50:3001
     🔌 Ethernet: http://192.168.1.51:3001
     ```
   - **Write down the address shown** (prefer the 🔌 Ethernet one if this PC
     is connected by cable — it's faster and more reliable than WiFi).

4. **Keep this window open** while the restaurant is running. Minimize it,
   don't close it. If you accidentally close it, just double-click
   `START_SERVER.bat` again.

   ⚠️ **This needs to run continuously, like a WiFi router** — closing it
   pauses sync for every PC (they still work fine on their own local data,
   they just stop seeing each other's updates until the server is running
   again). See "Running Automatically" below for a way to never have to
   think about this.

## Running Automatically (recommended — no daily double-clicking needed)

Once you've run `START_SERVER.bat` manually at least once (so the required
files are installed), switch to the **silent, automatic** version so this
PC starts the server invisibly every time it turns on — nobody needs to
remember to start anything:

1. Press `Windows Key + R`, type `shell:startup`, press Enter. This opens
   your Startup folder.
2. Right-click **`START_SERVER_HIDDEN.vbs`** → **Create shortcut**.
3. Drag that shortcut into the Startup folder window you opened in step 1.

That's it. From now on, every time this PC boots up, the sync server starts
automatically in the background with no visible window and no action
needed. To confirm it's running, check any other PC's Network Sync status
— if it shows 🟢 Connected, the server is up.

## Setting up every OTHER PC (the "clients")

On each of the other POS PCs:

1. Open the SapSan POS app.
2. Go to **Admin Panel → 🌐 Network Sync**.
3. Enter the server address you wrote down (e.g. `http://192.168.1.50:3001`).
4. Click **Connect**.
5. You should see a green "🟢 Connected" status. That PC is now syncing in
   real time with every other connected PC.

Repeat this on every PC except the server machine itself (though you can
also connect the server PC's own POS app to itself the same way, if you
plan to also take orders from that same PC).

## What happens if the network drops?

Every PC keeps working completely normally on its own local data — nothing
freezes or breaks. Once the network/server comes back, each PC automatically
catches up and re-syncs anything it missed.

## Running the server automatically on startup (optional)

If you'd rather not remember to double-click `START_SERVER.bat` every
morning, you can add a shortcut to it inside:
```
Windows Start Menu → Startup folder
```
(Right-click `START_SERVER.bat` → Create shortcut → move the shortcut into
the Startup folder, which you can open by typing `shell:startup` into the
Windows Run dialog.) Then it'll launch automatically whenever that PC turns on.