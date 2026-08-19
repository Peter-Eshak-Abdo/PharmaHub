const Diagnosis = require('../models/Diagnosis');

// POST /api/diagnoses
// Add a new diagnosis to the catalog (Admin only)
const addDiagnosis = async (req, res) => {
    try {
        const { name, icdCode, description } = req.body;

        const diagnosis = await Diagnosis.create({ name, icdCode, description });

        res.status(201).json({
            success: true,
            data: diagnosis,
        });
    } catch (error) {
        // Duplicate key error (name or icdCode already exists)
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            return res.status(409).json({
                success: false,
                message: `A diagnosis with this ${field} already exists`,
            });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

const getDiagnoses = async (req, res) => {
    try {
        const { search } = req.query;
        const filter = search
            ? {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { icdCode: { $regex: search, $options: 'i' } }
                ]
            }
            : {};

        const diagnoses = await Diagnosis.find(filter).sort({ name: 1 });

        res.status(200).json({
            success: true,
            count: diagnoses.length,
            data: diagnoses,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/diagnoses/:id
// Fetch a single diagnosis by ID
const getDiagnosisById = async (req, res) => {
    try {
        const diagnosis = await Diagnosis.findById(req.params.id);

        if (!diagnosis) {
            return res.status(404).json({ success: false, message: 'Diagnosis not found' });
        }

        res.status(200).json({ success: true, data: diagnosis });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { addDiagnosis, getDiagnoses, getDiagnosisById };
