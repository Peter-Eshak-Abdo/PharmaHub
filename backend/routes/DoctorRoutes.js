const express = require("express");
const router = express.Router();
const {
  getDoctorProfile,
  createDoctorProfile,
  updateDoctorProfile,
} = require("../controllers/DoctorController");
const { protect } = require("../middlewares/auth");

// مسار جلب بيانات الدكتور
router.get("/profile", protect, getDoctorProfile);

// مسار إنشاء بيانات الدكتور لأول مرة
router.post("/profile", protect, createDoctorProfile);

// مسار تحديث بيانات الدكتور
router.put("/profile", protect, updateDoctorProfile);

module.exports = router;
