const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: [true, "معرف المريض مطلوب"],
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: [true, "معرف الطبيب مطلوب"],
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: [true, "معرف الموعد مطلوب"],
      unique: true, // BR-REV-002: One review per appointment
    },
    rating: {
      type: Number,
      required: [true, "التقييم مطلوب"],
      min: [1, "التقييم يجب أن يكون على الأقل 1"],
      max: [5, "التقييم لا يمكن أن يتجاوز 5"],
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [1000, "التعليق لا يمكن أن يتجاوز 1000 حرف"],
    },
    submittedDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// =============================================
// Indexes
// =============================================
// reviewSchema.index({ appointmentId: 1 }, { unique: true });
reviewSchema.index({ doctorId: 1, submittedDate: -1 });
reviewSchema.index({ patientId: 1 });

module.exports = mongoose.model("Review", reviewSchema);
