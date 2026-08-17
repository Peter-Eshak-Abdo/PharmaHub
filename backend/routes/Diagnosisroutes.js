const express = require('express');
const router = express.Router();
const {
    addDiagnosis,
    getDiagnoses,
    getDiagnosisById,
} = require('../controllers/Diagnosiscontroller');

const { protect, checkRole } = require("../middlewares/auth");

// GET  /api/diagnoses       — fetch all diagnoses
// POST /api/diagnoses       — add a new diagnosis (Admin)
router.route('/').get(getDiagnoses).post(protect, checkRole(['admin', 'doctor']), addDiagnosis);

// GET /api/diagnoses/:id    — fetch a single diagnosis
router.route('/:id').get(getDiagnosisById);

module.exports = router;
