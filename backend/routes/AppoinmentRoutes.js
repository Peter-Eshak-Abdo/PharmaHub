const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middlewares/auth");
const {
  createAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment,
  getAvailableSlots,
} = require("../controllers/appointmentController");

// Public: Available slots (authenticated)
router.get("/available-slots", protect, getAvailableSlots);

// Patient routes
router.post("/", protect, authorize("patient"), createAppointment);
router.get("/patient", protect, authorize("patient"), getPatientAppointments);

// Doctor routes
router.get("/doctor", protect, authorize("doctor"), getDoctorAppointments);

// Shared routes (patient or doctor can access own)
router.get("/:id", protect, getAppointmentById);
router.patch(
  "/:id/status",
  protect,
  authorize("doctor", "admin"),
  updateAppointmentStatus,
);
router.patch(
  "/:id/cancel",
  protect,
  authorize("patient", "doctor", "admin"),
  cancelAppointment,
);

module.exports = router;
