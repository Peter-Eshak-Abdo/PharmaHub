import mongoose, { Schema } from 'mongoose';

/**
 * Notification Schema
 * Alerts dispatched to users covering appointment changes, reminders, and payment receipts.
 */
const notificationSchema = new Schema(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient user reference is required']
    },
    message: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true
    },
    triggerEvent: {
      type: String,
      required: [true, 'Trigger event is required'],
      trim: true
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    readStatus: {
      type: String,
      enum: ['Read', 'Unread'],
      default: 'Unread'
    }
  },
  {
    timestamps: true
  }
);

notificationSchema.index({ recipient: 1, readStatus: 1, sentAt: -1 });

export default mongoose.model('Notification', notificationSchema);
