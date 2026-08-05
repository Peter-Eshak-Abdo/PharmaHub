import mongoose, { Schema } from 'mongoose';

/**
 * User Schema
 * Central identity and authentication model for all system users (Patient, Doctor, Admin).
 * Personal and clinical metadata live in extended profiles (Patient/Doctor models).
 */
const userSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required']
    },
    role: {
      type: String,
      enum: {
        values: ['patient', 'doctor', 'admin'],
        message: '{VALUE} is not a valid user role'
      },
      required: [true, 'User role is required']
    }
  },
  {
    timestamps: true
  }
);

// Index email for fast authentication lookups
userSchema.index({ email: 1 });

export default mongoose.model('User', userSchema);
