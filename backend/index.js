const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/AuthRoutes");
const patientRoutes = require("./routes/PatientRoutes");
const doctorRoutes = require("./routes/DoctorRoutes");
const appointmentRoutes = require("./routes/AppoinmentRoutes");
const availabilityRoutes = require("./routes/AvailabilityRoutes");
const exceptionRoutes = require("./routes/ExceptionRoutes");
const diagnosisRoutes = require("./routes/Diagnosisroutes");
const medicationRoutes = require("./routes/Medicationroutes");
const prescriptionRoutes = require("./routes/Prescriptionroutes");
const reviewRoutes = require("./routes/ReviewRoutes");

dotenv.config();

const app = express();

// تمكين الطلبات المتقاطعة المصدر (CORS)
app.use(cors());
app.use(express.json());

// الاتصال بقاعدة البيانات
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected...'))
  .catch((err) => console.log('DB Connection Error:', err));

// مسارات المصادقة والمريض
app.use("/api/auth", authRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/exceptions", exceptionRoutes);
app.use("/api/diagnoses", diagnosisRoutes);
app.use("/api/medications", medicationRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/reviews", reviewRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
