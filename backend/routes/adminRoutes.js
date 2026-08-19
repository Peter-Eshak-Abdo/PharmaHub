const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const isAdmin = require('../middlewares/isAdmin');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');

// All admin routes are protected by JWT + Admin Role
router.use(protect, isAdmin);

// === 1. Overview Stats ===
router.get('/stats', async (req, res) => {
  try {
    const [doctors, patients, appointments] = await Promise.all([
      Doctor.countDocuments(),
      Patient.countDocuments(),
      Appointment.countDocuments(),
    ]);
    res.json({
      success: true,
      data: { doctors, patients, appointments },
      doctors,
      patients,
      appointments
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// === 2. Doctors Management ===
router.get('/doctors', async (req, res) => {
  try {
    const doctors = await Doctor.find().populate('userId', 'email createdAt role');
    res.json({ success: true, data: doctors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.patch('/doctors/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    res.json({ success: true, data: doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/doctors/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (doctor && doctor.userId) {
      await User.findByIdAndDelete(doctor.userId);
    }
    res.json({ success: true, message: 'Doctor and associated user account deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// === 3. Patients Management ===
router.get('/patients', async (req, res) => {
  try {
    const patients = await Patient.find().populate('userId', 'email createdAt role');
    res.json({ success: true, data: patients });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.patch('/patients/:id', async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    res.json({ success: true, data: patient });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/patients/:id', async (req, res) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    if (patient && patient.userId) {
      await User.findByIdAndDelete(patient.userId);
    }
    res.json({ success: true, message: 'Patient and associated user account deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// === 4. Appointments Management ===
router.get('/appointments', async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patientId', 'fullName phoneNumber')
      .populate('doctorId', 'fullName specialization')
      .sort({ appointmentDate: -1 });
    res.json({ success: true, data: appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.patch('/appointments/:id/cancel', async (req, res) => {
  try {
    const appt = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: 'Cancelled' },
      { new: true }
    );
    if (!appt) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    res.json({ success: true, data: appt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
