const mongoose = require('mongoose');

const LoginLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  loginTime: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LoginLog', LoginLogSchema);
