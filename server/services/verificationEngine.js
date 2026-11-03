/**
 * Intelligent Document Verification Pipeline
 * Lightweight upload checks. This does not perform OCR or verify authenticity.
 */

const verifyDocumentFile = (file, documentType) => {
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

  const extractedData = {};
  const status = issues.some(i => i.severity === 'CRITICAL') ? 'FLAGGED' : 'PROCESSING';
  if (status === 'PROCESSING') {
    issues.push({
      issueType: 'MANUAL_REVIEW_REQUIRED',
      description: 'File type and size passed basic checks. A human reviewer must verify its contents and authenticity.',
      severity: 'INFO'
    });
  }

  return {
    status,
    extractedData,
    verificationIssues: issues
  };
};

module.exports = { verifyDocumentFile };
