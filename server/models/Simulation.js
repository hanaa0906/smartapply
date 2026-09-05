const mongoose = require('mongoose');

const simulationSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  hypotheticalValues: {
    entranceScore: { type: Number, required: true },
    twelfthPercentage: { type: Number, required: true },
    extracurricularScore: { type: Number, default: 0 }
  },
  simulatedReadinessScore: {
    type: Number,
    required: true
  },
  factors: [{
    name: String,
    weight: Number,
    contribution: Number,
    explanation: String
  }],
  comparison: {
    previousScore: Number,
    newScore: Number,
    delta: Number
  },
  notes: {
    type: String,
    default: 'SIMULATION — NOT A GUARANTEE OF ADMISSION'
  }
}, { timestamps: true });

module.exports = mongoose.model('Simulation', simulationSchema);
