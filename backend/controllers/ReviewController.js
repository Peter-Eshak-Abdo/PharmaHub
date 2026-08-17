const Review = require("../models/Review");
const Appointment = require("../models/Appointment");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");

// =============================================
// POST /api/reviews — Add review (BR-REV-001, BR-REV-002)
// =============================================
exports.createReview = async (req, res) => {
  try {
    const { appointmentId, rating, comment } = req.body;

    // Get patient
    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient) {
      return res
        .status(404)
        .json({ success: false, message: "ملف المريض غير موجود" });
    }

    // Verify appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: "الموعد غير موجود" });
    }

    // BR-REV-001: Only completed appointments
    if (appointment.status !== "Completed") {
      return res.status(400).json({
        success: false,
        message: "يمكن تقييم الزيارات المكتملة فقط",
      });
    }

    // Ensure patient owns this appointment
    if (appointment.patientId.toString() !== patient._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "لا يمكنك تقييم هذا الموعد" });
    }

    // BR-REV-002: One review per appointment (unique index handles DB side)
    const existing = await Review.findOne({ appointmentId });
    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: "لقد قمت بتقييم هذا الموعد بالفعل" });
    }

    // BR-REV-003: Rating bounds 1-5 (schema validates)
    const review = await Review.create({
      patientId: patient._id,
      doctorId: appointment.doctorId,
      appointmentId,
      rating,
      comment,
    });

    // Update doctor's average rating
    await updateDoctorRating(appointment.doctorId);

    res.status(201).json({
      success: true,
      message: "تم إرسال تقييمك بنجاح",
      data: review,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ success: false, message: "لقد قمت بتقييم هذا الموعد بالفعل" });
    }
    res.status(400).json({ success: false, message: err.message });
  }
};

// =============================================
// GET /api/reviews/doctor/:doctorId — Get doctor reviews
// =============================================
exports.getDoctorReviews = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [reviews, total] = await Promise.all([
      Review.find({ doctorId })
        .populate("patientId", "fullName")
        .sort({ submittedDate: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Review.countDocuments({ doctorId }),
    ]);

    // Average rating
    const ratingAgg = await Review.aggregate([
      { $match: { doctorId: require("mongoose").Types.ObjectId(doctorId) } },
      { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);
    const avgRating = ratingAgg[0]?.avg || 0;

    res.json({
      success: true,
      data: reviews,
      avgRating: Math.round(avgRating * 10) / 10,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: "خطأ في جلب التقييمات",
        error: err.message,
      });
  }
};

// =============================================
// GET /api/reviews/appointment/:appointmentId — Check if reviewed
// =============================================
exports.getReviewByAppointment = async (req, res) => {
  try {
    const review = await Review.findOne({
      appointmentId: req.params.appointmentId,
    });
    res.json({ success: true, data: review || null });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// =============================================
// Helper: Recalculate doctor average rating
// =============================================
async function updateDoctorRating(doctorId) {
  try {
    const agg = await Review.aggregate([
      {
        $match: {
          doctorId: require("mongoose").Types.ObjectId(doctorId.toString()),
        },
      },
      { $group: { _id: null, avg: { $avg: "$rating" } } },
    ]);
    const newRating = agg[0]?.avg || 0;
    await Doctor.findByIdAndUpdate(doctorId, {
      rating: Math.round(newRating * 10) / 10,
    });
  } catch (err) {
    console.error("خطأ في تحديث تقييم الطبيب:", err);
  }
}
