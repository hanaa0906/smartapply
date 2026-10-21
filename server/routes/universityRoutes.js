const express = require('express');
const router = express.Router();
const { listUniversities, getDirectoryMeta, applyToUniversities } = require('../controllers/universityController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', listUniversities);
router.get('/meta', getDirectoryMeta);
router.post('/apply', protect, authorize('student'), applyToUniversities);

module.exports = router;
