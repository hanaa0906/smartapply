const mongoose = require('mongoose');

const scholarshipSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  provider: {
    type: String,
    required: true
  },
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College'
  },
  description: {
    type: String,
    default: ''
  },
  amountPerYear: {
    type: Number,
    required: true
  },
  deadline: {
    type: Date,
    required: true
  },
  eligibilityRules: {
    minPercentage: { type: Number, default: 75 },
    maxAnnualIncome: { type: Number, default: 600000 },
    eligibleCategories: { type: [String], default: ['General', 'OBC', 'SC', 'ST', 'EWS'] },
    requiredStream: { type: [String], default: [] },
    genderRestriction: { type: String, enum: ['All', 'Female', 'Male'], default: 'All' }
  },
  requiredDocuments: {
    type: [String],
    default: ['12th_marksheet', 'income_certificate']
  },
  totalSlots: {
    type: Number,
    default: 50
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Scholarship', scholarshipSchema);
