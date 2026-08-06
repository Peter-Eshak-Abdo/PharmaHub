const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getPatientProfile,
  updatePatientProfile,
} = require('../controllers/user');
const { protect } = require('../middlewares/auth');

// مسار تسجيل حساب جديد
router.post('/register', registerUser);

// مسار تسجيل الدخول
router.post('/login', loginUser);

// مسار جلب بيانات المريض
router.get('/profile', protect, getPatientProfile);

// مسار تحديث بيانات المريض
router.put('/profile', protect, updatePatientProfile);

module.exports = router;