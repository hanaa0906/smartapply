const Scholarship = require('../models/Scholarship');
const StudentProfile = require('../models/StudentProfile');

exports.getScholarships = async (req, res, next) => {
  try {
    const scholarships = await Scholarship.find({ isActive: true }).populate('collegeId', 'name code');
    res.status(200).json({
      success: true,
      count: scholarships.length,
      scholarships
    });
  } catch (error) {
    next(error);
  }
};

exports.getMatchedScholarships = async (req, res, next) => {
  try {
    const studentProfile = await StudentProfile.findOne({ userId: req.user.id });
    const scholarships = await Scholarship.find({ isActive: true }).populate('collegeId', 'name code');

    if (!studentProfile) {
      return res.status(200).json({
        success: true,
        matches: scholarships.map(s => ({ ...s.toObject(), matchPercentage: 50, reasons: ['Base opportunity'], eligible: true }))
      });
    }

    const academicPct = studentProfile.academicInfo?.twelfth?.percentage || 0;
    const familyIncome = studentProfile.personalInfo?.annualFamilyIncome || 500000;
    const studentCategory = studentProfile.personalInfo?.category || 'General';
    const studentGender = studentProfile.personalInfo?.gender || 'All';

    const matches = scholarships.map(s => {
      let matchScore = 0;
      const reasons = [];
      const gaps = [];

      // 1. Percentage check (40 pts)
      const minPct = s.eligibilityRules?.minPercentage || 70;
      if (academicPct >= minPct) {
        matchScore += 40;
        reasons.push(`Academic criteria met (${academicPct}% vs minimum ${minPct}% required).`);
      } else {
        gaps.push(`Requires at least ${minPct}% (current: ${academicPct}%).`);
      }

      // 2. Income ceiling check (30 pts)
      const maxIncome = s.eligibilityRules?.maxAnnualIncome || 1000000;
      if (familyIncome <= maxIncome) {
        matchScore += 30;
        reasons.push(`Income criteria satisfied (Annual income ₹${familyIncome.toLocaleString()} is within ₹${maxIncome.toLocaleString()} cap).`);
      } else {
        gaps.push(`Income ceiling is ₹${maxIncome.toLocaleString()}.`);
      }

      // 3. Category match (20 pts)
      const eligibleCategories = s.eligibilityRules?.eligibleCategories || [];
      if (eligibleCategories.length === 0 || eligibleCategories.includes(studentCategory)) {
        matchScore += 20;
        reasons.push(`Category '${studentCategory}' is fully eligible.`);
      } else {
        gaps.push(`Designated for ${eligibleCategories.join(', ')}.`);
      }

      // 4. Gender restriction (10 pts)
      const genderReq = s.eligibilityRules?.genderRestriction || 'All';
      if (genderReq === 'All' || genderReq === studentGender) {
        matchScore += 10;
      } else {
        gaps.push(`Restricted to ${genderReq} candidates.`);
      }

      return {
        ...s.toObject(),
        matchPercentage: matchScore,
        eligible: matchScore >= 70,
        reasons,
        gaps
      };
    });

    matches.sort((a, b) => b.matchPercentage - a.matchPercentage);

    res.status(200).json({
      success: true,
      matches
    });
  } catch (error) {
    next(error);
  }
};

exports.createScholarship = async (req, res, next) => {
  try {
    const scholarship = await Scholarship.create(req.body);
    res.status(201).json({
      success: true,
      scholarship
    });
  } catch (error) {
    next(error);
  }
};
