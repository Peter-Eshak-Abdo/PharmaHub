const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getPatientProfile,
} = require('../controllers/user');
const { protect } = require('../middlewares/auth');

// مسار تسجيل حساب جديد
router.post('/register', registerUser);

// مسار تسجيل الدخول
router.post('/login', loginUser);

// مسار جلب بيانات المريض (محمي بـ Middleware)
router.get('/profile', protect, getPatientProfile);

module.exports = router;