import mongoose, { Schema } from 'mongoose';

/**
 * ScheduleException Schema
 * Represents ad-hoc deviations from weekly templates (vacations, emergency leave, blocked dates).
 */
const scheduleExceptionSchema = new Schema(
  {
    doctor: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Doctor reference is required']
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required']
    },
    type: {
      type: String,
      enum: ['Vacation', 'Blocked', 'ExtraAvailability'],
      default: 'Vacation'
    }
  },
  {
    timestamps: true
  }
);

scheduleExceptionSchema.index({ doctor: 1, startDate: 1, endDate: 1 });

export default mongoose.model('ScheduleException', scheduleExceptionSchema);
