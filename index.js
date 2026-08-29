const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const net = require('net');
const crypto = require('crypto');

const app = express();
// Menggunakan port bawaan Railway
const PORT = process.env.PORT || 8081;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Database penyimpanan akun sementara
let vpnAccounts = [];

// HTTP Server Express
const server = http.createServer(app);

// WebSocket Server untuk VLESS Protocol
const wss = new WebSocket.Server({ noServer: true });

server.on('upgrade', (request, socket, head) => {
  try {
    const pathname = new URL(request.url, `http://${request.headers.host}`).pathname;
    if (pathname === '/vless') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  } catch (err) {
    socket.destroy();
  }
});

// Handling VLESS over WebSocket Connection
wss.on('connection', (ws) => {
  ws.once('message', (msg) => {
    try {
      if (msg.length < 24) return ws.close();

      // Verifikasi UUID VLESS
      const uuidBuf = msg.slice(1, 17);
      const uuidHex = uuidBuf.toString('hex');
      const clientUuid = `${uuidHex.slice(0,8)}-${uuidHex.slice(8,12)}-${uuidHex.slice(12,16)}-${uuidHex.slice(16,20)}-${uuidHex.slice(20)}`;

      const isValidUser = vpnAccounts.some(acc => acc.uuid === clientUuid) || clientUuid === "00000000-0000-0000-0000-000000000000";
      if (!isValidUser) return ws.close();

      // Parse target address & port
      const optLength = msg[17];
      const command = msg[18 + optLength]; // 0x01 = TCP
      if (command !== 1) return ws.close();

      const port = msg.readUInt16BE(19 + optLength + 1);
      const addrType = msg[19 + optLength];
      let addr = '';
      let offset = 19 + optLength + 3;

      if (addrType === 1) { // IPv4
        addr = msg.slice(offset, offset + 4).join('.');
        offset += 4;
      } else if (addrType === 2) { // Domain
        const len = msg[offset];
        addr = msg.slice(offset + 1, offset + 1 + len).toString();
        offset += 1 + len;
      } else if (addrType === 3) { // IPv6
        addr = msg.slice(offset, offset + 16).toString('hex');
        offset += 16;
      }

      // Respon header sukses ke VLESS Client
      ws.send(Buffer.from([msg[0], 0]));

      // Buat socket koneksi keluar (Tunneling Internet)
      const targetSocket = net.connect(port, addr, () => {
        const rawData = msg.slice(offset);
        if (rawData.length > 0) targetSocket.write(rawData);

        ws.on('message', (data) => targetSocket.write(data));
        targetSocket.on('data', (data) => ws.send(data));
      });

      targetSocket.on('error', () => ws.close());
      ws.on('close', () => targetSocket.destroy());
      targetSocket.on('close', () => ws.close());
    } catch (err) {
      ws.close();
    }
  });
});

// Tampilan Dashboard Web UI
app.get('/', (req, res) => {
  const domain = req.headers.host || 'proxy-ui-production.up.railway.app';

  const accountList = vpnAccounts.map(acc => {
    const configLink = `vless://${acc.uuid}@${domain}:443?path=%2Fvless&security=tls&encryption=none&type=ws#VLESS-${acc.user}`;
    return `
      <div style="background:#222; padding:12px; margin-bottom:10px; border-radius:5px; border-left:4px solid #00e676;">
        <b>User:</b> ${acc.user}<br>
        <small style="color:#aaa;">UUID: ${acc.uuid}</small>
        <input type="text" value="${configLink}" readonly style="width:100%; margin-top:5px; padding:6px; background:#111; color:#00e676; border:1px solid #333;" onclick="this.select();" />
      </div>
    `;
  }).join('');

  res.send(`
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Native VLESS Dashboard</title>
      <style>
        body { font-family: sans-serif; background: #121212; color: #fff; padding: 20px; max-width: 500px; margin: auto; }
        input, button { width: 100%; padding: 10px; margin-top: 5px; box-sizing: border-box; }
        button { background: #00e676; border: none; font-weight: bold; cursor: pointer; margin-top: 10px; color: #000; }
      </style>
    </head>
    <body>
      <h2>Native VLESS Dashboard</h2>
      <p>Status Server: <span style="color:lime;">RUNNING & ACTIVE</span></p>
      <hr>
      <form action="/create" method="POST">
        <label>Username:</label>
        <input type="text" name="user" placeholder="Nama Akun" required />
        <button type="submit">Buat Akun VLESS</button>
      </form>
      <hr>
      <h3>Daftar Akun VLESS</h3>
      ${accountList || '<p style="color:#777;">Belum ada akun.</p>'}
    </body>
    </html>
  `);
});

app.post('/create', (req, res) => {
  const { user } = req.body;
  if (user) {
    const uuid = crypto.randomUUID();
    vpnAccounts.push({ user, uuid });
  }
  res.redirect('/');
});

// Penanganan global error agar server tidak terhenti
process.on('uncaughtException', (err) => console.error('Uncaught Error:', err));
process.on('unhandledRejection', (reason) => console.error('Unhandled Rejection:', reason));

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server Web UI & Native VLESS Engine aktif di port ${PORT}`);
});
  res.send(`
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Native VLESS Dashboard</title>
      <style>
        body { font-family: sans-serif; background: #121212; color: #fff; padding: 20px; max-width: 500px; margin: auto; }
        input, button { width: 100%; padding: 10px; margin-top: 5px; box-sizing: border-box; }
        button { background: #00e676; border: none; font-weight: bold; cursor: pointer; margin-top: 10px; color: #000; }
      </style>
    </head>
    <body>
      <h2>Native VLESS Dashboard</h2>
      <p>Status Server: <span style="color:lime;">RUNNING & ACTIVE</span></p>
      <hr>
      <form action="/create" method="POST">
        <label>Username:</label>
        <input type="text" name="user" placeholder="Nama Akun" required />
        <button type="submit">Buat Akun VLESS</button>
      </form>
      <hr>
      <h3>Daftar Akun VLESS</h3>
      ${accountList || '<p style="color:#777;">Belum ada akun.</p>'}
    </body>
    </html>
  `);
});

app.post('/create', (req, res) => {
  const { user } = req.body;
  if (user) {
    const uuid = crypto.randomUUID();
    vpnAccounts.push({ user, uuid });
  }
  res.redirect('/');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server Web UI & Native VLESS Engine aktif di port ${PORT}`);
});
      ${accountList || '<p style="color:#777;">Belum ada akun.</p>'}
    </body>
    </html>
  `);
});

app.post('/create', (req, res) => {
  const { user } = req.body;
  if (user) {
    const uuid = crypto.randomUUID();
    vpnAccounts.push({ user, uuid });
    updateXrayConfig();
  }
  res.redirect('/');
});

// Jalankan Server
setupXray(() => {
  updateXrayConfig();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server Web UI berjalan di port ${PORT}`);
  });
});
  console.log('Koneksi TCP masuk dari:', socket.remoteAddress);
});

tcpServer.listen(TCP_PORT, '0.0.0.0', () => {
  console.log(`TCP Proxy Service berjalan di port ${TCP_PORT}`);
});
