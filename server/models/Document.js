const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    index: true
  },
  documentType: {
    type: String,
    enum: [
      '10th_marksheet',
      '12th_marksheet',
      'id_proof',
      'transfer_certificate',
      'community_certificate',
      'income_certificate',
      'passport_photo',
      'other'
    ],
    required: true
  },
  originalName: { type: String, required: true },
  fileName: { type: String, required: true },
  filePath: { type: String, required: true },
  fileUrl: { type: String, required: true },
  mimeType: { type: String, required: true },
  fileSize: { type: Number, required: true },
  status: {
    type: String,
    enum: ['UPLOADED', 'PROCESSING', 'VERIFIED', 'FLAGGED', 'CORRECTION_REQUIRED'],
    default: 'UPLOADED',
    index: true
  },
  extractedData: {
    percentage: { type: Number },
    name: { type: String },
    rollNumber: { type: String },
    board: { type: String },
    year: { type: Number },
    dob: { type: String },
    confidenceScore: { type: Number, default: 0.92 }
  },
  verificationIssues: [{
    issueType: { type: String },
    description: { type: String },
    severity: { type: String, enum: ['INFO', 'WARNING', 'CRITICAL'], default: 'WARNING' }
  }],
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: { type: Date },
  adminRemarks: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);
