const express = require('express');
const router = express.Router();
const { getRecommendations } = require('../controllers/recommendationController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('student'), getRecommendations);

module.exports = router;
