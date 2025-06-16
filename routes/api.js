const express = require('express');
const router = express.Router();
const MovementLog = require('../models/MovementLog');
const mongoose = require('mongoose');

// ✅ Sensor & perintah model opsional (jika belum ada model-nya, tetap pakai mongoose langsung)
const Sensor = mongoose.model('Sensor', new mongoose.Schema({}, { strict: false }));
const Perintah = mongoose.model('Perintah', new mongoose.Schema({
  deviceId: String,
  command: {
    s1: Number,
    s2: Number,
    s3: Number,
    s4: Number
  },
  waktu: { type: Date, default: Date.now }
}));

// ✅ Simpan trigger status
const Trigger = mongoose.model('Trigger', new mongoose.Schema({
  commandId: String,
  status: String,
  timestamp: { type: Date, default: Date.now }
}));

// ✅ Simpan log pergerakan dari dashboard
router.post('/movement-log', async (req, res) => {
  try {
    const { timestamp, action, distance, systemStatus, led } = req.body;
    const log = new MovementLog({ timestamp: newDate(), action, distance, systemStatus, led });
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
    res.status(500).json({ error: 'Gagal mengambil log' });
  }
});

// ✅ Terima data sensor
router.post('/movement-log', async (req, res) => {
  try {
    const { timestamp, action, distance, systemStatus, led } = req.body;
    if (!action) {
      return res.status(400).json({ error: 'Action kosong' });
    }
    const log = new MovementLog({ timestamp, action, distance, systemStatus, led });
    await log.save();
    res.status(201).json({ message: 'Log berhasil disimpan' });
  } catch (err) {
    res.status(500).json({ error: 'Gagal menyimpan log' });
  }
});

// ✅ Ambil perintah terakhir berdasarkan deviceId
router.get('/robot/latest-command', async (req, res) => {
  try {
    const perintah = await Perintah.findOne().sort({ waktu: -1 });
    if (perintah) {
      res.json({ 
        command: perintah.command,
        commandId: perintah.commandId 
      });
    } else {
      res.json({ command: null, commandId: null });
    }
  } catch (err) {
    console.error("❌ Gagal ambil perintah:", err.message);
    res.status(500).json({ error: 'Gagal ambil perintah' });
  }
});

router.post('/robot/send-command', async (req, res) => {
  try {
    const { command } = req.body;
    if (!command) {
      return res.status(400).json({ error: 'Perintah kosong' });
    }

    const commandId = new mongoose.Types.ObjectId().toString();
    const data = new Perintah({ 
      commandId,
      command, 
      waktu: new Date() 
    });
    await data.save();
    res.json({ 
      message: 'Perintah berhasil disimpan',
      commandId: commandId 
    });
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
      action: sensor?.value?.action ?? "Idle",
      systemStatus: sensor?.value?.systemStatus ?? "Offline",
      distance: sensor?.value?.distance ?? 0,
      ledRed: sensor?.value?.ledRed ?? false,
      ledYellow: sensor?.value?.ledYellow ?? false,
      ledGreen: sensor?.value?.ledGreen ?? false
    });
  } catch (err) {
    res.status(500).send('Error retrieving latest sensor data');
  }
});

// ✅ Endpoint untuk trigger
router.post('/robot/trigger', async (req, res) => {
  try {
    const { commandId, status } = req.body;
    const trigger = new Trigger({ commandId, status });
    await trigger.save();
    res.json({ message: 'Trigger received' });
  } catch (err) {
    console.error("❌ Gagal simpan trigger:", err.message);
    res.status(500).json({ error: 'Gagal simpan trigger' });
  }
});

module.exports = router;
