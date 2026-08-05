import mongoose, { Schema } from 'mongoose';

/**
 * Diagnosis Schema
 * Master reference catalog for medical conditions and ICD codes.
 */
const diagnosisSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Diagnosis name is required'],
      trim: true
    },
    icdCode: {
      type: String,
      required: [true, 'ICD code is required'],
      unique: true,
      trim: true,
      uppercase: true
    },
    description: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Diagnosis', diagnosisSchema);
