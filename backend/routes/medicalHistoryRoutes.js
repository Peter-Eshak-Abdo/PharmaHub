const express = require('express');
const router = express.Router();
const { getMedicalHistory } = require('../controllers/medicalHistoryController');

// Route: GET /api/patient/:patientId/medical-history
// Description: Computes and retrieves the full medical history for a patient
router.get('/:patientId/medical-history', getMedicalHistory);

module.exports = router;

