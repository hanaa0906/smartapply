const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['STATUS_CHANGE', 'DOCUMENT_ISSUE', 'SCHOLARSHIP_MATCH', 'DEADLINE', 'SYSTEM'],
    default: 'SYSTEM'
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
