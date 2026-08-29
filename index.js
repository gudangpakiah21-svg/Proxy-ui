const express = require('express');
const net = require('net');
const crypto = require('crypto');
const app = express();

const WEB_PORT = 8081;
const TCP_PORT = 8881;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Database sementara untuk menyimpan akun VPN
const vpnAccounts = [];

app.get('/', (req, res) => {
  const host = req.headers.host || 'proxy-ui-production.up.railway.app';

  const accountListHtml = vpnAccounts.map(acc => `
    <div style="background: #252525; padding: 12px; margin-bottom: 10px; border-radius: 6px; border-left: 4px solid #00e676;">
      <p style="margin: 0 0 5px 0;"><b>User:</b> ${acc.user} | <b>Protocol:</b> ${acc.protocol.toUpperCase()}</p>
      <small style="color: #bbb;">UUID/Pass: ${acc.uuid}</small><br>
      <input type="text" value="${acc.configLink}" readonly style="width: 100%; margin-top: 6px; padding: 6px; background: #121212; color: #00e676; border: 1px solid #333;" onclick="this.select();" />
    </div>
  `).join('');

  res.send(`
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Proxy & VPN Dashboard</title>
      <style>
        body { font-family: sans-serif; background: #121212; color: #fff; padding: 20px; max-width: 600px; margin: auto; }
        input, select { margin: 5px 0 12px 0; padding: 10px; display: block; width: 100%; box-sizing: border-box; background: #222; color: #fff; border: 1px solid #444; border-radius: 4px; }
        button { padding: 10px 16px; background: #00e676; border: none; font-weight: bold; cursor: pointer; width: 100%; border-radius: 4px; color: #000; }
        hr { border: 0; height: 1px; background: #333; margin: 20px 0; }
      </style>
    </head>
    <body>
      <h2>Proxy & VPN Dashboard</h2>
      <p>Status Server: <span style="color:lime;">RUNNING</span></p>
      <hr>
      <h3>Buat Akun VPN Baru</h3>
      <form action="/create-vpn" method="POST">
        <label>Username Account:</label>
        <input type="text" name="user" placeholder="Contoh: user1" required />
        
        <label>Pilih Protokol VPN:</label>
        <select name="protocol">
          <option value="vless">VLESS (WS / TLS)</option>
          <option value="vmess">VMess (WS / TLS)</option>
          <option value="trojan">Trojan</option>
          <option value="socks">SOCKS5</option>
        </select>
        
        <button type="submit">Generate Akun VPN</button>
      </form>

      <hr>
      <h3>Daftar Akun & Config Link</h3>
      ${accountListHtml || '<p style="color:#888;">Belum ada akun VPN yang dibuat.</p>'}
    </body>
    </html>
  `);
});

// Penanganan submit pembuat akun VPN
app.post('/create-vpn', (req, res) => {
  const { user, protocol } = req.body;
  const domain = req.headers.host || 'proxy-ui-production.up.railway.app';
  const uuid = crypto.randomUUID();
  let configLink = '';

  // Generator Config Link berdasarkan protokol
  if (protocol === 'vless') {
    configLink = `vless://${uuid}@${domain}:443?path=%2Fvless&security=tls&encryption=none&type=ws#VLESS-${user}`;
  } else if (protocol === 'vmess') {
    const vmessJson = JSON.stringify({
      v: "2", ps: `VMess-${user}`, add: domain, port: "443", id: uuid,
      aid: "0", scy: "auto", net: "ws", type: "none", host: domain, path: "/vmess", tls: "tls"
    });
    configLink = `vmess://${Buffer.from(vmessJson).toString('base64')}`;
  } else if (protocol === 'trojan') {
    configLink = `trojan://${uuid}@${domain}:443?peer=${domain}&plugin=obfs-local%3Bobfs%3Dwebsocket#Trojan-${user}`;
  } else if (protocol === 'socks') {
    configLink = `socks5://${user}:${uuid.substring(0,8)}@${domain}:8881#SOCKS5-${user}`;
  }

  if (user) {
    vpnAccounts.push({ user, protocol, uuid, configLink });
  }

  res.redirect('/');
});

app.listen(WEB_PORT, '0.0.0.0', () => {
  console.log(`Web UI berjalan di port ${WEB_PORT}`);
});

const tcpServer = net.createServer((socket) => {
  console.log('Koneksi TCP masuk dari:', socket.remoteAddress);
});

tcpServer.listen(TCP_PORT, '0.0.0.0', () => {
  console.log(`TCP Proxy Service berjalan di port ${TCP_PORT}`);
});
