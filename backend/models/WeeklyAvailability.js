import mongoose, { Schema } from 'mongoose';

/**
 * WeeklyAvailability Schema
 * Defines recurring weekly schedule templates for a doctor at a clinic location.
 */
const weeklyAvailabilitySchema = new Schema(
  {
    doctor: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Doctor reference is required']
    },
    clinic: {
      type: Schema.Types.ObjectId,
      ref: 'Clinic',
      required: [true, 'Clinic reference is required']
    },
    dayOfWeek: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: [true, 'Day of week is required']
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Start time must be in HH:MM format']
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
      match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'End time must be in HH:MM format']
    },
    slotDurationMinutes: {
      type: Number,
      default: 30,
      min: [10, 'Slot duration must be at least 10 minutes'],
      max: [120, 'Slot duration cannot exceed 120 minutes']
    }
  },
  {
    timestamps: true
  }
);

weeklyAvailabilitySchema.index({ doctor: 1, clinic: 1, dayOfWeek: 1 });

export default mongoose.model('WeeklyAvailability', weeklyAvailabilitySchema);
