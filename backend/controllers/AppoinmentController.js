const Appointment = require("../models/Appointments");
const Doctor = require("../models/Doctors");

// Create a new appointment, ensuring doctor exists and slot is free
exports.createAppointment = async (req, res) => {
  try {
    const {
      patientId,
      doctorId,
      appointmentDate,
      appointmentTime,
      consultationType,
      reasonForVisit,
      estimatedDurationMinutes,
      consultationFeeSnapshot,
    } = req.body;

    // Verify doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    // Prevent double‑booking of the same slot (excluding cancelled appointments)
    const existing = await Appointment.findOne({
      doctorId,
      appointmentDate,
      appointmentTime,
      status: { $ne: "Cancelled" },
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "This time slot is already booked for the selected doctor",
      });
    }

    const finalFee = consultationFeeSnapshot !== undefined ? consultationFeeSnapshot : doctor.consultationFeeSnapshot;
    if (finalFee === undefined || finalFee <= 0) {
      return res.status(400).json({
        success: false,
        message: "A valid consultation fee (> 0) must be provided either in the request or on the doctor's profile.",
      });
    }

    const appointment = await Appointment.create({
      patientId,
      doctorId,
      appointmentDate,
      appointmentTime,
      consultationType,
      reasonForVisit,
      estimatedDurationMinutes,
      consultationFeeSnapshot: finalFee,
    });
    res.status(201).json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// List all appointments for a patient
exports.getPatientAppointments = async (req, res) => {
  try {
    const { patientId } = req.params;
    const appointments = await Appointment.find({ patientId })
      .populate("doctorId", "fullName specialization rating")
      .sort({ appointmentDate: -1 });
    res.status(200).json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// List all appointments for a doctor
exports.getDoctorAppointments = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const appointments = await Appointment.find({ doctorId })
      .populate("patientId", "fullName phoneNumber age gender")
      .sort({ appointmentDate: -1 });
    res.status(200).json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update appointment status with strict state‑machine validation
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["Pending", "Confirmed", "Completed", "Cancelled", "No-Show"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    const allowedTransitions = {
      Pending: ["Confirmed", "Cancelled", "No-Show"],
      Confirmed: ["Completed", "Cancelled", "No-Show"],
      Completed: [],
      Cancelled: [],
      "No-Show": [],
    };
    if (!allowedTransitions[appointment.status].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid transition from ${appointment.status} to ${status}`,
      });
    }

    appointment.status = status;
    await appointment.save();
    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
};
