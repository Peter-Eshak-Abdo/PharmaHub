const express = require("express");
const router = express.Router();
const {
  createReview,
  getDoctorReviews,
} = require("../controllers/ReviewController");

router.post("/", createReview);// إضافة تقييم جديد
router.get("/doctor/:doctorId", getDoctorReviews);// جلب تقييمات طبيب محدد

module.exports = router;
