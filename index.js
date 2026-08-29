const express = require('express');
const net = require('net');
const app = express();

// Paksa gunakan port 8081 agar sinkron dengan pengaturan Railway
const WEB_PORT = 8081;
const TCP_PORT = 8881;

app.use(express.json());

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>Proxy Dashboard</title>
      <style>
        body { font-family: sans-serif; background: #121212; color: #fff; padding: 20px; }
        input { margin: 5px 0; padding: 8px; display: block; width: 100%; max-width: 300px; }
        button { padding: 8px 16px; background: #00e676; border: none; font-weight: bold; cursor: pointer; }
      </style>
    </head>
    <body>
      <h2>Proxy Multi Protocol Dashboard</h2>
      <p>Status Server: <span style="color:lime;">RUNNING</span></p>
      <hr>
      <h3>Tambah User Proxy</h3>
      <form action="/add-user" method="POST">
        <input type="text" name="user" placeholder="Username" required />
        <input type="password" name="pass" placeholder="Password" required />
        <button type="submit">Tambah User</button>
      </form>
    </body>
    </html>
  `);
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
