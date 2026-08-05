import mongoose, { Schema } from 'mongoose';

/**
 * Embedded PrescribedMedication Subdocument Schema
 * Does NOT exist as a standalone model. Embedded inside Prescription.
 */
const prescribedMedicationSchema = new Schema({
  medication: {
    type: Schema.Types.ObjectId,
    ref: 'Medication',
    required: [true, 'Medication reference is required']
  },
  dosage: {
    type: String,
    required: [true, 'Dosage is required'],
    trim: true
  },
  frequency: {
    type: String,
    required: [true, 'Frequency is required'],
    trim: true
  },
  duration: {
    type: String,
    required: [true, 'Duration is required'],
    trim: true
  },
  instructions: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  }
});

/**
 * Prescription Schema
 * Issued upon completed appointments.
 * Contains embedded medications array and references to diagnoses catalog.
 */
const prescriptionSchema = new Schema(
  {
    appointment: {
      type: Schema.Types.ObjectId,
      ref: 'Appointment',
      required: [true, 'Appointment reference is required'],
      unique: true
    },
    issuedDate: {
      type: Date,
      default: Date.now
    },
    diagnosisIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Diagnosis'
      }
    ],
    medications: [prescribedMedicationSchema]
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Prescription', prescriptionSchema);
