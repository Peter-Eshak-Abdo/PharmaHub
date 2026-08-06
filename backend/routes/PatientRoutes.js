const express = require('express');
const router = express.Router();
const { getPatientProfile, updatePatientProfile } = require('../controllers/patientController');
const { protect } = require('../middlewares/auth');

// مسار جلب بيانات المريض
router.get('/profile', protect, getPatientProfile);

// مسار تحديث بيانات المريض
router.put('/profile', protect, updatePatientProfile);

module.exports = router;