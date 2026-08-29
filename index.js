const express = require('express');
const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 8081;
const XRAY_EXEC = path.join(__dirname, 'xray');
const CONFIG_PATH = path.join(__dirname, 'config.json');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Database akun di memori
let vpnAccounts = [];

// 1. Fungsi Mengunduh Xray Binary jika belum ada
function setupXray(callback) {
  if (fs.existsSync(XRAY_EXEC)) {
    console.log('Xray core sudah siap.');
    return callback();
  }

  console.log('Mengunduh Xray core...');
  const downloadCmd = `curl -L -H "User-Agent: Mozilla/5.0" -o xray.zip https://github.com/XTLS/Xray-core/releases/latest/download/Xray-linux-64.zip && unzip -o xray.zip xray && chmod +x xray && rm xray.zip`;

  exec(downloadCmd, (err) => {
    if (err) {
      console.error('Gagal mengunduh Xray:', err);
    } else {
      console.log('Xray core berhasil diunduh!');
      callback();
    }
  });
}

// 2. Fungsi Menulis Config Xray & Restart Engine
function updateXrayConfig() {
  const inbounds = [
    {
      port: parseInt(PORT),
      protocol: "vless",
      settings: {
        clients: vpnAccounts.map(a => ({ id: a.uuid, level: 0 })),
        decryption: "none"
      },
      streamSettings: {
        network: "ws",
        wsSettings: { path: "/vless" }
      }
    }
  ];

  const xrayConfig = {
    log: { loglevel: "warning" },
    inbounds: inbounds,
    outbounds: [{ protocol: "freedom" }]
  };

  fs.writeFileSync(CONFIG_PATH, JSON.stringify(xrayConfig, null, 2));

  // Jalankan Xray jika binary tersedia
  if (fs.existsSync(XRAY_EXEC)) {
    exec("pkill xray", () => {
      const xrayProcess = spawn(XRAY_EXEC, ['run', '-c', CONFIG_PATH]);
      xrayProcess.stdout.on('data', data => console.log(`[Xray] ${data}`));
      xrayProcess.stderr.on('data', data => console.error(`[Xray Error] ${data}`));
    });
  }
}

// 3. Tampilan Dashboard
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
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Xray VLESS Dashboard</title>
      <style>
        body { font-family: sans-serif; background: #121212; color: #fff; padding: 20px; max-width: 500px; margin: auto; }
        input, button { width: 100%; padding: 10px; margin-top: 5px; box-sizing: border-box; }
        button { background: #00e676; border: none; font-weight: bold; cursor: pointer; margin-top: 10px; }
      </style>
    </head>
    <body>
      <h2>Xray VLESS Dashboard</h2>
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
