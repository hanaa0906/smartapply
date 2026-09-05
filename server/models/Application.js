const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  applicationNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: true,
    index: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: [
      'DRAFT',
      'SUBMITTED',
      'DOCUMENT_VERIFICATION',
      'CORRECTION_REQUIRED',
      'ACADEMIC_REVIEW',
      'INTERVIEW',
      'WAITLISTED',
      'APPROVED',
      'REJECTED',
      'ENROLLED'
    ],
    default: 'DRAFT',
    index: true
  },
  academicSnapshot: {
    twelfthPercentage: { type: Number, required: true },
    tenthPercentage: { type: Number, required: true },
    entranceScore: { type: Number, default: 0 },
    entranceExam: { type: String, default: 'General' },
    stream: { type: String, default: 'Science (PCM)' },
    subjects: [{
      name: String,
      marks: Number,
      maxMarks: Number
    }]
  },
  documents: [{
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
    documentType: String,
    status: { type: String, default: 'UPLOADED' },
    fileUrl: String,
    remarks: String
  }],
  smartAssistantAudit: {
    mismatches: [{
      field: String,
      claimed: mongoose.Schema.Types.Mixed,
      detected: mongoose.Schema.Types.Mixed,
      explanation: String,
      severity: { type: String, enum: ['INFO', 'WARNING', 'CRITICAL'], default: 'WARNING' }
    }],
    missingFields: [String],
    flags: [String],
    scoreConsistency: { type: Boolean, default: true },
    overallCheckStatus: { type: String, enum: ['CLEAN', 'ATTENTION_NEEDED', 'ACTION_REQUIRED'], default: 'CLEAN' }
  },
  adminRemarks: {
    type: String,
    default: ''
  },
  correctionRequests: [{
    field: String,
    message: String,
    requestedAt: { type: Date, default: Date.now },
    resolved: { type: Boolean, default: false }
  }],
  interviewSchedule: {
    date: Date,
    mode: { type: String, enum: ['Online', 'In-Person'], default: 'Online' },
    link: String,
    notes: String
  },
  submittedAt: { type: Date },
  decidedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);
