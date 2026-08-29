const express = require('express');
const net = require('net');
const app = express();

const WEB_PORT = 8081;
const TCP_PORT = 8881;

// Middleware wajib untuk membaca data dari formulir HTML (POST)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Database sederhana di memori untuk menyimpan user
const users = [];

// Route untuk menampilkan halaman utama Web UI
app.get('/', (req, res) => {
  let userListHtml = users.map(u => `<li>Username: <b>${u.user}</b> | Password: <b>${u.pass}</b></li>`).join('');

  res.send(`
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Proxy Dashboard</title>
      <style>
        body { font-family: sans-serif; background: #121212; color: #fff; padding: 20px; }
        input { margin: 5px 0; padding: 8px; display: block; width: 100%; max-width: 300px; box-sizing: border-box; }
        button { padding: 8px 16px; background: #00e676; border: none; font-weight: bold; cursor: pointer; margin-top: 5px; }
        ul { background: #1e1e1e; padding: 15px 30px; border-radius: 5px; max-width: 300px; }
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
      <hr>
      <h3>Daftar User</h3>
      <ul>
        ${userListHtml || '<li>Belum ada user.</li>'}
      </ul>
    </body>
    </html>
  `);
});

// Route penangan tombol submit form (POST /add-user)
app.post('/add-user', (req, res) => {
  const { user, pass } = req.body;
  
  if (user && pass) {
    users.push({ user, pass });
    console.log(`User berhasil ditambahkan: ${user}`);
  }
  
  // Kembalikan pengguna ke halaman utama
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
