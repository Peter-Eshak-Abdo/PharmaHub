const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');

dotenv.config();

const app = express();

app.use(express.json());

// الاتصال بقاعدة البيانات
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected...'))
  .catch((err) => console.log('DB Connection Error:', err));

// مسارات المصادقة والمريض
app.use('/api/auth', authRoutes);
app.use('/api/patient', patientRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});