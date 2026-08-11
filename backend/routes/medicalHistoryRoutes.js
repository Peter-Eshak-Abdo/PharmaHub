const express = require('express');
const router = express.Router();
const { getMedicalHistory } = require('../controllers/medicalHistoryController');

// Route: GET /api/patients/:patientId/medical-history
// Description: Computes and retrieves the full medical history for a patient
// Access: Currently public, but should be protected by Auth Middleware (Mayada's section)
router.get('/patients/:patientId/medical-history', getMedicalHistory);

module.exports = router;
