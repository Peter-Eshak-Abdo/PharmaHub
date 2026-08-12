const express = require("express");
const router = express.Router();
const {
  addAvailability,
  getAvailableSlots,
  getAvailabilityByDoctor,
  updateAvailability,
  deleteAvailability,
} = require("../controllers/availabilityController");
const { protect, checkRole } = require("../middlewares/auth");

// Create a new weekly slot — protected, only the doctor (or admin) should do this
router.post("/", protect, checkRole(['doctor']), addAvailability);

// Get actual bookable slots for a specific date — must come before /:doctorId
router.get("/:doctorId/slots", getAvailableSlots);

// Fetch a doctor's weekly schedule — public, patients need this to book
router.get("/:doctorId", getAvailabilityByDoctor);
router.get("/:doctorId/slots", getAvailableSlots);

// Update an existing slot — protected
router.put("/:id", protect, checkRole(['doctor']), updateAvailability);

// Delete a slot — protected
router.delete("/:id", protect, checkRole(['doctor']), deleteAvailability);

module.exports = router;