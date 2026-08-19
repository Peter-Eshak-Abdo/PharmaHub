const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { initiatePaymobPayment, handlePaymobWebhook } = require('../controllers/paymentController');

// Patient initiates online payment
router.post('/paymob/initiate', protect, initiatePaymobPayment);

// Paymob Webhook callback (Public endpoint for Paymob server)
router.post('/paymob/webhook', handlePaymobWebhook);

module.exports = router;
