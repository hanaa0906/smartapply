const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getApplications,
  updateApplicationStatus,
  getFairnessAudit,
  runPolicySimulation,
  getAnalytics
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/stats', getDashboardStats);
router.get('/applications', getApplications);
router.put('/applications/:id/status', updateApplicationStatus);
router.get('/fairness', getFairnessAudit);
router.post('/policy-simulate', runPolicySimulation);
router.get('/analytics', getAnalytics);

module.exports = router;
