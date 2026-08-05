import mongoose, { Schema } from 'mongoose';

/**
 * Clinic Schema
 * Represents a physical or online medical facility hosting doctors.
 */
const clinicSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Clinic name is required'],
      trim: true
    },
    address: {
      type: String,
      required: [true, 'Clinic address is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    contactInfo: {
      type: String,
      required: [true, 'Contact information is required'],
      trim: true
    },
    workingHours: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Clinic', clinicSchema);
