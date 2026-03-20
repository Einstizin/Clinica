const mongoose = require('mongoose');

module.exports = mongoose.model(
  'User',
  new mongoose.Schema({
    name: String,
    email: {
      type: String,
      unique: true
    },
    password: String,
    role: {
      type: String,
      enum: ['paciente', 'secretario'],
      default: 'paciente'
    },
    emailVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationToken: {
      type: String,
      default: null
    }
  })
);
