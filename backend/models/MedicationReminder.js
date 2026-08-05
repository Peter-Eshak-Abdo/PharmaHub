import mongoose, { Schema } from 'mongoose';

/**
 * MedicationReminder Schema
 * Tracks dosage intake reminders and patient compliance.
 * References the parent Prescription and the specific embedded medication item subdocument ID.
 */
const medicationReminderSchema = new Schema(
  {
    prescription: {
      type: Schema.Types.ObjectId,
      ref: 'Prescription',
      required: [true, 'Prescription reference is required']
    },
    prescribedItemId: {
      type: Schema.Types.ObjectId,
      required: [true, 'Prescribed item subdocument ID is required']
    },
    scheduledTime: {
      type: Date,
      required: [true, 'Scheduled time is required']
    },
    acknowledgmentStatus: {
      type: String,
      enum: ['Pending', 'Acknowledged'],
      default: 'Pending'
    },
    completionStatus: {
      type: String,
      enum: ['Taken', 'Missed', 'Skipped'],
      default: 'Taken'
    }
  },
  {
    timestamps: true
  }
);

medicationReminderSchema.index({ scheduledTime: 1, completionStatus: 1 });

export default mongoose.model('MedicationReminder', medicationReminderSchema);
