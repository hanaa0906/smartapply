const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  department: {
    type: String,
    required: true
  },
  degreeLevel: {
    type: String,
    enum: ['Undergraduate', 'Postgraduate', 'Diploma'],
    default: 'Undergraduate'
  },
  durationYears: {
    type: Number,
    default: 4
  },
  totalSeats: {
    type: Number,
    required: true,
    default: 60
  },
  availableSeats: {
    type: Number,
    required: true,
    default: 60
  },
  feesPerYear: {
    type: Number,
    required: true,
    default: 120000
  },
  eligibilityCriteria: {
    minTwelfthPercentage: {
      type: Number,
      required: true,
      default: 60
    },
    requiredSubjects: {
      type: [String],
      default: ['Mathematics', 'Physics']
    },
    minEntranceScore: {
      type: Number,
      default: 0
    },
    streamAllowed: {
      type: [String],
      default: ['Science (PCM)']
    }
  },
  careerProspects: {
    type: [String],
    default: []
  },
  description: {
    type: String,
    default: ''
  },
  syllabusHighlights: {
    type: [String],
    default: []
  },
  applicationDeadline: {
    type: Date,
    default: () => new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
