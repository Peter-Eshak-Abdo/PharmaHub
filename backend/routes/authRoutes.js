const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getAdminStats } = require('../controllers/authController');
const { protect, checkRole } = require('../middlewares/auth');

// مسار تسجيل حساب جديد
router.post('/register', registerUser);

// مسار تسجيل الدخول
router.post('/login', loginUser);

// مسار إحصائيات الأدمن
router.get('/admin/stats', protect, checkRole(['admin']), getAdminStats);

module.exports = router;
