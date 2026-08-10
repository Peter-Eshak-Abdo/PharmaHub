const express = require("express");
const router = express.Router();
const {
  addAvailability,
  getAvailableSlots,
  getAvailabilityByDoctor,
  updateAvailability,
  deleteAvailability,
} = require("../controllers/AvailabilityController");
const { protect } = require("../middlewares/auth");

// Create a new weekly slot — protected, only the doctor (or admin) should do this
router.post("/", protect, addAvailability);

// Get actual bookable slots for a specific date — must come before /:doctorId
router.get("/:doctorId/slots", getAvailableSlots);

// Fetch a doctor's weekly schedule — public, patients need this to book
router.get("/:doctorId", getAvailabilityByDoctor);

// Update an existing slot — protected
router.put("/:id", protect, updateAvailability);

// Delete a slot — protected
router.delete("/:id", protect, deleteAvailability);

module.exports = router;