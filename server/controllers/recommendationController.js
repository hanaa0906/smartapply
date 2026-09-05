const Course = require('../models/Course');
const StudentProfile = require('../models/StudentProfile');
const { calculateCourseCompatibility } = require('../services/compatibilityEngine');

exports.getRecommendations = async (req, res, next) => {
  try {
    const studentProfile = await StudentProfile.findOne({ userId: req.user.id });
    if (!studentProfile) {
      return res.status(404).json({ success: false, message: 'Student profile not found. Please complete your profile.' });
    }

    const courses = await Course.find({ isActive: true }).populate('collegeId', 'name code city state accreditation logo');

    const evaluated = courses.map(course => {
      const evaluation = calculateCourseCompatibility(studentProfile, course);
      return {
        ...evaluation,
        course
      };
    });

    // Sort by compatibility score descending
    evaluated.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    const recommended = evaluated.filter(e => e.category === 'Recommended');
    const possible = evaluated.filter(e => e.category === 'Possible');
    const notRecommended = evaluated.filter(e => e.category === 'Not Recommended');

    res.status(200).json({
      success: true,
      summary: {
        totalEvaluated: evaluated.length,
        recommendedCount: recommended.length,
        possibleCount: possible.length,
        notRecommendedCount: notRecommended.length
      },
      recommended,
      possible,
      notRecommended
    });
  } catch (error) {
    next(error);
  }
};
