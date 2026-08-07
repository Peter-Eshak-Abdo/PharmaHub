const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/AuthController');

// مسار تسجيل حساب جديد
router.post('/register', registerUser);

// مسار تسجيل الدخول
router.post('/login', loginUser);

module.exports = router;
