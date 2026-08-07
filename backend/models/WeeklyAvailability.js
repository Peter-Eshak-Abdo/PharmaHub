const mongoose = require("mongoose");

const weeklyAvailabilitySchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: [true, "Doctor ID is required"],
    },
    dayOfWeek: {
      type: String,
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      required: [true, "Day of week is required"],
    },
    startTime: {
      type: String,
      required: [true, "Start time is required"],
      // HH:MM 24-hour format (e.g. "09:00", "17:30")
      match: [
        /^([01]\d|2[0-3]):([0-5]\d)$/,
        "startTime must be in HH:MM format",
      ],
    },
    endTime: {
      type: String,
      required: [true, "End time is required"],
      // HH:MM 24-hour format (e.g. "09:00", "17:30")
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, "endTime must be in HH:MM format"],
      // Enforce endTime > startTime (BR-SCHED-001: valid time window).
      // Lexical comparison is safe for 24-hour HH:MM strings.
      // The controller loads the doc first so this validator compares
      // against the *updated* startTime during save().
      validate: {
        validator: function (value) {
          return this.startTime < value;
        },
        message: "endTime must be greater than startTime",
      },
    },
    slotDurationMinutes: {
      type: Number,
      required: [true, "Slot duration is required"],
      // BR-SCHED-002: slot granularity must be a positive integer (e.g. 30, 45, 60)
      min: [1, "slotDurationMinutes must be a positive integer"],
    },
  },
  {
    timestamps: true,
  },
);

// Unique compound index: a doctor can only have one slot per day of week.
// Enforced by addAvailability / updateAvailability (handles 11000 duplicate key).
weeklyAvailabilitySchema.index({ doctorId: 1, dayOfWeek: 1 }, { unique: true });

module.exports = mongoose.model("WeeklyAvailability", weeklyAvailabilitySchema);
