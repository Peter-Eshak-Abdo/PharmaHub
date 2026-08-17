const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middlewares/auth");
const {
  createReview,
  getDoctorReviews,
  getReviewByAppointment,
} = require("../controllers/ReviewController");

// Patient submits a review
router.post("/", protect, authorize("patient"), createReview);

// Get all reviews for a doctor (public with auth)
router.get("/doctor/:doctorId", protect, getDoctorReviews);

// Check if appointment already reviewed
router.get("/appointment/:appointmentId", protect, getReviewByAppointment);

module.exports = router;
