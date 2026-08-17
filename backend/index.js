const crypto = require('crypto');
global.crypto = crypto;

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/PatientRoutes');
const doctorRoutes = require('./routes/DoctorRoutes');
const appointmentRoutes = require('./routes/AppoinmentRoutes');
const availabilityRoutes = require('./routes/AvailabilityRoutes');
const exceptionRoutes = require('./routes/exceptionRoutes');
const diagnosisRoutes = require('./routes/Diagnosisroutes');
const medicationRoutes = require('./routes/Medicationroutes');
const prescriptionRoutes = require('./routes/Prescriptionroutes');
const reviewRoutes = require('./routes/ReviewRoutes');
const medicalHistoryRoutes = require('./routes/medicalHistoryRoutes');
const chatRoutes = require('./routes/chatRoutes');

// Load environment variables
dotenv.config();
const app = express();

// Connect to MongoDB
// connectDB();
// Middleware للاتصال بالداتا بيز قبل تنفيذ أي طلب
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Database connection error:', err);
    res.status(500).json({ success: false, message: 'Database Connection Error' });
  }
});


// Middlewares
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Base / Health Check Route
app.get('/', (req, res) => {
  res.json({ message: 'PharmaHub API is running smoothly 🚀' });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/exceptions', exceptionRoutes);
app.use('/api/diagnoses', diagnosisRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/patients', medicalHistoryRoutes);
app.use('/api/chat', chatRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 8080;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} 🚀`);
  });
}

module.exports = app;
