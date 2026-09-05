/**
 * Smart Application Assistant Engine
 * In-flight validation and anomaly detection without automated hard rejection.
 */

const analyzeApplicationData = ({ studentProfile, course, applicationData, uploadedDocuments = [] }) => {
  const mismatches = [];
  const missingFields = [];
  const flags = [];

  const academic = applicationData?.academicSnapshot || studentProfile?.academicInfo || {};
  const twelfthPercentage = Number(academic.twelfthPercentage || academic.twelfth?.percentage || 0);
  const tenthPercentage = Number(academic.tenthPercentage || academic.tenth?.percentage || 0);
  const entranceScore = Number(academic.entranceScore || academic.entranceExams?.[0]?.score || 0);
  const subjects = academic.subjects || academic.twelfth?.subjects || [];

  // 1. Sanity Checks: Mark ranges
  if (twelfthPercentage < 0 || twelfthPercentage > 100) {
    mismatches.push({
      field: 'twelfthPercentage',
      claimed: twelfthPercentage,
      detected: 'Out of range [0-100]',
      explanation: '12th percentage cannot be less than 0 or greater than 100.',
      severity: 'CRITICAL'
    });
  }

  if (tenthPercentage < 0 || tenthPercentage > 100) {
    mismatches.push({
      field: 'tenthPercentage',
      claimed: tenthPercentage,
      detected: 'Out of range [0-100]',
      explanation: '10th percentage cannot be less than 0 or greater than 100.',
      severity: 'CRITICAL'
    });
  }

  // 2. Subject marks sum vs entered percentage consistency check
  if (subjects && subjects.length > 0) {
    let totalMarks = 0;
    let totalMax = 0;
    let hasInvalidSubjectMark = false;

    subjects.forEach((sub) => {
      const marks = Number(sub.marks || 0);
      const maxMarks = Number(sub.maxMarks || 100);
      if (marks > maxMarks || marks < 0) {
        hasInvalidSubjectMark = true;
      }
      totalMarks += marks;
      totalMax += maxMarks;
    });

    if (hasInvalidSubjectMark) {
      mismatches.push({
        field: 'subjectMarks',
        claimed: 'Individual subject marks',
        detected: 'Marks exceed maximum marks allowable',
        explanation: 'One or more subjects have marks exceeding the maximum score.',
        severity: 'CRITICAL'
      });
    }

    if (totalMax > 0 && !hasInvalidSubjectMark) {
      const computedPercentage = Number(((totalMarks / totalMax) * 100).toFixed(2));
      const diff = Math.abs(computedPercentage - twelfthPercentage);

      if (diff > 2.0) {
        mismatches.push({
          field: 'twelfthPercentage',
          claimed: `${twelfthPercentage}% entered`,
          detected: `${computedPercentage}% from subject marks`,
          explanation: `The entered 12th percentage (${twelfthPercentage}%) differs from the computed average of individual subjects (${computedPercentage}%).`,
          severity: 'WARNING'
        });
      }
    }
  }

  // 3. Document Extraction vs Claimed Data Mismatch Check
  uploadedDocuments.forEach((doc) => {
    if (doc.documentType === '12th_marksheet' && doc.extractedData?.percentage) {
      const extractedPct = Number(doc.extractedData.percentage);
      const diff = Math.abs(extractedPct - twelfthPercentage);
      if (diff > 1.5) {
        mismatches.push({
          field: '12th_marksheet',
          claimed: `${twelfthPercentage}% in form`,
          detected: `${extractedPct}% extracted from marksheet`,
          explanation: `Information mismatch detected: Form states ${twelfthPercentage}%, but document analysis indicates ${extractedPct}%. Please double-check or submit explanation.`,
          severity: 'WARNING'
        });
      }
    }

    if (doc.documentType === '10th_marksheet' && doc.extractedData?.percentage) {
      const extractedPct = Number(doc.extractedData.percentage);
      const diff = Math.abs(extractedPct - tenthPercentage);
      if (diff > 1.5) {
        mismatches.push({
          field: '10th_marksheet',
          claimed: `${tenthPercentage}% in form`,
          detected: `${extractedPct}% extracted from marksheet`,
          explanation: `Information mismatch detected in 10th grade marks: Entered ${tenthPercentage}%, document indicates ${extractedPct}%.`,
          severity: 'WARNING'
        });
      }
    }
  });

  // 4. Missing Required Documents Check
  const requiredDocTypes = ['10th_marksheet', '12th_marksheet', 'id_proof'];
  const uploadedTypes = uploadedDocuments.map(d => d.documentType);

  requiredDocTypes.forEach(reqType => {
    if (!uploadedTypes.includes(reqType)) {
      missingFields.push(`Required Document: ${reqType.replace(/_/g, ' ').toUpperCase()}`);
    }
  });

  // 5. Course Eligibility Boundary Warnings
  if (course && course.eligibilityCriteria) {
    const minTwelfth = course.eligibilityCriteria.minTwelfthPercentage || 0;
    if (twelfthPercentage < minTwelfth) {
      flags.push(`Applicant percentage (${twelfthPercentage}%) is below course minimum cutoff (${minTwelfth}%). Application may require committee concession.`);
    }

    if (course.eligibilityCriteria.minEntranceScore > 0 && entranceScore < course.eligibilityCriteria.minEntranceScore) {
      flags.push(`Entrance score (${entranceScore}) is below recommended course threshold (${course.eligibilityCriteria.minEntranceScore}).`);
    }
  }

  const overallCheckStatus = mismatches.some(m => m.severity === 'CRITICAL')
    ? 'ACTION_REQUIRED'
    : (mismatches.length > 0 || missingFields.length > 0 || flags.length > 0)
    ? 'ATTENTION_NEEDED'
    : 'CLEAN';

  return {
    mismatches,
    missingFields,
    flags,
    scoreConsistency: !mismatches.some(m => m.field === 'twelfthPercentage' && m.severity === 'CRITICAL'),
    overallCheckStatus
  };
};

module.exports = { analyzeApplicationData };
