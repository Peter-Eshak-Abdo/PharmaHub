const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: [true, "Patient ID is required"],
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: [true, "Doctor ID is required"],
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment", // 1:1 Reference to completed Appointment
      required: [true, "Appointment ID is required"],
      unique: true, // Enforces strictly 1 review per appointment
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    comment: {
      type: String,
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

// Indexes for optimal retrieval of doctor and patient reviews
reviewSchema.index({ doctorId: 1, submittedDate: -1 });
reviewSchema.index({ patientId: 1 });

module.exports = mongoose.model("Review", reviewSchema);
