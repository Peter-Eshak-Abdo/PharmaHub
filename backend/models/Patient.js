import mongoose, { Schema } from 'mongoose';

/**
 * Patient Schema
 * Extended profile for users with role 'patient'.
 * Linked 1:1 to the User authentication record via user ObjectId.
 */
const patientSchema = new Schema(
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
    address: {
      type: String,
      trim: true
    },
    age: {
      type: Number,
      min: [0, 'Age cannot be negative'],
      max: [120, 'Age cannot exceed 120']
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    occupation: {
      type: String,
      trim: true
    },
    companyName: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Patient', patientSchema);
