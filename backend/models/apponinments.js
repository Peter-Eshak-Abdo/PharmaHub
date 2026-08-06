const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Patient ID is required']
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: [true, 'Doctor ID is required']
  },
  appointmentDate: {
    type: Date,
    required: [true, 'Appointment date is required']
  },
  appointmentTime: {
    type: String, // HH:MM format
    required: [true, 'Appointment time is required']
  },
  consultationType: {
    type: String,
    enum: ['In-Clinic', 'Online'], // Allowed consultation types
    required: [true, 'Consultation type is required']
  },
  reasonForVisit: {
    type: String
  },
  estimatedDurationMinutes: {
    type: Number
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled', 'No-Show'],
    default: 'Pending'
  },
  consultationFeeSnapshot: {
    type: Number, // Captures and freezes the fee at booking time
    required: [true, 'Consultation fee snapshot is required']
  },
  bookingDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for querying patient appointments by date
appointmentSchema.index({ patientId: 1, appointmentDate: 1 });

// Partial unique index to prevent overlapping active bookings for the same doctor at the same date and time
appointmentSchema.index(
  { doctorId: 1, appointmentDate: 1, appointmentTime: 1 },
  { partialFilterExpression: { status: { $ne: 'Cancelled' } } }
);

// Index to query appointments by status and date
appointmentSchema.index({ status: 1, appointmentDate: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
