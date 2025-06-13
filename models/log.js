const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true
  },
  servo1: Number,
  servo2: Number,
  servo3: Number,
  servo4: Number,
  distance: Number, // dari sensor ultrasonik (dalam cm)
  lampStatus: {
    type: String,
    enum: ['ON', 'OFF'],
    default: 'OFF'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Log', logSchema);
