const WeeklyAvailability = require('../models/WeeklyAvailability');
const ScheduleException = require('../models/ScheduleException');
const Appointment = require('../models/Appointment');

// POST /api/availability
exports.addAvailability = async (req, res) => {
  try {
    const {
      doctorId,
      dayOfWeek,
      startTime,
      endTime,
      slotDurationMinutes,
    } = req.body;

    if (
      !doctorId ||
      !dayOfWeek ||
      !startTime ||
      !endTime ||
      !slotDurationMinutes
    ) {
      return res.status(400).json({
        success: false,
        message:
          'doctorId, dayOfWeek, startTime, endTime and slotDurationMinutes are required',
      });
    }

    if (startTime >= endTime) {
      return res.status(400).json({
        success: false,
        message: 'endTime must be greater than startTime',
      });
    }

    // Check for overlapping time windows on the same day for this doctor
    const overlapping = await WeeklyAvailability.findOne({
      doctorId,
      dayOfWeek,
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
      ],
    });

    if (overlapping) {
      return res.status(409).json({
        success: false,
        message: 'هذا الوقت يتعارض مع موعد عمل موجود في نفس اليوم',
      });
    }

    const slot = await WeeklyAvailability.create({
      doctorId,
      dayOfWeek,
      startTime,
      endTime,
      slotDurationMinutes,
    });

    return res.status(201).json({
      success: true,
      data: slot,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          'يوجد موعد يبدأ في نفس هذا الوقت بالفعل لهذا اليوم',
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Week starts on Sunday, matching the slot engine's day mapping.
const WEEK_ORDER = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

// GET /api/availability/:doctorId
exports.getAvailabilityByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;

    // dayOfWeek is stored as a string, so a plain Mongo sort would order
    // it alphabetically (Friday, Monday, Saturday, Sunday...) instead of
    // calendar order. Fetch then sort in JS against WEEK_ORDER instead.
    const slots = await WeeklyAvailability.find({ doctorId });

    slots.sort((a, b) => {
      const dayDiff =
        WEEK_ORDER.indexOf(a.dayOfWeek) - WEEK_ORDER.indexOf(b.dayOfWeek);
      if (dayDiff !== 0) return dayDiff;
      return a.startTime.localeCompare(b.startTime);
    });

    return res.status(200).json({
      success: true,
      count: slots.length,
      data: slots,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// PUT /api/availability/:id
exports.updateAvailability = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await WeeklyAvailability.findById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Slot not found',
      });
    }

    const doctorId = req.body.doctorId || existing.doctorId;
    const dayOfWeek = req.body.dayOfWeek || existing.dayOfWeek;
    const startTime = req.body.startTime || existing.startTime;
    const endTime = req.body.endTime || existing.endTime;

    if (startTime >= endTime) {
      return res.status(400).json({
        success: false,
        message: 'endTime must be greater than startTime',
      });
    }

    // Check overlap with other slots excluding current slot
    const overlapping = await WeeklyAvailability.findOne({
      _id: { $ne: id },
      doctorId,
      dayOfWeek,
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
      ],
    });

    if (overlapping) {
      return res.status(409).json({
        success: false,
        message: 'هذا الوقت يتعارض مع موعد عمل موجود في نفس اليوم',
      });
    }

    Object.assign(existing, req.body);

    const updated = await existing.save();

    return res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          'يوجد موعد يبدأ في نفس هذا الوقت بالفعل لهذا اليوم',
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE /api/availability/:id
exports.deleteAvailability = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await WeeklyAvailability.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Slot not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Slot deleted',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/availability/:doctorId/slots?date=YYYY-MM-DD
// Returns calculated available time slots for a doctor on a specific date
exports.getAvailableSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date query parameter is required',
      });
    }

    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format',
      });
    }

    // WEEK_ORDER[0] is Sunday, matching JS Date#getUTCDay() directly.
    const dayName = WEEK_ORDER[parsedDate.getUTCDay()];

    const weeklySlots = await WeeklyAvailability.find({
      doctorId,
      dayOfWeek: dayName,
    }).sort({ startTime: 1 });

    if (!weeklySlots || weeklySlots.length === 0) {
      return res.status(200).json({
        success: true,
        slots: [],
        message: 'No weekly availability for this day',
      });
    }

    // Check schedule exceptions
    const exception = await ScheduleException.findOne({
      doctorId,
      startDate: { $lte: new Date(date) },
      endDate: { $gte: new Date(date) },
    });

    if (exception) {
      return res.status(200).json({
        success: true,
        slots: [],
      });
    }

    const appointments = await Appointment.find({
      doctorId,
      appointmentDate: new Date(date),
      status: { $ne: 'Cancelled' },
    }).select('appointmentTime');

    const toMinutes = (time) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const fromMinutes = (minutes) => {
      const hours = Math.floor(minutes / 60)
        .toString()
        .padStart(2, '0');

      const mins = (minutes % 60)
        .toString()
        .padStart(2, '0');

      return `${hours}:${mins}`;
    };

    const occupied = appointments.map(
      (appointment) => appointment.appointmentTime
    );

    const availableSlots = [];

    for (const weeklySlot of weeklySlots) {
      const startMin = toMinutes(weeklySlot.startTime);
      const endMin = toMinutes(weeklySlot.endTime);
      const slotDuration = weeklySlot.slotDurationMinutes || 30;

      for (
        let current = startMin;
        current + slotDuration <= endMin;
        current += slotDuration
      ) {
        const slotTime = fromMinutes(current);

        if (!occupied.includes(slotTime) && !availableSlots.includes(slotTime)) {
          availableSlots.push(slotTime);
        }
      }
    }

    return res.status(200).json({
      success: true,
      slots: availableSlots,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
