const Application = require('../models/Application');
const ApplicationStatusHistory = require('../models/ApplicationStatusHistory');
const Course = require('../models/Course');
const Document = require('../models/Document');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const { runFairnessAudit } = require('../services/fairnessEngine');
const { simulatePolicyScenario } = require('../services/policyEngine');
const { emitToUser, emitToApplication, broadcast } = require('../config/socket');

// Dashboard Overview Metrics
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalApplications = await Application.countDocuments();
    const newSubmitted = await Application.countDocuments({ status: 'SUBMITTED' });
    const pendingVerification = await Application.countDocuments({ status: 'DOCUMENT_VERIFICATION' });
    const correctionRequired = await Application.countDocuments({ status: 'CORRECTION_REQUIRED' });
    const underAcademicReview = await Application.countDocuments({ status: 'ACADEMIC_REVIEW' });
    const approved = await Application.countDocuments({ status: 'APPROVED' });
    const waitlisted = await Application.countDocuments({ status: 'WAITLISTED' });
    const rejected = await Application.countDocuments({ status: 'REJECTED' });
    const enrolled = await Application.countDocuments({ status: 'ENROLLED' });

    // Aggregations: Applications per course
    const appsPerCourse = await Application.aggregate([
      {
        $group: {
          _id: '$courseId',
          count: { $sum: 1 },
          approvedCount: {
            $sum: { $cond: [{ $in: ['$status', ['APPROVED', 'ENROLLED']] }, 1, 0] }
          }
        }
      },
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: '_id',
          as: 'course'
        }
      },
      { $unwind: '$course' },
      {
        $project: {
          courseName: '$course.name',
          courseCode: '$course.code',
          department: '$course.department',
          totalSeats: '$course.totalSeats',
          applicationsCount: '$count',
          approvedCount: 1
        }
      }
    ]);

    // Aggregations: Applications by status breakdown
    const statusBreakdown = [
      { status: 'Submitted', count: newSubmitted, color: '#6366f1' },
      { status: 'Doc Verification', count: pendingVerification, color: '#f59e0b' },
      { status: 'Academic Review', count: underAcademicReview, color: '#3b82f6' },
      { status: 'Correction Req', count: correctionRequired, color: '#ef4444' },
      { status: 'Waitlisted', count: waitlisted, color: '#8b5cf6' },
      { status: 'Approved', count: approved, color: '#10b981' },
      { status: 'Enrolled', count: enrolled, color: '#059669' },
      { status: 'Rejected', count: rejected, color: '#64748b' }
    ];

    res.status(200).json({
      success: true,
      stats: {
        totalApplications,
        newSubmitted,
        pendingVerification,
        correctionRequired,
        underAcademicReview,
        approved,
        waitlisted,
        rejected,
        enrolled,
        approvalRate: totalApplications > 0 ? Number(((approved + enrolled) / totalApplications * 100).toFixed(1)) : 0
      },
      appsPerCourse,
      statusBreakdown
    });
  } catch (error) {
    next(error);
  }
};

// Filterable Applications Table
exports.getApplications = async (req, res, next) => {
  try {
    const { status, courseId, search } = req.query;
    const query = {};

    if (status && status !== 'ALL') {
      query.status = status;
    }
    if (courseId) {
      query.courseId = courseId;
    }

    let applications = await Application.find(query)
      .populate('studentId', 'name email phone avatar')
      .populate('courseId', 'name code department degreeLevel')
      .populate('collegeId', 'name code city')
      .sort({ updatedAt: -1 });

    if (search) {
      const s = search.toLowerCase();
      applications = applications.filter(app =>
        app.applicationNumber.toLowerCase().includes(s) ||
        app.studentId?.name?.toLowerCase().includes(s) ||
        app.studentId?.email?.toLowerCase().includes(s) ||
        app.courseId?.name?.toLowerCase().includes(s)
      );
    }

    res.status(200).json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    next(error);
  }
};

// Admin Application Status Transition with Audit Trail & Real-time Socket Event
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, remarks, interviewSchedule } = req.body;
    const application = await Application.findById(req.params.id)
      .populate('courseId', 'name code')
      .populate('studentId', 'name email');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    const previousStatus = application.status;
    application.status = status;
    if (remarks) application.adminRemarks = remarks;
    if (interviewSchedule) application.interviewSchedule = interviewSchedule;
    if (['APPROVED', 'REJECTED', 'ENROLLED'].includes(status)) {
      application.decidedAt = new Date();
    }

    await application.save();

    // Create Status History
    await ApplicationStatusHistory.create({
      applicationId: application._id,
      previousStatus,
      newStatus: status,
      updatedBy: req.user.id,
      remarks: remarks || `Status moved from ${previousStatus} to ${status}`
    });

    // Create Audit Log
    await AuditLog.create({
      actorId: req.user.id,
      action: 'UPDATE_APPLICATION_STATUS',
      entityType: 'Application',
      entityId: application._id.toString(),
      details: { previousStatus, newStatus: status, remarks }
    });

    // Friendly message for student notification
    const statusMessages = {
      SUBMITTED: 'Your application has been received and queued.',
      DOCUMENT_VERIFICATION: 'Your application has moved to Document Verification.',
      CORRECTION_REQUIRED: 'Action required: Document corrections have been requested by the admission office.',
      ACADEMIC_REVIEW: 'Your academic profile and subject qualifications are currently under evaluation.',
      INTERVIEW: 'You have been shortlisted for an admission interview. Please check the schedule details.',
      WAITLISTED: 'Your application is currently waitlisted for upcoming seat allotments.',
      APPROVED: 'Congratulations! Your application has been APPROVED for admission.',
      REJECTED: 'Your application decision is updated: not offered admission at this time.',
      ENROLLED: 'Congratulations! Your enrollment registration is complete. Welcome to campus!'
    };

    const friendlyMessage = statusMessages[status] || `Your application status changed to ${status}.`;

    const notif = await Notification.create({
      userId: application.studentId._id,
      applicationId: application._id,
      title: `Application Status: ${status.replace(/_/g, ' ')}`,
      message: `${friendlyMessage} ${remarks ? 'Remarks: ' + remarks : ''}`,
      type: 'STATUS_CHANGE'
    });

    // Real-Time Socket Dispatch
    emitToUser(application.studentId._id.toString(), 'NOTIFICATION_RECEIVED', notif);
    emitToUser(application.studentId._id.toString(), 'STATUS_CHANGED', {
      applicationId: application._id,
      previousStatus,
      newStatus: status,
      remarks,
      timestamp: new Date()
    });
    emitToApplication(application._id.toString(), 'STATUS_CHANGED', {
      applicationId: application._id,
      previousStatus,
      newStatus: status,
      remarks,
      timestamp: new Date()
    });

    res.status(200).json({
      success: true,
      message: `Status updated to ${status}.`,
      application
    });
  } catch (error) {
    next(error);
  }
};

// Admin Fairness Audit
exports.getFairnessAudit = async (req, res, next) => {
  try {
    const auditData = await runFairnessAudit(Application, Course);
    res.status(200).json({
      success: true,
      audit: auditData
    });
  } catch (error) {
    next(error);
  }
};

// Admin Policy Simulator
exports.runPolicySimulation = async (req, res, next) => {
  try {
    const { courseId, simulatedSeats, simulatedCutoff, deadlineExtensionDays } = req.body;
    if (!courseId) {
      return res.status(400).json({ success: false, message: 'Please select a course to simulate.' });
    }

    const simulationResult = await simulatePolicyScenario(Course, Application, {
      courseId,
      simulatedSeats,
      simulatedCutoff,
      deadlineExtensionDays
    });

    res.status(200).json({
      success: true,
      result: simulationResult
    });
  } catch (error) {
    next(error);
  }
};

// Deep Analytics Endpoint
exports.getAnalytics = async (req, res, next) => {
  try {
    // Pipeline 1: Applications by Stream
    const streamDistribution = await Application.aggregate([
      {
        $group: {
          _id: '$academicSnapshot.stream',
          count: { $sum: 1 },
          avgTwelfth: { $avg: '$academicSnapshot.twelfthPercentage' }
        }
      },
      {
        $project: {
          stream: { $ifNull: ['$_id', 'General'] },
          count: 1,
          avgTwelfth: { $round: ['$avgTwelfth', 1] }
        }
      }
    ]);

    // Pipeline 2: Conversion Funnel
    const total = await Application.countDocuments();
    const verified = await Application.countDocuments({ status: { $in: ['ACADEMIC_REVIEW', 'INTERVIEW', 'WAITLISTED', 'APPROVED', 'ENROLLED'] } });
    const reviewed = await Application.countDocuments({ status: { $in: ['INTERVIEW', 'WAITLISTED', 'APPROVED', 'ENROLLED'] } });
    const approved = await Application.countDocuments({ status: { $in: ['APPROVED', 'ENROLLED'] } });
    const enrolled = await Application.countDocuments({ status: 'ENROLLED' });

    const funnel = [
      { stage: 'Applications Submitted', count: total },
      { stage: 'Documents Verified', count: verified },
      { stage: 'Academic Evaluated', count: reviewed },
      { stage: 'Admission Granted', count: approved },
      { stage: 'Final Enrolled', count: enrolled }
    ];

    res.status(200).json({
      success: true,
      streamDistribution,
      funnel
    });
  } catch (error) {
    next(error);
  }
};
