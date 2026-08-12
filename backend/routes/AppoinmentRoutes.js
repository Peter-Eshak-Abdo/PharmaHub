const express = require("express");
const router = express.Router();
const {
  createAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
} = require("../controllers/AppoinmentController");

const { protect, checkRole } = require("../middlewares/auth");

router.post("/", protect, checkRole(["patient"]), createAppointment);// إنشاء حجز جديد
router.get("/patient", protect, getPatientAppointments); // جلب حجوزات المريض المسجل
router.get("/patient/:patientId", getPatientAppointments);// جلب حجوزات مريض محدد
router.get("/doctor", protect, getDoctorAppointments); // جلب حجوزات الطبيب المسجل
router.get("/doctor/:doctorId", getDoctorAppointments);// جلب حجوزات طبيب محدد
router.patch("/:id/status", updateAppointmentStatus);// تحديث حالة الحجز (مكتمل / ملغي / ...)

module.exports = router;

