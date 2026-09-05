const express = require('express');
const router = express.Router();
const { runSimulation, getSimulationHistory } = require('../controllers/simulatorController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('student'), runSimulation);
router.get('/history', protect, authorize('student'), getSimulationHistory);

module.exports = router;
