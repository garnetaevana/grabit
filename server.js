const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const User = require('./models/User');

const app = express();

// Middleware static untuk landing dan login (boleh diakses publik)
app.use(express.static(path.join(__dirname, 'public')));

// Middleware parsing body dan session
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: 'rahasia_arm_robot',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// Koneksi ke MongoDB
mongoose.connect('mongodb://localhost:27017/armrobot', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("✅ MongoDB terhubung");
}).catch(err => {
  console.error("❌ Koneksi MongoDB gagal:", err.message);
});

// 🔒 Middleware untuk proteksi halaman yang butuh login
function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  next();
}

// ✅ Landing Page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'landing.html'));
});

// ✅ Halaman Login
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// ✅ Proses Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Username atau password salah" });
  }

  req.session.userId = user._id;
  req.session.username = user.username;
  res.status(200).json({ message: "Login berhasil" });
});

// ✅ Halaman About (bebas diakses)
app.get('/about.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

// ✅ Halaman Dashboard (diproteksi)
app.get('/dashboard', requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

// 🔒 Blok akses langsung ke /dashboard.html
app.get('/dashboard.html', (req, res) => {
  return res.redirect('/dashboard');
});

// ✅ Halaman Controller (diproteksi)
app.get('/controller', requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'controller.html'));
});

// 🔒 Blok akses langsung ke /controller.html
app.get('/controller.html', (req, res) => {
  return res.redirect('/controller');
});

// ✅ Logout
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).send("Error logging out");
    res.redirect('/'); // akan mengarah ke landing.html lewat route '/'
  });
});

// 🔁 Fallback 404 untuk route tidak ditemukan
app.use((req, res, next) => {
  res.status(404).send("Halaman tidak ditemukan");
});

// ✅ Jalankan Server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});
