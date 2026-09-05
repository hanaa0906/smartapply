const Application = require('../models/Application');
const ApplicationStatusHistory = require('../models/ApplicationStatusHistory');
const StudentProfile = require('../models/StudentProfile');
const Course = require('../models/Course');
const Document = require('../models/Document');
const Notification = require('../models/Notification');
const { analyzeApplicationData } = require('../services/assistantEngine');
const { emitToUser, emitToApplication, broadcast } = require('../config/socket');

const generateAppNumber = async () => {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `SA-${year}-${randomNum}`;
};

// Real-time In-Flight Smart Assistant Validation Check
exports.checkSmartAssistant = async (req, res, next) => {
  try {
    const { courseId, academicSnapshot, documentIds } = req.body;
    const studentProfile = await StudentProfile.findOne({ userId: req.user.id });
    const course = await Course.findById(courseId);

    let uploadedDocs = [];
    if (documentIds && documentIds.length > 0) {
      uploadedDocs = await Document.find({ _id: { $in: documentIds } });
    } else {
      uploadedDocs = await Document.find({ studentId: req.user.id });
    }

    const auditResult = analyzeApplicationData({
      studentProfile,
      course,
      applicationData: { academicSnapshot },
      uploadedDocuments: uploadedDocs
    });

    res.status(200).json({
      success: true,
      audit: auditResult
    });
  } catch (error) {
    next(error);
  }
};

// Create Application (Draft or Direct Submit)
exports.createApplication = async (req, res, next) => {
  try {
    const { courseId, academicSnapshot, documentIds, status = 'SUBMITTED' } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Selected course not found.' });
    }

    // Check if student already applied for this course
    const existingApp = await Application.findOne({
      studentId: req.user.id,
      courseId,
      status: { $nin: ['REJECTED'] }
    });
    if (existingApp) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted an active application for this course.'
      });
    }

    const studentProfile = await StudentProfile.findOne({ userId: req.user.id });
    let docs = [];
    if (documentIds && documentIds.length > 0) {
      docs = await Document.find({ _id: { $in: documentIds } });
    } else {
      docs = await Document.find({ studentId: req.user.id });
    }

    // Run Smart Assistant Audit
    const assistantAudit = analyzeApplicationData({
      studentProfile,
      course,
      applicationData: { academicSnapshot },
      uploadedDocuments: docs
    });

    const applicationNumber = await generateAppNumber();

    const application = await Application.create({
      applicationNumber,
      studentId: req.user.id,
      collegeId: course.collegeId,
      courseId: course._id,
      status: status === 'DRAFT' ? 'DRAFT' : 'SUBMITTED',
      academicSnapshot: {
        twelfthPercentage: academicSnapshot?.twelfthPercentage || studentProfile?.academicInfo?.twelfth?.percentage || 80,
        tenthPercentage: academicSnapshot?.tenthPercentage || studentProfile?.academicInfo?.tenth?.percentage || 80,
        entranceScore: academicSnapshot?.entranceScore || 0,
        entranceExam: academicSnapshot?.entranceExam || 'General',
        stream: academicSnapshot?.stream || studentProfile?.academicInfo?.twelfth?.stream || 'Science (PCM)',
        subjects: academicSnapshot?.subjects || studentProfile?.academicInfo?.twelfth?.subjects || []
      },
      documents: docs.map(d => ({
        documentId: d._id,
        documentType: d.documentType,
        status: d.status,
        fileUrl: d.fileUrl
      })),
      smartAssistantAudit: assistantAudit,
      submittedAt: status === 'SUBMITTED' ? new Date() : undefined
    });

    // Record initial status history
    await ApplicationStatusHistory.create({
      applicationId: application._id,
      previousStatus: 'DRAFT',
      newStatus: application.status,
      updatedBy: req.user.id,
      remarks: 'Application created and submitted by candidate.'
    });

    // Update document references
    if (docs.length > 0) {
      await Document.updateMany(
        { _id: { $in: docs.map(d => d._id) } },
        { applicationId: application._id }
      );
    }

    // Create Notification
    const notif = await Notification.create({
      userId: req.user.id,
      applicationId: application._id,
      title: 'Application Submitted Successfully',
      message: `Your application ${application.applicationNumber} for ${course.name} has been submitted and is pending verification.`,
      type: 'STATUS_CHANGE'
    });

    emitToUser(req.user.id, 'NOTIFICATION_RECEIVED', notif);
    emitToUser(req.user.id, 'STATUS_CHANGED', {
      applicationId: application._id,
      status: application.status,
      applicationNumber: application.applicationNumber
    });
    broadcast('NEW_APPLICATION_SUBMITTED', {
      applicationId: application._id,
      courseName: course.name,
      studentName: req.user.name
    });

    res.status(201).json({
      success: true,
      message: 'Application created successfully.',
      application
    });
  } catch (error) {
    next(error);
  }
};

// Get My Applications (Student)
exports.getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ studentId: req.user.id })
      .populate('courseId', 'name code department degreeLevel durationYears feesPerYear')
      .populate('collegeId', 'name code city state logo accreditation')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    next(error);
  }
};

// Get Application Details & History
exports.getApplicationById = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('courseId')
      .populate('collegeId')
      .populate('studentId', 'name email phone avatar')
      .populate('documents.documentId');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    // Security check: only the owner or an admin can view
    if (req.user.role !== 'admin' && application.studentId._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied to this application.' });
    }

    const history = await ApplicationStatusHistory.find({ applicationId: application._id })
      .populate('updatedBy', 'name role')
      .sort({ timestamp: 1 });

    res.status(200).json({
      success: true,
      application,
      history
    });
  } catch (error) {
    next(error);
  }
};
