const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const WeeklyAvailability = require("../models/WeeklyAvailability");
const ScheduleException = require("../models/ScheduleException");

// =============================================
// Helper: Validate slot availability (BR-APP-004)
// =============================================
async function validateSlot(doctorId, appointmentDate, appointmentTime) {
  const date = new Date(appointmentDate);
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const dayOfWeek = dayNames[date.getDay()];

  // 1. Check weekly availability
  const avail = await WeeklyAvailability.findOne({ doctorId, dayOfWeek });
  if (!avail) {
    throw new Error(`الطبيب غير متاح يوم ${dayOfWeek}`);
  }

  // Check time within window
  const [reqH, reqM] = appointmentTime.split(":").map(Number);
  const [startH, startM] = avail.startTime.split(":").map(Number);
  const [endH, endM] = avail.endTime.split(":").map(Number);
  const reqMins = reqH * 60 + reqM;
  const startMins = startH * 60 + startM;
  const endMins = endH * 60 + endM;
  if (reqMins < startMins || reqMins >= endMins) {
    throw new Error(
      `الوقت المختار خارج ساعات عمل الطبيب (${avail.startTime} - ${avail.endTime})`,
    );
  }

  // Check slot granularity
  if ((reqMins - startMins) % avail.slotDurationMinutes !== 0) {
    throw new Error(
      `الوقت المختار لا يتوافق مع فترات الجلسات (${avail.slotDurationMinutes} دقيقة)`,
    );
  }

  // 2. Check schedule exceptions
  const exception = await ScheduleException.findOne({
    doctorId,
    startDate: { $lte: date },
    endDate: { $gte: date },
  });
  if (exception) {
    throw new Error(
      `الطبيب غير متاح في هذا اليوم (${exception.type}: ${exception.reason || ""})`,
    );
  }

  // 3. Check double-booking (BR-SCHED-004)
  const conflict = await Appointment.findOne({
    doctorId,
    appointmentDate: date,
    appointmentTime,
    status: { $nin: ["Cancelled"] },
  });
  if (conflict) {
    throw new Error("هذا الموعد محجوز بالفعل، يرجى اختيار وقت آخر");
  }
}

// =============================================
// POST /api/appointments — Create Appointment
// =============================================
exports.createAppointment = async (req, res) => {
  try {
    const {
      doctorId,
      appointmentDate,
      appointmentTime,
      consultationType,
      reasonForVisit,
    } = req.body;

    // Get patient profile from logged-in user
    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient) {
      return res
        .status(404)
        .json({ success: false, message: "ملف المريض غير موجود" });
    }

    // Verify doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: "الطبيب غير موجود" });
    }

    // Validate slot (BR-APP-004, BR-SCHED-004)
    await validateSlot(doctorId, appointmentDate, appointmentTime);

    // BR-APP-001: Snapshot fee
    const consultationFeeSnapshot = doctor.consultationFee || 0;

    const appointment = await Appointment.create({
      patientId: patient._id,
      doctorId,
      appointmentDate,
      appointmentTime,
      consultationType,
      reasonForVisit,
      estimatedDurationMinutes: doctor.slotDurationMinutes,
      consultationFeeSnapshot,
      status: "Pending",
    });

    res.status(201).json({
      success: true,
      message: "تم حجز الموعد بنجاح",
      data: appointment,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// =============================================
// GET /api/appointments/patient — Patient's appointments
// =============================================
exports.getPatientAppointments = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient) {
      return res
        .status(404)
        .json({ success: false, message: "ملف المريض غير موجود" });
    }

    const { status, page = 1, limit = 10 } = req.query;
    const filter = { patientId: patient._id };
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [appointments, total] = await Promise.all([
      Appointment.find(filter)
        .populate("doctorId", "fullName specialization consultationFee")
        .sort({ appointmentDate: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Appointment.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: appointments,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: "خطأ في جلب المواعيد",
        error: err.message,
      });
  }
};

// =============================================
// GET /api/appointments/doctor — Doctor's appointments
// =============================================
exports.getDoctorAppointments = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: "ملف الطبيب غير موجود" });
    }

    const { status, date, page = 1, limit = 10 } = req.query;
    const filter = { doctorId: doctor._id };
    if (status) filter.status = status;
    if (date) {
      const d = new Date(date);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      filter.appointmentDate = { $gte: d, $lt: next };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [appointments, total] = await Promise.all([
      Appointment.find(filter)
        .populate("patientId", "fullName age gender phoneNumber")
        .sort({ appointmentDate: 1, appointmentTime: 1 })
        .skip(skip)
        .limit(Number(limit)),
      Appointment.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: appointments,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: "خطأ في جلب المواعيد",
        error: err.message,
      });
  }
};

// =============================================
// GET /api/appointments/:id — Single appointment
// =============================================
exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("patientId", "fullName age gender phoneNumber")
      .populate("doctorId", "fullName specialization");

    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: "الموعد غير موجود" });
    }

    // Authorization: only the patient or doctor can view
    const patient = await Patient.findOne({ userId: req.user.id });
    const doctor = await Doctor.findOne({ userId: req.user.id });
    const isOwner =
      (patient &&
        appointment.patientId._id.toString() === patient._id.toString()) ||
      (doctor && appointment.doctorId._id.toString() === doctor._id.toString());

    if (!isOwner && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "غير مصرح بعرض هذا الموعد" });
    }

    res.json({ success: true, data: appointment });
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: "خطأ في جلب الموعد",
        error: err.message,
      });
  }
};

// =============================================
// PATCH /api/appointments/:id/status — Update status
// =============================================
const VALID_TRANSITIONS = {
  Pending: ["Confirmed", "Cancelled"],
  Confirmed: ["Completed", "Cancelled", "No-Show"],
  Completed: [],
  Cancelled: [],
  "No-Show": [],
};

exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: "الموعد غير موجود" });
    }

    // BR-APP-003: State machine check
    const allowed = VALID_TRANSITIONS[appointment.status] || [];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `لا يمكن تغيير الحالة من "${appointment.status}" إلى "${status}"`,
      });
    }

    // Authorization
    const doctor = await Doctor.findOne({ userId: req.user.id });
    const patient = await Patient.findOne({ userId: req.user.id });

    const isDoctor =
      doctor && appointment.doctorId.toString() === doctor._id.toString();
    const isPatient =
      patient && appointment.patientId.toString() === patient._id.toString();

    // Only doctor/admin can Confirm, Complete, No-Show
    if (
      ["Confirmed", "Completed", "No-Show"].includes(status) &&
      !isDoctor &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ success: false, message: "فقط الطبيب يمكنه تغيير هذه الحالة" });
    }

    // Patient can only cancel
    if (
      status === "Cancelled" &&
      !isPatient &&
      !isDoctor &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ success: false, message: "غير مصرح" });
    }

    appointment.status = status;
    await appointment.save();

    res.json({
      success: true,
      message: "تم تحديث حالة الموعد",
      data: appointment,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// =============================================
// DELETE /api/appointments/:id — Cancel appointment
// =============================================
exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: "الموعد غير موجود" });
    }

    if (!["Pending", "Confirmed"].includes(appointment.status)) {
      return res.status(400).json({
        success: false,
        message: "لا يمكن إلغاء موعد في هذه الحالة",
      });
    }

    appointment.status = "Cancelled";
    await appointment.save();

    res.json({ success: true, message: "تم إلغاء الموعد بنجاح" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// =============================================
// GET /api/appointments/available-slots
// =============================================
exports.getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;
    if (!doctorId || !date) {
      return res
        .status(400)
        .json({ success: false, message: "doctorId و date مطلوبان" });
    }

    const targetDate = new Date(date);
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const dayOfWeek = dayNames[targetDate.getDay()];

    const avail = await WeeklyAvailability.findOne({ doctorId, dayOfWeek });
    if (!avail) {
      return res.json({
        success: true,
        data: [],
        message: "الطبيب غير متاح في هذا اليوم",
      });
    }

    // Check exceptions
    const exception = await ScheduleException.findOne({
      doctorId,
      startDate: { $lte: targetDate },
      endDate: { $gte: targetDate },
    });
    if (exception) {
      return res.json({
        success: true,
        data: [],
        message: `يوم إجازة: ${exception.reason || exception.type}`,
      });
    }

    // Generate slots
    const [startH, startM] = avail.startTime.split(":").map(Number);
    const [endH, endM] = avail.endTime.split(":").map(Number);
    const slots = [];
    let cur = startH * 60 + startM;
    const end = endH * 60 + endM;

    while (cur + avail.slotDurationMinutes <= end) {
      const h = String(Math.floor(cur / 60)).padStart(2, "0");
      const m = String(cur % 60).padStart(2, "0");
      slots.push(`${h}:${m}`);
      cur += avail.slotDurationMinutes;
    }

    // Remove booked slots
    const booked = await Appointment.find({
      doctorId,
      appointmentDate: {
        $gte: new Date(targetDate.setHours(0, 0, 0, 0)),
        $lt: new Date(targetDate.setHours(23, 59, 59, 999)),
      },
      status: { $nin: ["Cancelled"] },
    }).select("appointmentTime");

    const bookedTimes = new Set(booked.map((a) => a.appointmentTime));
    const available = slots.filter((s) => !bookedTimes.has(s));

    res.json({
      success: true,
      data: available,
      slotDuration: avail.slotDurationMinutes,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
