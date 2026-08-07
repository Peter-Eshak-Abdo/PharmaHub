const Appointment = require("../models/Apponintments");
const Doctor = require("../models/Doctors");

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

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }

    const existingAppointment = await Appointment.findOne({
      doctorId,
      appointmentDate,
      appointmentTime,
      status: { $ne: "Cancelled" },
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: "This time slot is already booked for the selected doctor",
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
      consultationFeeSnapshot:
        consultationFeeSnapshot || doctor.consultationFeeSnapshot || 0,
    });

    res.status(201).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPatientAppointments = async (req, res) => {
  try {
    const { patientId } = req.params;

    const appointments = await Appointment.find({ patientId })
      .populate("doctorId", "fullName specialization rating")
      .sort({ appointmentDate: -1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDoctorAppointments = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const appointments = await Appointment.find({ doctorId })
      .populate("patientId", "fullName phoneNumber age gender")
      .sort({ appointmentDate: -1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "Pending",
      "Confirmed",
      "Completed",
      "Cancelled",
      "No-Show",
    ];
    if (!validStatuses.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status value" });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });
    }

    appointment.status = status;
    await appointment.save();

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
