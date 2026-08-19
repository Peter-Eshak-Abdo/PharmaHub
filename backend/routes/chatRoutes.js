const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middlewares/auth');
const { sendMessage, getChatContext } = require('../controllers/chatController');

// Chat routes use optional authentication (supports both guests and authenticated users)
router.use(optionalAuth);

/**
 * @route   POST /api/chat/message
 * @desc    Send a message to PharmaHub AI Chatbot
 * @access  Public / Private (with optional auth)
 */
router.post('/message', sendMessage);

/**
 * @route   GET /api/chat/context
 * @desc    Get patient's aggregated medical history summary for chatbot header/badge
 * @access  Public / Private (with optional auth)
 */
router.get('/context', getChatContext);

module.exports = router;
