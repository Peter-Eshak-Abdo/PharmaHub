const express = require('express');
const router = express.Router();
const {
  addAvailability,
  getAvailabilityByDoctor,
  updateAvailability,
  deleteAvailability,
} = require('../controllers/availabilityController');
const auth = require('../middlewares/auth');

// Create a new weekly slot — protected, only the doctor (or admin) should do this
router.post('/', auth, addAvailability);

// Fetch a doctor's weekly schedule — public, patients need this to book
router.get('/:doctorId', getAvailabilityByDoctor);

// Update an existing slot — protected
router.put('/:id', auth, updateAvailability);

// Delete a slot — protected
router.delete('/:id', auth, deleteAvailability);

module.exports = router;