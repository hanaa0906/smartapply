const express = require('express');
const router = express.Router();
const { uploadDocument, getDocuments, verifyDocument, downloadDocument } = require('../controllers/documentController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', protect, authorize('student'), upload.single('file'), uploadDocument);
router.get('/', protect, getDocuments);
router.get('/:id/file', protect, downloadDocument);
router.put('/:id/verify', protect, authorize('admin'), verifyDocument);

module.exports = router;
