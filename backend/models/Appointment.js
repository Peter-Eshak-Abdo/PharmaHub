import mongoose, { Schema } from 'mongoose';

/**
 * Appointment Schema
 * Core consultation booking record between a Patient and a Doctor at a Clinic.
 * Includes a frozen consultationFeeSnapshot taken at booking time.
 */
const appointmentSchema = new Schema(
  {
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
    clinic: {
      type: Schema.Types.ObjectId,
      ref: 'Clinic',
      required: [true, 'Clinic reference is required']
    },
    bookingDate: {
      type: Date,
      default: Date.now
    },
    appointmentDate: {
      type: Date,
      required: [true, 'Appointment date is required']
    },
    appointmentTime: {
      type: String,
      required: [true, 'Appointment time is required'],
      match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format']
    },
    consultationType: {
      type: String,
      enum: ['InClinic', 'Online'],
      required: [true, 'Consultation type is required']
    },
    reason: {
      type: String,
      trim: true
    },
    durationMinutes: {
      type: Number,
      default: 30
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled', 'No-Show'],
      default: 'Pending'
    },
    consultationFeeSnapshot: {
      type: Number,
      required: [true, 'Consultation fee snapshot is required'],
      min: [0, 'Consultation fee snapshot cannot be negative']
    }
  },
  {
    timestamps: true
  }
);

// Index to prevent double booking conflicts (doctor + date + time)
appointmentSchema.index({ doctor: 1, appointmentDate: 1, appointmentTime: 1 });

export default mongoose.model('Appointment', appointmentSchema);
