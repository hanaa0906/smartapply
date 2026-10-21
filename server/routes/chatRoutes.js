const express = require('express');
const router = express.Router();
const { getHistory, sendMessage, clearHistory } = require('../controllers/chatController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('student'));
router.get('/history', getHistory);
router.post('/message', sendMessage);
router.delete('/history', clearHistory);

module.exports = router;
