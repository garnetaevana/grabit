const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');

console.log("Menghubungkan ke MongoDB...");
mongoose.connect('mongodb://localhost:27017/armrobot', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("Terhubung ke MongoDB!");
  return createAdmin();
}).catch(err => {
  console.error("Gagal koneksi:", err.message);
});

const createAdmin = async () => {
  try {
    const username = 'admin';
    const password = await bcrypt.hash('admin123', 10);
    
    console.log("Isi User:", User);
    console.log("Tipe User:", typeof User);
    console.log("Isi User:", User);
    const user = new User({ username, password });
    await user.save();

    console.log('User admin berhasil dibuat!');
  } catch (err) {
    console.error('Gagal membuat user admin:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log("Koneksi MongoDB ditutup.");
  }
};
