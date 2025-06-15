const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Skema log
const logSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  action: String,
  servo1: Number,
  servo2: Number,
  servo3: Number,
  servo4: Number
});

const Log = mongoose.model('Log', logSchema);

// Simpan log (dipanggil dari controller)
router.post('/log', async (req, res) => {
  try {
    const log = new Log(req.body);
    await log.save();
    res.status(201).json({ message: 'Log saved' });
  } catch (err) {
    res.status(500).json({ message: 'Error saving log', error: err });
  }
});

// Ambil semua log (untuk dashboard)
router.get('/log', async (req, res) => {
  try {
    const logs = await Log.find().sort({ timestamp: -1 }).limit(100);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving logs', error: err });
  }
});

module.exports = router;
