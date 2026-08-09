const express = require("express");
const router = express.Router();
const {
  addAvailability,
  getAvailabilityByDoctor,
  updateAvailability,
  deleteAvailability,
  getAvailableSlots,
} = require("../controllers/availabilityController");
const { protect, checkRole } = require("../middlewares/auth");

// Create a new weekly slot — protected, only the doctor (or admin) should do this
router.post("/", protect, checkRole(['doctor']), addAvailability);

// Fetch a doctor's weekly schedule — public, patients need this to book
router.get("/:doctorId", getAvailabilityByDoctor);
router.get("/:doctorId/slots", getAvailableSlots);

// Update an existing slot — protected
router.put("/:id", protect, checkRole(['doctor']), updateAvailability);

// Delete a slot — protected
router.delete("/:id", protect, checkRole(['doctor']), deleteAvailability);

module.exports = router;
