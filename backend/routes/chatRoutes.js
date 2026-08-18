const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { sendMessage, getChatContext } = require('../controllers/chatController');

// All chat routes require valid authentication
router.use(protect);

/**
 * @route   POST /api/chat/message
 * @desc    Send a message to PharmaHub AI Chatbot
 * @access  Private
 */
router.post('/message', sendMessage);

/**
 * @route   GET /api/chat/context
 * @desc    Get patient's aggregated medical history summary for chatbot header/badge
 * @access  Private
 */
router.get('/context', getChatContext);

module.exports = router;
