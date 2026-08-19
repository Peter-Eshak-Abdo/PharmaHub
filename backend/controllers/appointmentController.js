const mongoose = require("mongoose");
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const WeeklyAvailability = require("../models/WeeklyAvailability");
const ScheduleException = require("../models/ScheduleException");
const { sendPushNotification } = require("../utils/notificationService");

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
  const avails = await WeeklyAvailability.find({ doctorId, dayOfWeek });
  if (!avails || avails.length === 0) {
    throw new Error(`الطبيب غير متاح يوم ${dayOfWeek}`);
  }

  const [reqH, reqM] = appointmentTime.split(":").map(Number);
  const reqMins = reqH * 60 + reqM;

  // Find matching slot window
  const matchingSlot = avails.find((slot) => {
    const [startH, startM] = slot.startTime.split(":").map(Number);
    const [endH, endM] = slot.endTime.split(":").map(Number);
    const startMins = startH * 60 + startM;
    const endMins = endH * 60 + endM;

    if (reqMins >= startMins && reqMins < endMins) {
      return (reqMins - startMins) % slot.slotDurationMinutes === 0;
    }
    return false;
  });

  if (!matchingSlot) {
    throw new Error(
      `الوقت المختار غير متاح ضمن فترات عمل الطبيب في هذا اليوم`,
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
    const consultationFeeSnapshot = doctor.consultationFee || doctor.consultationFeeSnapshot || 0;

    // Calculate Payment Deadline = 5 hours before appointment
    let apptDateTime;
    if (typeof appointmentDate === 'string' && appointmentDate.includes('T')) {
      apptDateTime = new Date(appointmentDate);
    } else {
      apptDateTime = new Date(`${appointmentDate}T${appointmentTime || '00:00'}:00`);
    }
    const paymentDeadline = isNaN(apptDateTime.getTime())
      ? null
      : new Date(apptDateTime.getTime() - (5 * 60 * 60 * 1000));

    const appointment = await Appointment.create({
      patientId: patient._id,
      doctorId,
      appointmentDate,
      appointmentTime,
      consultationType,
      reasonForVisit,
      estimatedDurationMinutes: doctor.slotDurationMinutes || 30,
      consultationFeeSnapshot,
      status: "Pending",
      paymentStatus: "Unpaid",
      paymentDeadline,
    });

    res.status(201).json({
      success: true,
      message: "تم حجز الموعد بنجاح",
      data: appointment,
      appointment,
      paymentInfo: {
        amount: consultationFeeSnapshot,
        deadline: paymentDeadline,
        instapay: doctor.paymentMethods?.instapay || '',
        vodafoneCash: doctor.paymentMethods?.vodafoneCash || '',
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// =============================================
// GET /api/appointments/doctors/:doctorId/available-days
// =============================================
exports.getAvailableDays = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { month, year } = req.query;

    const m = month ? parseInt(month) : new Date().getMonth() + 1;
    const y = year ? parseInt(year) : new Date().getFullYear();

    const weeklySchedule = await WeeklyAvailability.find({ doctorId });
    const availableDayNames = weeklySchedule.map((s) => s.dayOfWeek);

    const startOfMonth = new Date(y, m - 1, 1);
    const endOfMonth = new Date(y, m, 0, 23, 59, 59);

    const exceptions = await ScheduleException.find({
      doctorId,
      startDate: { $lte: endOfMonth },
      endDate: { $gte: startOfMonth },
    });

    const daysInMonth = new Date(y, m, 0).getDate();
    const result = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(y, m - 1, day);
      const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      const dateStr = `${yyyy}-${mm}-${dd}`;

      const isWorkingDay = availableDayNames.includes(dayName);

      const exception = exceptions.find((ex) => {
        const start = new Date(ex.startDate);
        const end = new Date(ex.endDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        return date >= start && date <= end;
      });

      result.push({
        date: dateStr,
        dayName,
        available: isWorkingDay && !exception,
        exception: exception
          ? {
              type: exception.type,
              reason: exception.reason,
            }
          : null,
        isPast: date < today,
      });
    }

    res.json({
      success: true,
      days: result,
      availableDayNames,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// =============================================
// PATCH /api/appointments/:id/confirm-payment
// =============================================
exports.confirmPayment = async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) {
      return res.status(404).json({ success: false, message: "الموعد غير موجود" });
    }

    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (
      (!doctor || appt.doctorId.toString() !== doctor._id.toString()) &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ success: false, message: "غير مصرح لك بتأكيد الدفع لهذا الموعد" });
    }

    appt.paymentStatus = "Paid";
    appt.paymentConfirmedAt = new Date();
    appt.paymentConfirmedBy = req.user.id;
    appt.status = "Confirmed";

    await appt.save();

    // Trigger OneSignal push to patient
    const patientDoc = await Patient.findById(appt.patientId);
    if (patientDoc?.userId) {
      sendPushNotification(patientDoc.userId, {
        title: "تم تأكيد الدفع وموعدك الطبي! 🎉",
        message: `تم تأكيد دفع واستلام موعدك بتاريخ ${appt.appointmentDate.toISOString().split('T')[0]} في تمام ${appt.appointmentTime}.`,
        url: "/dashboard/patient",
        data: { appointmentId: appt._id },
      }).catch(e => console.error(e));
    }

    res.json({
      success: true,
      data: appt,
      appointment: appt,
      message: "تم تأكيد الدفع والموعد بنجاح",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// =============================================
// GET /api/appointments/patient — Patient's appointments
// =============================================
exports.getPatientAppointments = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.id || req.user._id });
    if (!patient) {
      return res.json({
        success: true,
        data: [],
        pagination: { total: 0, page: 1, pages: 1 },
      });
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
        pages: Math.ceil(total / Number(limit)) || 1,
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
    const doctor = await Doctor.findOne({ userId: req.user.id || req.user._id });
    if (!doctor) {
      return res.json({
        success: true,
        data: [],
        pagination: { total: 0, page: 1, pages: 1 },
      });
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

    // Send push notification to patient on confirmation or cancellation
    const patientDoc = await Patient.findById(appointment.patientId);
    if (patientDoc?.userId) {
      let title = `تحديث بخصوص موعدك الطبي`;
      let msg = `تم تغيير حالة موعدك إلى: ${status}`;
      if (status === 'Confirmed') {
        title = 'وافق الطبيب على موعدك! ✅';
        msg = `تمت الموافقة وتأكيد موعدك الطبي بنجاح.`;
      } else if (status === 'Cancelled') {
        title = 'تم إلغاء الموعد ⚠️';
        msg = `تم إلغاء موعدك الطبي المحدد.`;
      } else if (status === 'Completed') {
        title = 'اكتملت الزيارة الطبية 🩺';
        msg = `نتمنى لك دوام الصحة والعافية، يمكنك الآن الاطلاع على الروشتة والسجل الطبي.`;
      }

      sendPushNotification(patientDoc.userId, {
        title,
        message: msg,
        url: '/dashboard/patient',
        data: { appointmentId: appointment._id, status },
      }).catch(e => console.error(e));
    }

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
      return res.json({
        success: true,
        data: [],
        slotDuration: 30,
        message: "doctorId و date مطلوبان",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.json({
        success: true,
        data: [],
        slotDuration: 30,
        message: "معرف الطبيب غير صالح",
      });
    }

    // Parse date safely
    let targetDate;
    if (typeof date === "string" && date.includes("-")) {
      const [y, m, d] = date.split("-").map(Number);
      targetDate = new Date(y, m - 1, d);
    } else {
      targetDate = new Date(date);
    }

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

    const weeklySlots = await WeeklyAvailability.find({
      doctorId,
      dayOfWeek,
    }).sort({ startTime: 1 });

    if (!weeklySlots || weeklySlots.length === 0) {
      return res.json({
        success: true,
        data: [],
        slotDuration: 30,
        message: "الطبيب غير متاح في هذا اليوم",
      });
    }

    // Check exceptions
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const exception = await ScheduleException.findOne({
      doctorId,
      startDate: { $lte: endOfDay },
      endDate: { $gte: startOfDay },
    });
    if (exception) {
      return res.json({
        success: true,
        data: [],
        slotDuration: weeklySlots[0].slotDurationMinutes || 30,
        message: `يوم إجازة: ${exception.reason || exception.type}`,
      });
    }

    // Generate slots across all availability windows
    const slotDuration = weeklySlots[0]?.slotDurationMinutes || 30;
    const slots = [];
    for (const avail of weeklySlots) {
      const [startH, startM] = avail.startTime.split(":").map(Number);
      const [endH, endM] = avail.endTime.split(":").map(Number);
      const duration = avail.slotDurationMinutes || slotDuration;
      let cur = startH * 60 + startM;
      const end = endH * 60 + endM;

      while (cur + duration <= end) {
        const h = String(Math.floor(cur / 60)).padStart(2, "0");
        const m = String(cur % 60).padStart(2, "0");
        const slotStr = `${h}:${m}`;
        if (!slots.includes(slotStr)) {
          slots.push(slotStr);
        }
        cur += duration;
      }
    }

    // Remove booked slots
    const booked = await Appointment.find({
      doctorId,
      appointmentDate: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      status: { $nin: ["Cancelled"] },
    }).select("appointmentTime");

    const bookedTimes = new Set(booked.map((a) => a.appointmentTime));
    const available = slots.filter((s) => !bookedTimes.has(s));

    res.json({
      success: true,
      data: available,
      slotDuration,
    });
  } catch (err) {
    res.json({
      success: true,
      data: [],
      slotDuration: 30,
      message: err.message,
    });
  }
};
