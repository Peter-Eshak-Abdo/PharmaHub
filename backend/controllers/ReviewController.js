const Review = require("../models/Reviews");
const Appointment = require("../models/apponinments");
const Doctor = require("../models/Doctor"); // from mohamed Eid

exports.createReview = async (req, res) => {
  try {
    const { appointmentId, rating, comment } = req.body;

    // 1. التحقق من وجود الحجز
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });
    }

    // 2. التقييم مسموح فقط للحجوزات المنتهية (Completed)
    if (appointment.status !== "Completed") {
      return res.status(400).json({
        success: false,
        message: "Reviews can only be submitted for completed appointments",
      });
    }

    // 3. التحقق من عدم وجود تقييم سابق لنفس الحجز
    const existingReview = await Review.findOne({ appointmentId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "A review has already been submitted for this appointment",
      });
    }

    // 4. إنشاء التقييم
    const review = await Review.create({
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      appointmentId,
      rating,
      comment,
    });

    // 5. تحديث متوسط تقييم الطبيب تلقائياً
    const doctorReviews = await Review.find({ doctorId: appointment.doctorId });
    const avgRating =
      doctorReviews.reduce((acc, item) => item.rating + acc, 0) /
      doctorReviews.length;

    await Doctor.findByIdAndUpdate(appointment.doctorId, {
      rating: parseFloat(avgRating.toFixed(2)),
    });

    res.status(201).json({
      success: true,
      data: review,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDoctorReviews = async (req, res) => {
  try {
    const { doctorId } = req.params;

    // جلب جميع التقييمات مع بيانات المريض صاحب التقييم
    const reviews = await Review.find({ doctorId })
      .populate("patientId", "fullName")
      .sort({ submittedDate: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
