const StudentProfile = require('../models/StudentProfile');

const calculateCompletion = (profile) => {
  let score = 0;
  // Personal Info (25%)
  if (profile.personalInfo?.dateOfBirth && profile.personalInfo?.gender && profile.personalInfo?.city) {
    score += 25;
  } else if (profile.personalInfo?.city || profile.personalInfo?.gender) {
    score += 15;
  }
  // Academic Info (35%)
  if (profile.academicInfo?.tenth?.percentage && profile.academicInfo?.twelfth?.percentage) {
    score += 35;
  } else if (profile.academicInfo?.tenth?.percentage || profile.academicInfo?.twelfth?.percentage) {
    score += 20;
  }
  // Skills & Interests (20%)
  if (profile.skills?.length > 0 && profile.interests?.length > 0) {
    score += 20;
  } else if (profile.skills?.length > 0 || profile.interests?.length > 0) {
    score += 10;
  }
  // Goals & Preferences (20%)
  if (profile.careerGoals?.length > 0) {
    score += 20;
  }
  return Math.min(100, Math.max(20, score));
};

exports.getProfile = async (req, res, next) => {
  try {
    let profile = await StudentProfile.findOne({ userId: req.user.id }).populate('coursePreferences');
    if (!profile) {
      profile = await StudentProfile.create({
        userId: req.user.id,
        academicInfo: {
          tenth: { board: 'CBSE', passingYear: 2022, percentage: 85 },
          twelfth: { board: 'CBSE', passingYear: 2024, percentage: 82, stream: 'Science (PCM)', subjects: [] }
        },
        completionPercentage: 35
      });
    }

    res.status(200).json({
      success: true,
      profile
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    let profile = await StudentProfile.findOne({ userId: req.user.id });
    if (!profile) {
      profile = new StudentProfile({ userId: req.user.id });
    }

    const { personalInfo, academicInfo, skills, interests, careerGoals, coursePreferences, achievements } = req.body;

    if (personalInfo) profile.personalInfo = { ...profile.personalInfo, ...personalInfo };
    if (academicInfo) profile.academicInfo = { ...profile.academicInfo, ...academicInfo };
    if (skills) profile.skills = skills;
    if (interests) profile.interests = interests;
    if (careerGoals) profile.careerGoals = careerGoals;
    if (coursePreferences) profile.coursePreferences = coursePreferences;
    if (achievements) profile.achievements = achievements;

    profile.completionPercentage = calculateCompletion(profile);
    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Student profile updated successfully',
      profile
    });
  } catch (error) {
    next(error);
  }
};
