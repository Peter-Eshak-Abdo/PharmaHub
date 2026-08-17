const mongoose = require('mongoose');
const Appointment = require('../models/Appointments');
const Patient = require('../models/Patients');

/**
 * Executes the Aggregation Pipeline for a patient's completed medical history
 * and converts it into a concise, rich context for the AI Chatbot System Prompt.
 * 
 * @param {string|mongoose.Types.ObjectId} patientId 
 * @returns {Promise<{ systemPromptContext: string, summary: object, historyRecords: Array }>}
 */
async function buildPatientMedicalContext(patientId) {
    if (!patientId || !mongoose.Types.ObjectId.isValid(patientId)) {
        return {
            systemPromptContext: "No patient medical history available (guest or unidentified profile).",
            summary: {
                hasHistory: false,
                totalVisits: 0,
                diagnosesCount: 0,
                medicationsCount: 0,
                diagnoses: [],
                medications: []
            },
            historyRecords: []
        };
    }

    try {
        const pId = new mongoose.Types.ObjectId(patientId);

        // Fetch patient demographic details
        const patient = await Patient.findById(pId).lean();

        // Medical History Aggregation Pipeline
        const historyPipeline = [
            {
                $match: {
                    patientId: pId,
                    status: 'Completed'
                }
            },
            {
                $lookup: {
                    from: 'doctors',
                    localField: 'doctorId',
                    foreignField: '_id',
                    as: 'doctor'
                }
            },
            { $unwind: { path: '$doctor', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'prescriptions',
                    localField: '_id',
                    foreignField: 'appointmentId',
                    as: 'prescription'
                }
            },
            { $unwind: { path: '$prescription', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'diagnoses',
                    localField: 'prescription.diagnosisIds',
                    foreignField: '_id',
                    as: 'diagnoses'
                }
            },
            {
                $lookup: {
                    from: 'medications',
                    localField: 'prescription.medications.medicationId',
                    foreignField: '_id',
                    as: 'medicationCatalog'
                }
            },
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
                        icdCode: 1,
                        description: 1
                    },
                    'prescription.medications': 1,
                    'prescription.notes': 1,
                    'prescription.issuedDate': 1,
                    medicationCatalog: {
                        _id: 1,
                        name: 1,
                        genericName: 1,
                        type: 1
                    }
                }
            },
            { $sort: { appointmentDate: -1, appointmentTime: -1 } }
        ];

        const historyRecords = await Appointment.aggregate(historyPipeline);

        // Collect unique diagnoses and medications
        const uniqueDiagnoses = new Map();
        const uniqueMedications = new Map();
        const visitsSummary = [];

        historyRecords.forEach(record => {
            const dateStr = record.appointmentDate ? new Date(record.appointmentDate).toISOString().split('T')[0] : 'N/A';
            const docName = record.doctor?.fullName || 'Specialist Doctor';
            const specialty = record.doctor?.specialization || 'General Medicine';

            // Collect diagnoses
            if (Array.isArray(record.diagnoses)) {
                record.diagnoses.forEach(diag => {
                    if (diag && diag.name) {
                        uniqueDiagnoses.set(diag.name, diag.icdCode ? `${diag.name} (ICD: ${diag.icdCode})` : diag.name);
                    }
                });
            }

            // Map catalog items by ID for easy lookup
            const catalogMap = new Map();
            if (Array.isArray(record.medicationCatalog)) {
                record.medicationCatalog.forEach(m => {
                    if (m && m._id) catalogMap.set(m._id.toString(), m);
                });
            }

            // Collect medications
            const recordMeds = [];
            if (record.prescription && Array.isArray(record.prescription.medications)) {
                record.prescription.medications.forEach(med => {
                    const catalogItem = med.medicationId ? catalogMap.get(med.medicationId.toString()) : null;
                    const medName = catalogItem?.name || med.name || 'Prescribed Medicine';
                    const details = `${medName}${catalogItem?.genericName ? ` (${catalogItem.genericName})` : ''} - Dosage: ${med.dosage || 'Standard'}, Frequency: ${med.frequency || 'As directed'}${med.instructions ? `, Instructions: ${med.instructions}` : ''}`;
                    
                    uniqueMedications.set(medName, details);
                    recordMeds.push(medName);
                });
            }

            visitsSummary.push({
                date: dateStr,
                doctor: `${docName} (${specialty})`,
                reason: record.reasonForVisit || 'Checkup/Consultation',
                diagnoses: record.diagnoses?.map(d => d.name).join(', ') || 'None specified',
                medications: recordMeds.length > 0 ? recordMeds.join(', ') : 'None prescribed',
                doctorNotes: record.prescription?.notes || ''
            });
        });

        const patientName = patient?.fullName || 'Patient';
        const patientAge = patient?.age ? `${patient.age} years old` : 'Unknown age';
        const patientGender = patient?.gender || 'Unspecified';

        const diagnosesList = Array.from(uniqueDiagnoses.values());
        const medicationsList = Array.from(uniqueMedications.values());

        // Build Markdown Context for System Prompt
        let contextText = `=== PATIENT MEDICAL RECORD CONTEXT ===\n`;
        contextText += `- Patient Name: ${patientName}\n`;
        contextText += `- Demographics: ${patientAge}, Gender: ${patientGender}\n`;
        contextText += `- Recorded Medical Visits: ${visitsSummary.length}\n\n`;

        if (diagnosesList.length > 0) {
            contextText += `[Diagnosed Conditions / Medical History]:\n`;
            diagnosesList.forEach(d => {
                contextText += `* ${d}\n`;
            });
            contextText += `\n`;
        } else {
            contextText += `[Diagnosed Conditions]: No chronic or past diagnoses on record.\n\n`;
        }

        if (medicationsList.length > 0) {
            contextText += `[Prescribed Medications & Treatment Regimen]:\n`;
            medicationsList.forEach(m => {
                contextText += `* ${m}\n`;
            });
            contextText += `\n`;
        } else {
            contextText += `[Prescribed Medications]: No active or past medications found in records.\n\n`;
        }

        if (visitsSummary.length > 0) {
            contextText += `[Recent Medical Visit Logs (Newest First)]:\n`;
            visitsSummary.slice(0, 5).forEach((v, idx) => {
                contextText += `Visit #${idx + 1} (${v.date}) with ${v.doctor}:\n`;
                contextText += `  - Reason: ${v.reason}\n`;
                contextText += `  - Diagnosis: ${v.diagnoses}\n`;
                contextText += `  - Prescribed Meds: ${v.medications}\n`;
                if (v.doctorNotes) contextText += `  - Doctor's Notes: ${v.doctorNotes}\n`;
            });
            contextText += `\n`;
        }

        contextText += `=== END OF PATIENT RECORD ===`;

        const summary = {
            hasHistory: historyRecords.length > 0,
            patientName,
            patientAge: patient?.age,
            patientGender: patient?.gender,
            totalVisits: historyRecords.length,
            diagnosesCount: diagnosesList.length,
            medicationsCount: medicationsList.length,
            diagnoses: Array.from(uniqueDiagnoses.keys()),
            medications: Array.from(uniqueMedications.keys())
        };

        return {
            systemPromptContext: contextText,
            summary,
            historyRecords
        };

    } catch (error) {
        console.error('Error building patient medical context:', error);
        return {
            systemPromptContext: "Error accessing medical history records. Proceeding with general medical assistance.",
            summary: {
                hasHistory: false,
                totalVisits: 0,
                diagnosesCount: 0,
                medicationsCount: 0,
                diagnoses: [],
                medications: []
            },
            historyRecords: []
        };
    }
}

module.exports = {
    buildPatientMedicalContext
};
