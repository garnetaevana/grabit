const express = require('express');
const router = express.Router();
const MovementLog = require('../models/MovementLog');
const mongoose = require('mongoose');

// ✅ Sensor & perintah model opsional (jika belum ada model-nya, tetap pakai mongoose langsung)
const Sensor = mongoose.model('Sensor', new mongoose.Schema({}, { strict: false }));
const Perintah = mongoose.model('Perintah', new mongoose.Schema({
  deviceId: String,
  command: String,
  waktu: { type: Date, default: Date.now }
}));

// ✅ Simpan log pergerakan dari dashboard
router.post('/movement-log', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Pesan log kosong' });
    }

    const log = new MovementLog({ message });
    await log.save();

    res.status(201).json({ message: 'Log berhasil disimpan' });
  } catch (err) {
    console.error("❌ Gagal menyimpan log:", err.message);
    res.status(500).json({ error: 'Gagal menyimpan log' });
  }
});

// ✅ Ambil semua movement log
router.get('/movement-log', async (req, res) => {
  try {
    const logs = await MovementLog.find().sort({ timestamp: -1 }).limit(100);
    res.json(logs);
  } catch (err) {
    console.error("❌ Gagal mengambil log:", err.message);
    res.status(500).json({ error: 'Gagal mengambil log' });
  }
});

// ✅ Terima data sensor
router.post('/robot/sensor-data', async (req, res) => {
  try {
    const { sensor, value } = req.body;
    if (!sensor || value === undefined) {
      return res.status(400).json({ error: 'Data sensor tidak lengkap' });
    }

    const data = new Sensor({ sensor, value, waktu: new Date() });
    await data.save();
    res.json({ message: 'Sensor data saved' });
  } catch (err) {
    console.error("❌ Gagal kirim data sensor:", err.message);
    res.status(500).send('Gagal kirim data sensor');
  }
});

// ✅ Ambil perintah terakhir berdasarkan deviceId
router.get('/robot/latest-command', async (req, res) => {
  try {
    const perintah = await Perintah.findOne().sort({ waktu: -1 });
    if (perintah) {
      res.send(perintah.command);
    } else {
      res.send("");
    }
  } catch (err) {
    console.error("❌ Gagal ambil perintah:", err.message);
    res.status(500).send('Gagal ambil perintah');
  }
});

router.post('/robot/send-command', async (req, res) => {
  try {
    const { command } = req.body;
    if (!command) {
      return res.status(400).json({ error: 'Perintah kosong' });
    }

    const data = new Perintah({ command, waktu: new Date() });
    await data.save();
    res.json({ message: 'Perintah berhasil disimpan' });
  } catch (err) {
    console.error("❌ Gagal simpan perintah:", err.message);
    res.status(500).send('Gagal simpan perintah');
  }
});

// ✅ Ambil sensor terakhir untuk controller (realtime polling)
router.get('/robot/latest-sensor', async (req, res) => {
  try {
    const sensor = await Sensor.findOne().sort({ waktu: -1 });

    // Pastikan format JSON sesuai ekspektasi frontend-mu
    res.json({
      distance: sensor?.value?.distance ?? 0,
      ledRed: sensor?.value?.ledRed ?? false,
      ledYellow: sensor?.value?.ledYellow ?? false,
      ledGreen: sensor?.value?.ledGreen ?? false
    });
  } catch (err) {
    res.status(500).send('Error retrieving latest sensor data');
  }
});


module.exports = router;
