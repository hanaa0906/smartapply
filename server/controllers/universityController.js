const crypto = require('crypto');
const College = require('../models/College');
const Course = require('../models/Course');
const Application = require('../models/Application');
const ApplicationStatusHistory = require('../models/ApplicationStatusHistory');
const StudentProfile = require('../models/StudentProfile');
const Document = require('../models/Document');
const Notification = require('../models/Notification');
const directory = require('../services/universityDirectory');
const { analyzeApplicationData } = require('../services/assistantEngine');
const { emitToUser, broadcastToAdmins } = require('../config/socket');

const MAX_PER_BATCH = 10;
const ALL_STREAMS = ['Science (PCM)', 'Science (PCB)', 'Commerce', 'Arts', 'Vocational'];
const DEGREE_LEVELS = ['Undergraduate', 'Postgraduate', 'Diploma'];

// Browse the worldwide directory: filter by region, country and search text
exports.listUniversities = async (req, res, next) => {
  try {
    const { region, country, search, page, limit } = req.query;
    const result = await directory.search({ region, country, q: search, page, limit });
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

// Region and country counts plus sync status for the directory
exports.getDirectoryMeta = async (req, res, next) => {
  try {
    const meta = await directory.getMeta();
    res.status(200).json({ success: true, ...meta });
  } catch (error) {
    next(error);
  }
};

const uniqueAppNumber = async () => {
  const year = new Date().getFullYear();
  for (let i = 0; i < 8; i++) {
    const candidate = `SA-${year}-${Math.floor(10000 + Math.random() * 90000)}`;
    if (!(await Application.exists({ applicationNumber: candidate }))) return candidate;
  }
  return `SA-${year}-${Date.now().toString().slice(-7)}`;
};

// One-stop application: one profile, one request, many universities
exports.applyToUniversities = async (req, res, next) => {
  try {
    const { universityKeys, program, degreeLevel } = req.body;
    const programName = String(program || '').trim().slice(0, 80);

    if (!Array.isArray(universityKeys) || universityKeys.length === 0) {
      return res.status(400).json({ success: false, message: 'Shortlist at least one university to apply.' });
    }
    if (universityKeys.length > MAX_PER_BATCH) {
      return res.status(400).json({ success: false, message: `You can apply to at most ${MAX_PER_BATCH} universities at a time.` });
    }
    if (!programName) {
      return res.status(400).json({ success: false, message: 'Tell us which program you want to study.' });
    }
    const level = DEGREE_LEVELS.includes(degreeLevel) ? degreeLevel : 'Undergraduate';

    const studentProfile = await StudentProfile.findOne({ userId: req.user.id });
    const docs = await Document.find({ studentId: req.user.id });
    const twelfth = studentProfile?.academicInfo?.twelfth;
    const bestExam = (studentProfile?.academicInfo?.entranceExams || [])[0];
    const academicSnapshot = {
      twelfthPercentage: twelfth?.percentage || 80,
      tenthPercentage: studentProfile?.academicInfo?.tenth?.percentage || 80,
      entranceScore: bestExam?.score || 0,
      entranceExam: bestExam?.examName || 'General',
      stream: twelfth?.stream || 'Science (PCM)',
      subjects: twelfth?.subjects || []
    };

    const results = [];
    const seen = new Set();

    for (const rawKey of universityKeys) {
      const key = String(rawKey || '').toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);

      const uni = await directory.findByKey(key);
      if (!uni) {
        results.push({ key, success: false, message: 'University not found in the directory.' });
        continue;
      }

      const hash = crypto.createHash('sha1').update(uni.key).digest('hex').slice(0, 10).toUpperCase();
      const college = await College.findOneAndUpdate(
        { code: `GU-${hash}` },
        {
          $setOnInsert: {
            name: uni.name,
            code: `GU-${hash}`,
            description: `${uni.name} — listed in the SmartApply global university directory.`,
            city: uni.stateProvince || uni.country,
            state: uni.country,
            country: uni.country,
            region: uni.region,
            website: uni.website,
            accreditation: 'Global Directory',
            isExternal: true
          }
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );

      let course = await Course.findOne({ collegeId: college._id, isExternal: true, name: programName, degreeLevel: level });
      if (!course) {
        course = await Course.create({
          collegeId: college._id,
          name: programName,
          code: `GA-${hash.slice(0, 6)}-${level.slice(0, 2).toUpperCase()}`,
          department: 'Global Admissions',
          degreeLevel: level,
          description: `One-stop application to ${uni.name} (${uni.country}).`,
          eligibilityCriteria: { minTwelfthPercentage: 0, requiredSubjects: [], minEntranceScore: 0, streamAllowed: ALL_STREAMS },
          isExternal: true
        });
      }

      const existing = await Application.findOne({
        studentId: req.user.id,
        courseId: course._id,
        status: { $nin: ['REJECTED'] }
      });
      if (existing) {
        results.push({
          key, success: false, university: uni.name,
          applicationId: existing._id,
          message: `You already have an active application (${existing.applicationNumber}) for this program.`
        });
        continue;
      }

      const assistantAudit = analyzeApplicationData({
        studentProfile,
        course,
        applicationData: { academicSnapshot },
        uploadedDocuments: docs
      });

      const application = await Application.create({
        applicationNumber: await uniqueAppNumber(),
        studentId: req.user.id,
        collegeId: college._id,
        courseId: course._id,
        status: 'SUBMITTED',
        academicSnapshot,
        documents: docs.map(d => ({
          documentId: d._id,
          documentType: d.documentType,
          status: d.status,
          fileUrl: d.fileUrl
        })),
        smartAssistantAudit: assistantAudit,
        submittedAt: new Date()
      });

      await ApplicationStatusHistory.create({
        applicationId: application._id,
        previousStatus: 'DRAFT',
        newStatus: 'SUBMITTED',
        updatedBy: req.user.id,
        remarks: `Submitted through the one-stop global application to ${uni.name}, ${uni.country}.`
      });

      const notif = await Notification.create({
        userId: req.user.id,
        applicationId: application._id,
        title: 'Application Submitted Successfully',
        message: `Your application ${application.applicationNumber} for ${programName} at ${uni.name} (${uni.country}) has been submitted.`,
        type: 'STATUS_CHANGE'
      });

      emitToUser(req.user.id, 'NOTIFICATION_RECEIVED', notif);
      emitToUser(req.user.id, 'STATUS_CHANGED', {
        applicationId: application._id,
        status: application.status,
        applicationNumber: application.applicationNumber
      });
      broadcastToAdmins('NEW_APPLICATION_SUBMITTED', {
        applicationId: application._id,
        courseName: `${programName} — ${uni.name}`,
        studentName: req.user.name
      });

      results.push({
        key, success: true, university: uni.name, country: uni.country,
        applicationId: application._id,
        applicationNumber: application.applicationNumber
      });
    }

    const submitted = results.filter(r => r.success).length;
    res.status(submitted > 0 ? 201 : 400).json({
      success: submitted > 0,
      submitted,
      message: submitted > 0
        ? `Submitted ${submitted} application${submitted === 1 ? '' : 's'} with your single profile.`
        : 'No new applications were submitted.',
      results
    });
  } catch (error) {
    next(error);
  }
};
