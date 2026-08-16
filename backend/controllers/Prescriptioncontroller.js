const Prescription = require("../models/Prescription");
const Appointment = require('../models/Appointment');
const Diagnosis = require("../models/Diagnosis");
const Medication = require("../models/Medication");

// POST /api/prescriptions
// Create a new prescription for a completed appointment (Doctor only)
const createPrescription = async (req, res) => {
  try {
    const {
      patientId,
      doctorId,
      appointmentId,
      diagnosisIds = [],
      medications,
      notes,
    } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    if (appointment.status !== 'Completed') {
        return res.status(400).json({
            success: false,
            message: 'Prescription can only be created for a Completed appointment (BR-RX-001)',
        });
    }

    // BR-RX-004: Validate all diagnosisIds exist in the catalog
    if (diagnosisIds.length > 0) {
      const foundDiagnoses = await Diagnosis.find({
        _id: { $in: diagnosisIds },
      });
      if (foundDiagnoses.length !== diagnosisIds.length) {
        return res.status(400).json({
          success: false,
          message:
            "One or more diagnosisIds do not exist in the Diagnosis catalog (BR-RX-004)",
        });
      }
    }

    // BR-RX-005: Validate all medicationIds in medications array exist
    const medicationIds = medications.map((m) => m.medicationId);
    const foundMedications = await Medication.find({
      _id: { $in: medicationIds },
    });
    if (foundMedications.length !== medicationIds.length) {
      return res.status(400).json({
        success: false,
        message:
          "One or more medicationIds do not exist in the Medication catalog (BR-RX-005)",
      });
    }

    const prescription = await Prescription.create({
      patientId,
      doctorId,
      appointmentId,
      diagnosisIds,
      medications,
      notes,
    });

    res.status(201).json({ success: true, data: prescription });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "A prescription already exists for this appointment (BR-RX-002)",
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/prescriptions/appointment/:appointmentId
const getPrescriptionByAppointmentId = async (req, res) => {
  try {
    const prescription = await Prescription.findOne({
      appointmentId: req.params.appointmentId,
    })
      .populate("patientId", "fullName phoneNumber")
      .populate("doctorId", "fullName specialization")
      // .populate('appointmentId', 'appointmentDate appointmentTime status')
      .populate("diagnosisIds", "name icdCode description")
      .populate("medications.medicationId", "name genericName type");

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "No prescription found for this appointment",
      });
    }

    res.status(200).json({ success: true, data: prescription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/prescriptions/patient/:patientId
const getPrescriptionsByPatient = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({
      patientId: req.params.patientId,
    })
      .sort({ issuedDate: -1 })
      .populate("doctorId", "fullName specialization")
      // .populate('appointmentId', 'appointmentDate appointmentTime consultationType')
      .populate("diagnosisIds", "name icdCode")
      .populate("medications.medicationId", "name genericName type");

    res.status(200).json({
      success: true,
      count: prescriptions.length,
      data: prescriptions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createPrescription,
  getPrescriptionByAppointmentId,
  getPrescriptionsByPatient,
};
