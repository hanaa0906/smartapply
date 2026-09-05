const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/profileController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('student', 'admin'), getProfile);
router.put('/', protect, authorize('student'), updateProfile);

module.exports = router;
