const express = require('express');
const router = express.Router();
const { getScholarships, getMatchedScholarships, createScholarship } = require('../controllers/scholarshipController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getScholarships);
router.get('/matched', protect, authorize('student'), getMatchedScholarships);
router.post('/', protect, authorize('admin'), createScholarship);

module.exports = router;
