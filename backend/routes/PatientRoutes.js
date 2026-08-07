const express = require("express");
const router = express.Router();
const {
  getPatientProfile,
  createPatientProfile,
  updatePatientProfile,
} = require("../controllers/PatientController");
const { protect } = require("../middlewares/auth");

// مسار جلب بيانات المريض
router.get("/profile", protect, getPatientProfile);

// مسار إنشاء بيانات المريض لأول مرة
router.post("/profile", protect, createPatientProfile);

// مسار تحديث بيانات المريض
router.put("/profile", protect, updatePatientProfile);

module.exports = router;
