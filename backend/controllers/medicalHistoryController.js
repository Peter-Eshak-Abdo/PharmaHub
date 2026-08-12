const mongoose = require('mongoose');
const Appointment = require('../models/Appointments');

/**
 * @desc    Get complete medical history for a patient via Aggregation Pipeline
 * @route   GET /api/patients/:patientId/medical-history
 * @access  Private (Patient/Doctor/Admin)
 */
const getMedicalHistory = async (req, res) => {
    try {
        const { patientId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(patientId)) {
            return res.status(400).json({ success: false, message: 'Invalid patient ID format' });
        }

        // Implementation of Clause 2.5 (Dynamic Medical History)
        // We use Aggregation to prevent data duplication. We start at Appointments.
        const historyPipeline = [
            // 1. Find all completed appointments for this patient
            {
                $match: {
                    patientId: new mongoose.Types.ObjectId(patientId),
                    status: 'Completed'
                }
            },
            // 2. Lookup Doctor information
            {
                $lookup: {
                    from: 'doctors', 
                    localField: 'doctorId',
                    foreignField: '_id',
                    as: 'doctor'
                }
            },
            { $unwind: { path: '$doctor', preserveNullAndEmptyArrays: true } },
            
            // 3. Lookup Prescription associated with this Appointment
            {
                $lookup: {
                    from: 'prescriptions', 
                    localField: '_id',
                    foreignField: 'appointmentId',
                    as: 'prescription'
                }
            },
            { $unwind: { path: '$prescription', preserveNullAndEmptyArrays: true } },
            
            // 4. Lookup Diagnoses associated with the Prescription
            {
                $lookup: {
                    from: 'diagnoses', 
                    localField: 'prescription.diagnosisIds',
                    foreignField: '_id',
                    as: 'diagnoses'
                }
            },

            // 4.5 Lookup Medications associated with the Prescription
            {
                $lookup: {
                    from: 'medications', 
                    localField: 'prescription.medications.medicationId',
                    foreignField: '_id',
                    as: 'medicationDetails'
                }
            },

            // 5. Structure the final output view
            {
                $project: {
                    _id: 1,
                    appointmentDate: 1,
                    appointmentTime: 1,
                    reasonForVisit: 1,
                    'doctor.fullName': 1,
                    'doctor.specialization': 1,
                    diagnoses: {
                        name: 1,
                        icdCode: 1
                    },
                    'prescription.medications': 1,
                    medicationDetails: {
                        name: 1,
                        genericName: 1,
                        type: 1
                    },
                    'prescription.notes': 1,
                    'prescription.issuedDate': 1
                }
            },
            
            // 6. Sort chronologically (newest first)
            { $sort: { appointmentDate: -1, appointmentTime: -1 } }
        ];

        const medicalHistory = await Appointment.aggregate(historyPipeline);

        res.status(200).json({
            success: true,
            count: medicalHistory.length,
            data: medicalHistory
        });

    } catch (error) {
        console.error('Error computing medical history:', error);
        res.status(500).json({ success: false, message: 'Server Error computing history' });
    }
};

module.exports = {
    getMedicalHistory
};
