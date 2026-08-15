const mongoose = require('mongoose');

// Embedded subdocument schema for each prescribed medication line item
const prescribedMedicationSchema = new mongoose.Schema({
    medicationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Medication',
        required: [true, 'medicationId is required'],
    },
    dosage: {
        type: String,
        required: [true, 'Dosage is required'],
        trim: true,
    },
    frequency: {
        type: String,
        required: [true, 'Frequency is required'],
        trim: true,
    },
    duration: {
        type: String,
        required: [true, 'Duration is required'],
        trim: true,
    },
    instructions: {
        type: String,
        default: null,
    },
    notes: {
        type: String,
        default: null,
    },
});

const prescriptionSchema = new mongoose.Schema(
    {
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Patient',
            required: [true, 'patientId is required'],
        },
        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Doctor',
            required: [true, 'doctorId is required'],
        },
        appointmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Appointment',
            required: [true, 'appointmentId is required'],
            unique: true, // Enforces 1:1 — one prescription per appointment (BR-RX-002)
        },
        issuedDate: {
            type: Date,
            default: Date.now,
            immutable: true, // BR-RX-007: immutable after creation
        },
        diagnosisIds: {
            type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Diagnosis' }],
            default: [],
        },
        medications: {
            type: [prescribedMedicationSchema],
            required: [true, 'At least one medication is required'],
            validate: {
                validator: (arr) => arr.length > 0,
                message: 'Prescription must contain at least one medication',
            },
        },
        notes: {
            type: String,
            default: null,
        },
    },
    { timestamps: true }
);

const Prescription = mongoose.model('Prescription', prescriptionSchema);
module.exports = Prescription;