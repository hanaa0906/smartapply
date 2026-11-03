const Document = require('../models/Document');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const fs = require('fs');
const { verifyDocumentFile } = require('../services/verificationEngine');
const { emitToUser, emitToApplication } = require('../config/socket');

exports.uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please attach a document file.' });
    }

    const { documentType, applicationId } = req.body;
    if (!documentType) {
      return res.status(400).json({ success: false, message: 'Document type is required.' });
    }

    if (applicationId) {
      const application = await Application.findOne({ _id: applicationId, studentId: req.user.id });
      if (!application) {
        fs.unlink(req.file.path, () => {});
        return res.status(404).json({ success: false, message: 'Application not found.' });
      }
    }

    // Run verification pipeline
    const verification = verifyDocumentFile(req.file, documentType);

    const doc = await Document.create({
      studentId: req.user.id,
      applicationId: applicationId || undefined,
      documentType,
      originalName: req.file.originalname,
      fileName: req.file.filename,
      filePath: req.file.path,
      fileUrl: '',
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      status: verification.status,
      extractedData: verification.extractedData,
      verificationIssues: verification.verificationIssues
    });

    doc.fileUrl = `/api/documents/${doc._id}/file`;
    await doc.save();

    // If attached to application, update application documents
    if (applicationId) {
      await Application.findByIdAndUpdate(applicationId, {
        $push: {
          documents: {
            documentId: doc._id,
            documentType: doc.documentType,
            status: doc.status,
            fileUrl: doc.fileUrl
          }
        }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Document uploaded. Basic file checks passed; staff verification is still required.',
      document: doc
    });
  } catch (error) {
    next(error);
  }
};

exports.downloadDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }
    if (req.user.role !== 'admin' && document.studentId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied to this document.' });
    }
    if (!fs.existsSync(document.filePath)) {
      return res.status(404).json({ success: false, message: 'Document file is unavailable.' });
    }
    res.download(document.filePath, document.originalName, (error) => {
      if (error && !res.headersSent) next(error);
    });
  } catch (error) {
    next(error);
  }
};

exports.downloadLegacyDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({ fileName: req.params.filename });
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }
    if (req.user.role !== 'admin' && document.studentId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied to this document.' });
    }
    if (!fs.existsSync(document.filePath)) {
      return res.status(404).json({ success: false, message: 'Document file is unavailable.' });
    }
    res.download(document.filePath, document.originalName, (error) => {
      if (error && !res.headersSent) next(error);
    });
  } catch (error) {
    next(error);
  }
};

exports.getDocuments = async (req, res, next) => {
  try {
    const { applicationId } = req.query;
    const query = { studentId: req.user.role === 'student' ? req.user.id : req.query.studentId || req.user.id };
    if (applicationId) query.applicationId = applicationId;

    const documents = await Document.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: documents.length,
      documents
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyDocument = async (req, res, next) => {
  try {
    const { status, adminRemarks } = req.body;
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    document.status = status;
    document.adminRemarks = adminRemarks || '';
    document.verifiedBy = req.user.id;
    document.verifiedAt = new Date();
    await document.save();

    // Notify student
    const notif = await Notification.create({
      userId: document.studentId,
      applicationId: document.applicationId,
      title: `Document ${status.replace(/_/g, ' ')}`,
      message: `Your document '${document.originalName}' has been updated to ${status}. ${adminRemarks ? 'Remarks: ' + adminRemarks : ''}`,
      type: 'DOCUMENT_ISSUE'
    });

    emitToUser(document.studentId, 'NOTIFICATION_RECEIVED', notif);
    emitToUser(document.studentId, 'DOCUMENT_STATUS_CHANGED', {
      documentId: document._id,
      status,
      adminRemarks
    });

    res.status(200).json({
      success: true,
      message: 'Document status updated.',
      document
    });
  } catch (error) {
    next(error);
  }
};
