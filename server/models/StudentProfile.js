const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  personalInfo: {
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['Male', 'Female', 'Non-Binary', 'Other', 'Prefer not to say'] },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    pincode: { type: String, default: '' },
    guardianName: { type: String, default: '' },
    guardianPhone: { type: String, default: '' },
    guardianOccupation: { type: String, default: '' },
    annualFamilyIncome: { type: Number, default: 0 },
    category: { type: String, enum: ['General', 'OBC', 'SC', 'ST', 'EWS'], default: 'General' },
    bloodGroup: { type: String, default: '' }
  },
  academicInfo: {
    tenth: {
      board: { type: String, default: 'CBSE' },
      schoolName: { type: String, default: '' },
      passingYear: { type: Number, default: 2022 },
      percentage: { type: Number, default: 0 },
      rollNumber: { type: String, default: '' }
    },
    twelfth: {
      board: { type: String, default: 'CBSE' },
      schoolName: { type: String, default: '' },
      passingYear: { type: Number, default: 2024 },
      percentage: { type: Number, default: 0 },
      rollNumber: { type: String, default: '' },
      stream: { type: String, enum: ['Science (PCM)', 'Science (PCB)', 'Commerce', 'Arts', 'Vocational'], default: 'Science (PCM)' },
      subjects: [{
        name: { type: String, required: true },
        marks: { type: Number, required: true },
        maxMarks: { type: Number, default: 100 }
      }]
    },
    entranceExams: [{
      examName: { type: String, required: true },
      rollNumber: { type: String, default: '' },
      score: { type: Number, default: 0 },
      percentile: { type: Number, default: 0 },
      rank: { type: Number, default: 0 },
      year: { type: Number, default: 2024 }
    }]
  },
  skills: {
    type: [String],
    default: []
  },
  interests: {
    type: [String],
    default: []
  },
  careerGoals: {
    type: [String],
    default: []
  },
  coursePreferences: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  achievements: {
    type: [String],
    default: []
  },
  completionPercentage: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
