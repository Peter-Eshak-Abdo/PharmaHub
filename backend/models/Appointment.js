const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
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
    appointmentDate: {
      type: Date,
      required: [true, "تاريخ الموعد مطلوب"],
    },
    appointmentTime: {
      type: String,
      required: [true, "وقت الموعد مطلوب"],
      match: [/^\d{2}:\d{2}$/, "صيغة الوقت يجب أن تكون HH:MM"],
    },
    consultationType: {
      type: String,
      enum: {
        values: ["In-Clinic", "Online"],
        message: "نوع الاستشارة يجب أن يكون In-Clinic أو Online",
      },
      required: [true, "نوع الاستشارة مطلوب"],
    },
    reasonForVisit: {
      type: String,
      trim: true,
    },
    estimatedDurationMinutes: {
      type: Number,
      min: [1, "مدة الموعد يجب أن تكون أكبر من صفر"],
    },
    status: {
      type: String,
      enum: {
        values: ["Pending", "Confirmed", "Completed", "Cancelled", "No-Show"],
        message: "حالة الموعد غير صالحة",
      },
      default: "Pending",
    },
    consultationFeeSnapshot: {
      type: Number,
      min: [0, "رسوم الاستشارة لا يمكن أن تكون سالبة"],
    },
    bookingDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// =============================================
// Indexes (BR-SCHED-004: Anti-Overlapping)
// =============================================
appointmentSchema.index(
  { doctorId: 1, appointmentDate: 1, appointmentTime: 1 },
  { partialFilterExpression: { status: { $ne: "Cancelled" } } },
);
appointmentSchema.index({ patientId: 1, appointmentDate: 1 });
appointmentSchema.index({ status: 1, appointmentDate: 1 });

// =============================================
// State Machine Validation (BR-APP-003)
// =============================================
const VALID_TRANSITIONS = {
  Pending: ["Confirmed", "Cancelled"],
  Confirmed: ["Completed", "Cancelled", "No-Show"],
  Completed: [],
  Cancelled: [],
  "No-Show": [],
};

appointmentSchema.pre("save", function (next) {
  if (this.isModified("status") && !this.isNew) {
    const prev = this._previousStatus;
    if (prev && !VALID_TRANSITIONS[prev]?.includes(this.status)) {
      return next(
        new Error(
          `لا يمكن تغيير حالة الموعد من "${prev}" إلى "${this.status}"`,
        ),
      );
    }
  }
  next();
});

// Store previous status before update
appointmentSchema.pre("findOneAndUpdate", function (next) {
  this._update._previousStatus = this._update.status;
  next();
});

module.exports = mongoose.model("Appointment", appointmentSchema);
