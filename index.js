const express = require('express');
const net = require('net');
const app = express();

// Menggunakan PORT bawaan Railway (biasanya 3000/8000)
const WEB_PORT = process.env.PORT || 8081;
const TCP_PORT = 8881;

app.use(express.json());

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>Proxy Dashboard</title></head>
    <body style="font-family:sans-serif; background:#121212; color:#fff; padding:20px;">
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

app.listen(WEB_PORT, () => {
  console.log(`Web UI berjalan di port ${WEB_PORT}`);
});

const tcpServer = net.createServer((socket) => {
  console.log('Koneksi TCP masuk dari:', socket.remoteAddress);
});

tcpServer.listen(TCP_PORT, () => {
  console.log(`TCP Proxy Service berjalan di port ${TCP_PORT}`);
});
