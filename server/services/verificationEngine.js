/**
 * Intelligent Document Verification Pipeline
 * Rule-based verification + structured simulated OCR extraction.
 */

const verifyDocumentFile = (file, documentType, studentProfile) => {
  const issues = [];
  const maxSizeBytes = 5 * 1024 * 1024; // 5 MB
  const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];

  // 1. File size check
  if (file.size > maxSizeBytes) {
    issues.push({
      issueType: 'FILE_SIZE_EXCEEDED',
      description: `File size ${(file.size / (1024 * 1024)).toFixed(2)} MB exceeds 5 MB limit.`,
      severity: 'CRITICAL'
    });
  }

  // 2. MIME type check
  if (!allowedMimeTypes.includes(file.mimetype)) {
    issues.push({
      issueType: 'INVALID_MIME_TYPE',
      description: `File type '${file.mimetype}' is not permitted. Only PDF, JPG, and PNG are allowed.`,
      severity: 'CRITICAL'
    });
  }

  // 3. Simulated OCR extraction based on student profile and heuristics
  let extractedData = {};
  const academic = studentProfile?.academicInfo || {};

  if (documentType === '12th_marksheet') {
    // Generate realistic OCR extraction with slight potential variation for demo
    const basePct = academic.twelfth?.percentage || 85;
    extractedData = {
      percentage: basePct,
      name: studentProfile?.userId?.name || 'Verified Student',
      rollNumber: academic.twelfth?.rollNumber || 'CBSE-2024-88419',
      board: academic.twelfth?.board || 'CBSE',
      year: academic.twelfth?.passingYear || 2024,
      confidenceScore: 0.94
    };
  } else if (documentType === '10th_marksheet') {
    const basePct = academic.tenth?.percentage || 88;
    extractedData = {
      percentage: basePct,
      name: studentProfile?.userId?.name || 'Verified Student',
      rollNumber: academic.tenth?.rollNumber || 'CBSE-2022-77102',
      board: academic.tenth?.board || 'CBSE',
      year: academic.tenth?.passingYear || 2022,
      confidenceScore: 0.96
    };
  } else {
    extractedData = {
      name: studentProfile?.userId?.name || 'Verified Candidate',
      documentCategory: documentType,
      confidenceScore: 0.91
    };
  }

  let status = 'PROCESSING';
  if (issues.some(i => i.severity === 'CRITICAL')) {
    status = 'FLAGGED';
  } else {
    status = 'VERIFIED';
  }

  return {
    status,
    extractedData,
    verificationIssues: issues
  };
};

module.exports = { verifyDocumentFile };
