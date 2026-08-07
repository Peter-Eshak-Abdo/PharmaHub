const express = require("express");
const router = express.Router();
const {
  addException,
  getExceptionsByDoctor,
  checkExceptionForDate,
  deleteException,
} = require("../controllers/ExceptionController");
const { protect } = require("../middlewares/auth");

// Create a new exception (vacation/blocked/emergency) — protected
router.post("/", protect, addException);

// Fetch all exceptions for a doctor — public, useful for calendar display
router.get("/:doctorId", getExceptionsByDoctor);

// Check if a specific date is blocked — public, called by the Appointments
// module before allowing a booking to go through
router.get("/:doctorId/check", checkExceptionForDate);

// Delete an exception — protected
router.delete("/:id", protect, deleteException);

module.exports = router;
