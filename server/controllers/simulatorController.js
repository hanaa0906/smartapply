const Simulation = require('../models/Simulation');
const Course = require('../models/Course');
const StudentProfile = require('../models/StudentProfile');

exports.runSimulation = async (req, res, next) => {
  try {
    const { courseId, entranceScore, twelfthPercentage, extracurricularScore = 5 } = req.body;

    const course = await Course.findById(courseId).populate('collegeId', 'name');
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    const profile = await StudentProfile.findOne({ userId: req.user.id });
    const actualTwelfth = profile?.academicInfo?.twelfth?.percentage || 75;
    const actualEntrance = profile?.academicInfo?.entranceExams?.[0]?.score || 60;

    const targetCutoff = course.eligibilityCriteria?.minTwelfthPercentage || 65;
    const targetEntrance = course.eligibilityCriteria?.minEntranceScore || 65;

    // Weight allocation
    // 12th percentage: 45%
    // Entrance score: 40%
    // Extracurricular/Profile: 15%
    const academicRatio = Math.min(1.2, Number(twelfthPercentage) / targetCutoff);
    const academicContribution = Math.min(45, Math.round(academicRatio * 40));

    const entranceRatio = targetEntrance > 0 ? Math.min(1.2, Number(entranceScore) / targetEntrance) : 1;
    const entranceContribution = Math.min(40, Math.round(entranceRatio * 35));

    const extraContribution = Math.min(15, Math.round((Number(extracurricularScore) / 10) * 15));

    const simulatedReadinessScore = Math.min(99, Math.max(15, academicContribution + entranceContribution + extraContribution));

    // Calculate baseline score with actual values
    const baseAcademic = Math.min(45, Math.round(Math.min(1.2, actualTwelfth / targetCutoff) * 40));
    const baseEntrance = Math.min(40, Math.round((targetEntrance > 0 ? Math.min(1.2, actualEntrance / targetEntrance) : 1) * 35));
    const baselineScore = Math.min(99, Math.max(15, baseAcademic + baseEntrance + 8));

    const delta = simulatedReadinessScore - baselineScore;

    const factors = [
      {
        name: 'Academic Percentage',
        weight: 45,
        contribution: academicContribution,
        explanation: `${twelfthPercentage}% provides ${academicContribution} of 45 weighted points (Course cutoff: ${targetCutoff}%).`
      },
      {
        name: 'Entrance Score / Percentile',
        weight: 40,
        contribution: entranceContribution,
        explanation: `${entranceScore} contributes ${entranceContribution} of 40 weighted points.`
      },
      {
        name: 'Extracurricular & Achievements',
        weight: 15,
        contribution: extraContribution,
        explanation: `Profile depth contributes ${extraContribution} of 15 weighted points.`
      }
    ];

    const simulation = await Simulation.create({
      studentId: req.user.id,
      courseId: course._id,
      hypotheticalValues: {
        entranceScore: Number(entranceScore),
        twelfthPercentage: Number(twelfthPercentage),
        extracurricularScore: Number(extracurricularScore)
      },
      simulatedReadinessScore,
      factors,
      comparison: {
        previousScore: baselineScore,
        newScore: simulatedReadinessScore,
        delta
      },
      notes: 'SIMULATION — NOT A GUARANTEE OF ADMISSION'
    });

    res.status(200).json({
      success: true,
      simulation: {
        ...simulation.toObject(),
        courseName: course.name,
        collegeName: course.collegeId?.name
      },
      disclaimer: 'SIMULATION — NOT A GUARANTEE OF ADMISSION'
    });
  } catch (error) {
    next(error);
  }
};

exports.getSimulationHistory = async (req, res, next) => {
  try {
    const history = await Simulation.find({ studentId: req.user.id })
      .populate('courseId', 'name code department')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      history
    });
  } catch (error) {
    next(error);
  }
};
