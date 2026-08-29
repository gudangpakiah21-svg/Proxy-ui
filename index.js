const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 8081;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

let vpnAccounts = [];

function syncXrayConfig() {
  const clients = vpnAccounts.map(acc => ({ id: acc.uuid, level: 0 }));
  // Tambahkan UUID default
  clients.push({ id: "00000000-0000-0000-0000-000000000000", level: 0 });

  const xrayConfig = {
    log: { loglevel: "warning" },
    inbounds: [{
      port: parseInt(PORT),
      protocol: "vless",
      settings: { clients, decryption: "none" },
      streamSettings: {
        network: "ws",
        wsSettings: { path: "/vless" }
      }
    }],
    outbounds: [{ protocol: "freedom" }]
  };

  fs.writeFileSync('config.json', JSON.stringify(xrayConfig, null, 2));
  exec('pkill -HUP xray || ./xray run -c config.json &');
}

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
      <title>Xray VLESS Dashboard</title>
      <style>
        body { font-family: sans-serif; background: #121212; color: #fff; padding: 20px; max-width: 500px; margin: auto; }
        input, button { width: 100%; padding: 10px; margin-top: 5px; box-sizing: border-box; }
        button { background: #00e676; border: none; font-weight: bold; cursor: pointer; margin-top: 10px; color: #000; }
      </style>
    </head>
    <body>
      <h2>Xray VLESS Dashboard</h2>
      <p>Status Core: <span style="color:lime;">RUNNING & ACTIVE</span></p>
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
    syncXrayConfig();
  }
  res.redirect('/');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server Web UI berjalan di port ${PORT}`);
});
      <p>Status Core: <span style="color:lime;">ACTIVE</span></p>
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
