const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

const User = require('./models/User');
const LoginLog = require('./models/loginLog');
const MovementLog = require('./models/MovementLog');
const apiRoutes = require('./routes/api');

dotenv.config(); // 🔑 Load .env

const app = express();

// ✅ Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: 'rahasia_arm_robot',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// ✅ Static files
app.use(express.static(path.join(__dirname, 'public')));

// ✅ MongoDB Atlas Connection
mongoose.connect('mongodb+srv://garneta:garneta@cluster0.47428h6.mongodb.net/armrobot?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("✅ MongoDB terhubung");
}).catch(err => {
  console.error("❌ Koneksi MongoDB gagal:", err.message);
});

// 🔒 Middleware proteksi
function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  next();
}

// ✅ Routing halaman
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'landing.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Username atau password salah" });
    }

    req.session.userId = user._id;
    req.session.username = user.username;

    const loginLog = new LoginLog({
      userId: user._id,
      username: user.username,
    });
    await loginLog.save();

    res.status(200).json({ message: "Login berhasil" });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ message: "Terjadi kesalahan saat login" });
  }
});

app.get('/about.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

app.get('/dashboard', requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});
app.get('/dashboard.html', (req, res) => {
  return res.redirect('/dashboard');
});


app.get('/controller', requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'controller.html'));
});
app.get('/controller.html', (req, res) => {
  return res.redirect('/controller');
});

app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).send("Error logging out");
    res.redirect('/');
  });
});

// ✅ Endpoint API: Ambil Log Pergerakan
app.get('/api/movement-log', async (req, res) => {
  try {
    const logs = await MovementLog.find()
      .sort({ timestamp: -1 })
      .limit(50);
    res.json(logs);
  } catch (err) {
    console.error("❌ Gagal mengambil log:", err.message);
    res.status(500).json({ error: 'Gagal mengambil log' });
  }
});

// ✅ Endpoint API: Simpan Log Pergerakan
app.post('/api/movement-log', async (req, res) => {
  try {
    const { timestamp, action, distance, systemStatus, led } = req.body;
    if (!timestamp || !action) {
      return res.status(400).json({ error: 'Data log tidak lengkap' });
    }

    const log = new MovementLog({
      timestamp,
      action,
      distance: distance || 0,
      systemStatus: systemStatus || 'Running',
      led: led || 'Merah'
    });
    await log.save();

    res.status(201).json({ message: 'Log berhasil disimpan' });
  } catch (err) {
    console.error("❌ Gagal menyimpan log:", err.message);
    res.status(500).json({ error: 'Gagal menyimpan log' });
  }
});

// ✅ Routing API
app.use('/api', apiRoutes); // <- ini penting agar /api/movement-log dan lainnya aktif

// 🔁 Fallback
app.use((req, res) => {
  res.status(404).send("Halaman tidak ditemukan");
});

// ✅ Jalankan Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server berjalan di http://0.0.0.0:${PORT}`);
});
