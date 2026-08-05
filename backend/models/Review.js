import mongoose, { Schema } from 'mongoose';

/**
 * Review Schema
 * Authentic patient feedback for a completed visit (1:1 with Appointment).
 */
const reviewSchema = new Schema(
  {
    appointment: {
      type: Schema.Types.ObjectId,
      ref: 'Appointment',
      required: [true, 'Appointment reference is required'],
      unique: true
    },
    patient: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Patient reference is required']
    },
    doctor: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Doctor reference is required']
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    comment: {
      type: String,
      trim: true
    },
    submittedDate: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

reviewSchema.index({ doctor: 1, submittedDate: -1 });

export default mongoose.model('Review', reviewSchema);
