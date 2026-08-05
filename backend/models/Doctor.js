import mongoose, { Schema } from 'mongoose';

/**
 * Doctor Schema
 * Extended profile for users with role 'doctor'.
 * Consultation fee is intentionally omitted here because a doctor's fee varies per clinic
 * (fee lives on DoctorClinicAssignment model).
 */
const doctorSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true
    },
    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
      trim: true
    },
    education: {
      type: String,
      trim: true
    },
    qualifications: {
      type: String,
      trim: true
    },
    yearsExperience: {
      type: Number,
      min: [0, 'Years of experience cannot be negative'],
      default: 0
    },
    bio: {
      type: String,
      trim: true
    },
    rating: {
      type: Number,
      min: [0, 'Rating cannot be below 0'],
      max: [5, 'Rating cannot exceed 5'],
      default: 0
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Doctor', doctorSchema);
