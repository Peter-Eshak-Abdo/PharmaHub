const mongoose = require("mongoose");

const scheduleExceptionSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: [true, "Doctor ID is required"],
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
      // Enforce startDate <= endDate (BR: non-recurring schedule overrides)
      validate: {
        validator: function (value) {
          return this.startDate <= value;
        },
        message: "endDate must be greater than or equal to startDate",
      },
    },
    type: {
      type: String,
      enum: ["Vacation", "Blocked", "Emergency"],
      required: [true, "Exception type is required"],
    },
    reason: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

// Compound index for querying a doctor's exceptions by date range
// (used by getExceptionsByDoctor and checkExceptionForDate)
scheduleExceptionSchema.index({ doctorId: 1, startDate: 1, endDate: 1 });

module.exports = mongoose.model("ScheduleException", scheduleExceptionSchema);
