const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

const authRoutes = require('./routes/AuthRoutes');
const patientRoutes = require('./routes/patientRoutes');

dotenv.config();

connectDB();

const app = express();

app.use(express.json());

// مسارات المصادقة والمريض
app.use('/api/auth', authRoutes);
app.use('/api/patient', patientRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
