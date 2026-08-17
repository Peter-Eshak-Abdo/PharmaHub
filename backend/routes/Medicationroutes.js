const express = require("express");
const router = express.Router();
const {
  addMedication,
  getMedications,
  getMedicationById,
} = require("../controllers/Medicationcontroller");

const { protect, checkRole } = require("../middlewares/auth");

// GET  /api/medications           — fetch all medications (optional ?type= filter)
// POST /api/medications           — add a new medication (Admin)
router.route("/").get(getMedications).post(protect, checkRole(['admin', 'doctor']), addMedication);

// GET /api/medications/:id        — fetch a single medication
router.route("/:id").get(getMedicationById);

module.exports = router;
