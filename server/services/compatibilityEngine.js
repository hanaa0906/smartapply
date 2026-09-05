/**
 * Course Compatibility Engine
 * Calculates candidate compatibility score with clear explainability.
 * Categories: Recommended (>=70%), Possible (50-69%), Not Recommended (<50%)
 */

const calculateCourseCompatibility = (studentProfile, course) => {
  const reasons = [];
  const warnings = [];
  let score = 0;

  const academic = studentProfile?.academicInfo || {};
  const twelfth = academic.twelfth || {};
  const twelfthPct = Number(twelfth.percentage || 0);
  const studentSkills = studentProfile?.skills || [];
  const studentInterests = studentProfile?.interests || [];
  const studentCareerGoals = studentProfile?.careerGoals || [];
  const studentStream = twelfth.stream || '';

  const criteria = course.eligibilityCriteria || { minTwelfthPercentage: 60, requiredSubjects: [] };

  // 1. Academic Percentage Match (up to 35 points)
  const minPct = criteria.minTwelfthPercentage || 60;
  if (twelfthPct >= minPct + 10) {
    score += 35;
    reasons.push(`12th percentage (${twelfthPct}%) comfortably exceeds minimum requirement (${minPct}%).`);
  } else if (twelfthPct >= minPct) {
    const proportional = 20 + Math.round(((twelfthPct - minPct) / 10) * 15);
    score += proportional;
    reasons.push(`Meets 12th cutoff (${twelfthPct}% vs required ${minPct}%).`);
  } else {
    score += Math.max(0, 15 - (minPct - twelfthPct) * 2);
    warnings.push(`12th score (${twelfthPct}%) is below standard cutoff (${minPct}%).`);
  }

  // 2. Stream and Subject Match (up to 25 points)
  const allowedStreams = criteria.streamAllowed || [];
  if (allowedStreams.length === 0 || allowedStreams.includes(studentStream)) {
    score += 15;
    reasons.push(`Educational stream (${studentStream}) matches course prerequisites.`);
  } else {
    warnings.push(`Stream (${studentStream}) is not among the preferred streams (${allowedStreams.join(', ')}).`);
  }

  const studentSubjects = (twelfth.subjects || []).map(s => s.name?.toLowerCase() || '');
  const requiredSubjects = criteria.requiredSubjects || [];
  let matchedSubjectsCount = 0;

  requiredSubjects.forEach(req => {
    if (studentSubjects.some(sub => sub.includes(req.toLowerCase()))) {
      matchedSubjectsCount++;
    }
  });

  if (requiredSubjects.length > 0) {
    const subjectRatio = matchedSubjectsCount / requiredSubjects.length;
    score += Math.round(subjectRatio * 10);
    if (subjectRatio === 1) {
      reasons.push(`Completed all required foundation subjects (${requiredSubjects.join(', ')}).`);
    } else if (subjectRatio > 0) {
      reasons.push(`Satisfies ${matchedSubjectsCount} of ${requiredSubjects.length} prerequisite subjects.`);
    }
  } else {
    score += 10;
  }

  // 3. Skills and Interests Alignment (up to 25 points)
  const courseKeywords = [
    course.name,
    course.department,
    ...(course.syllabusHighlights || []),
    ...(course.careerProspects || [])
  ].join(' ').toLowerCase();

  let matchedSkills = 0;
  studentSkills.forEach(skill => {
    const words = skill.toLowerCase().split(/\s+/);
    if (words.some(w => w.length > 2 && courseKeywords.includes(w))) {
      matchedSkills++;
    }
  });

  let matchedInterests = 0;
  studentInterests.forEach(interest => {
    const words = interest.toLowerCase().split(/\s+/);
    if (words.some(w => w.length > 2 && courseKeywords.includes(w))) {
      matchedInterests++;
    }
  });

  const skillScore = Math.min(15, matchedSkills * 5);
  const interestScore = Math.min(10, matchedInterests * 5);
  score += (skillScore + interestScore);

  if (matchedSkills > 0) {
    reasons.push(`Demonstrated skill synergy (${matchedSkills} matching skills in profile).`);
  }
  if (matchedInterests > 0) {
    reasons.push(`Aligned with personal interests in ${studentInterests.slice(0, 2).join(' & ')}.`);
  }

  // 4. Career Goal Synergy (up to 15 points)
  let careerMatched = false;
  studentCareerGoals.forEach(goal => {
    const words = goal.toLowerCase().split(/\s+/).filter(w => w.length > 3 && !['leading', 'firm', 'specialist'].includes(w));
    if (words.some(w => courseKeywords.includes(w))) {
      careerMatched = true;
    }
  });

  if (careerMatched) {
    score += 15;
    reasons.push(`Direct alignment with career ambition: "${studentCareerGoals[0]}".`);
  } else if (studentCareerGoals.length > 0) {
    score += 7;
  }

  // Cap score between 12 and 98
  score = Math.max(12, Math.min(98, score));

  // Determine category
  let category = 'Possible';
  let badgeColor = 'amber';
  if (score >= 70) {
    category = 'Recommended';
    badgeColor = 'emerald';
  } else if (score < 50) {
    category = 'Not Recommended';
    badgeColor = 'rose';
  }

  return {
    courseId: course._id,
    courseName: course.name,
    courseCode: course.code,
    collegeId: course.collegeId,
    department: course.department,
    compatibilityScore: score,
    category,
    badgeColor,
    reasons,
    warnings,
    disclaimer: 'Decision-support score only — does not guarantee admission.'
  };
};

module.exports = { calculateCourseCompatibility };
