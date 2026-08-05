import mongoose, { Schema } from 'mongoose';

/**
 * Payment Schema
 * Holds transaction processing logs and financial audit entries linked 1:1 with an Appointment.
 */
const paymentSchema = new Schema(
  {
    appointment: {
      type: Schema.Types.ObjectId,
      ref: 'Appointment',
      required: [true, 'Appointment reference is required'],
      unique: true
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0, 'Amount cannot be negative']
    },
    method: {
      type: String,
      enum: ['Cash', 'Card', 'Wallet'],
      required: [true, 'Payment method is required']
    },
    paymentDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
      default: 'Pending'
    },
    transactionRef: {
      type: String,
      trim: true,
      sparse: true
    },
    attemptCount: {
      type: Number,
      default: 1,
      min: 1
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Payment', paymentSchema);
