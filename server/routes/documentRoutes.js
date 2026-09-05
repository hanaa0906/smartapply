const express = require('express');
const router = express.Router();
const { uploadDocument, getDocuments, verifyDocument } = require('../controllers/documentController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', protect, upload.single('file'), uploadDocument);
router.get('/', protect, getDocuments);
router.put('/:id/verify', protect, authorize('admin'), verifyDocument);

module.exports = router;
