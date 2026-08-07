const express = require('express');
const router = express.Router();
const {
    addDiagnosis,
    getDiagnoses,
    getDiagnosisById,
} = require('../controllers/DiagnosisController');

// GET  /api/diagnoses       — fetch all diagnoses
// POST /api/diagnoses       — add a new diagnosis (Admin)
router.route('/').get(getDiagnoses).post(addDiagnosis);

// GET /api/diagnoses/:id    — fetch a single diagnosis
router.route('/:id').get(getDiagnosisById);

module.exports = router;
