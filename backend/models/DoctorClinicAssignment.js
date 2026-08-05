import mongoose, { Schema } from 'mongoose';

/**
 * DoctorClinicAssignment Schema
 * Junction model linking Doctors and Clinics.
 * Holds location-specific consultation fees and active status.
 * Contains a compound unique index on { doctor: 1, clinic: 1 } to prevent duplicate assignments.
 */
const doctorClinicAssignmentSchema = new Schema(
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
    consultationFee: {
      type: Number,
      required: [true, 'Consultation fee is required'],
      min: [0, 'Consultation fee cannot be negative']
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Enforce unique doctor + clinic assignment index
doctorClinicAssignmentSchema.index({ doctor: 1, clinic: 1 }, { unique: true });

export default mongoose.model('DoctorClinicAssignment', doctorClinicAssignmentSchema);
