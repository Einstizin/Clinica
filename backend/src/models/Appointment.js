const mongoose = require('mongoose');

module.exports = mongoose.model(
  'Appointment',
  new mongoose.Schema(
    {
      patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      patientName: {
        type: String,
        default: ''
      },
      date: {
        type: Date,
        required: true
      },
      address: {
        type: String,
        default: ''
      }
    },
    {
      timestamps: true
    }
  )
);
