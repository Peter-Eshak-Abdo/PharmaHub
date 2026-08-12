const express = require("express");
const router = express.Router();
const {
  getDoctorProfile,
  createDoctorProfile,
  updateDoctorProfile,
  getAllDoctors,
  getDoctorById,
} = require("../controllers/DoctorController");
const { protect } = require("../middlewares/auth");

// مسارات بروفايل الطبيب
router.get("/profile", protect, getDoctorProfile);
router.post("/profile", protect, createDoctorProfile);
router.put("/profile", protect, updateDoctorProfile);

// مسارات تصفح الأطباء (عامة)
router.get("/", getAllDoctors);
router.get("/:id", getDoctorById);

module.exports = router;

