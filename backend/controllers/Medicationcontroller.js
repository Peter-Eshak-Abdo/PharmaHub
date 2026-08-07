const Medication = require('../models/Medication');

// POST /api/medications
// Add a new medication to the catalog (Admin only)
const addMedication = async (req, res) => {
    try {
        const { name, genericName, type } = req.body;

        const medication = await Medication.create({ name, genericName, type });

        res.status(201).json({
            success: true,
            data: medication,
        });
    } catch (error) {
        // Duplicate key error (name already exists)
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'A medication with this name already exists',
            });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/medications
// Fetch all medications in the catalog
const getMedications = async (req, res) => {
    try {
        // Optional filter by type: GET /api/medications?type=Antibiotic
        const filter = req.query.type ? { type: req.query.type } : {};

        const medications = await Medication.find(filter).sort({ name: 1 });

        res.status(200).json({
            success: true,
            count: medications.length,
            data: medications,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/medications/:id
// Fetch a single medication by ID
const getMedicationById = async (req, res) => {
    try {
        const medication = await Medication.findById(req.params.id);

        if (!medication) {
            return res.status(404).json({ success: false, message: 'Medication not found' });
        }

        res.status(200).json({ success: true, data: medication });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { addMedication, getMedications, getMedicationById };