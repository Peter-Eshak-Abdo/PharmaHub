import mongoose, { Schema } from 'mongoose';

/**
 * Medication Schema
 * Master reference catalog for pharmaceutical drugs and formulations.
 */
const medicationSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Medication name is required'],
      trim: true
    },
    genericName: {
      type: String,
      required: [true, 'Generic name is required'],
      trim: true
    },
    type: {
      type: String,
      required: [true, 'Medication form/type is required'],
      trim: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Medication', medicationSchema);
