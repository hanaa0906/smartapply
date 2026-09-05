const express = require('express');
const router = express.Router();
const {
  createApplication,
  getMyApplications,
  getApplicationById,
  checkSmartAssistant
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');

router.post('/check-assistant', protect, authorize('student'), checkSmartAssistant);
router.post('/', protect, authorize('student'), createApplication);
router.get('/my', protect, authorize('student'), getMyApplications);
router.get('/:id', protect, getApplicationById);

module.exports = router;
