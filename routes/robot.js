// routes/robot.js
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

// untuk kontrol robot
router.post('/command', (req, res) => {
    const { action } = req.body; // e.g. 'move_forward'
    // simpan ke database atau variabel global
    // ESP akan fetch endpoint ini untuk tahu perintahnya
    global.command = action;
    res.send({ status: 'ok' });
});

// untuk diakses ESP, ambil perintah terbaru
router.get('/latest-command', (req, res) => {
    res.send({ command: global.command || 'idle' });
});

// untuk monitoring sensor
router.post('/sensor-data', (req, res) => {
    const { sensor, value } = req.body;
    // simpan ke database atau log
    // bisa dimasukkan ke tabel sensor
    res.send({ status: 'received' });
});

module.exports = router;