const express = require("express");
const router = express.Router();
const {
  addAvailability,
  getAvailabilityByDoctor,
  updateAvailability,
  deleteAvailability,
} = require("../controllers/AvailabilityController");
const { protect } = require("../middlewares/auth");

// Create a new weekly slot — protected, only the doctor (or admin) should do this
router.post("/", protect, addAvailability);

// Fetch a doctor's weekly schedule — public, patients need this to book
router.get("/:doctorId", getAvailabilityByDoctor);

// Update an existing slot — protected
router.put("/:id", protect, updateAvailability);

// Delete a slot — protected
router.delete("/:id", protect, deleteAvailability);

module.exports = router;
