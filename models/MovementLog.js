const mongoose = require('mongoose');

const movementLogSchema = new mongoose.Schema({
  timestamp: String,
  action: String,
  distance: Number,
  systemStatus: String,
  led: String 
});

module.exports = mongoose.model('MovementLog', movementLogSchema);
