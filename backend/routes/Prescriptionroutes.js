const express = require("express");
const router = express.Router();
const {
  createPrescription,
  getPrescriptionByAppointmentId,
  getPrescriptionsByPatient,
} = require("../controllers/Prescriptioncontroller");

const { protect, checkRole } = require("../middlewares/auth");

// POST /api/prescriptions
// Create a new prescription (Doctor only)
router.route("/").post(protect, checkRole(["doctor"]), createPrescription);

// GET /api/prescriptions/appointment/:appointmentId
// Fetch prescription for a specific appointment
router.route("/appointment/:appointmentId").get(getPrescriptionByAppointmentId);

// GET /api/prescriptions/patient/:patientId
// Fetch all prescriptions for a patient (medical history)
router.route("/patient/:patientId").get(getPrescriptionsByPatient);

module.exports = router;
