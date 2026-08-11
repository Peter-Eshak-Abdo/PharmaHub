const express = require("express");
const router = express.Router();
const {
  createReview,
  getDoctorReviews,
} = require("../controllers/ReviewController");

const { protect, checkRole } = require("../middlewares/auth");

router.post("/", protect, checkRole(["patient"]), createReview);// إضافة تقييم جديد
router.get("/doctor/:doctorId", getDoctorReviews);// جلب تقييمات طبيب محدد

module.exports = router;
