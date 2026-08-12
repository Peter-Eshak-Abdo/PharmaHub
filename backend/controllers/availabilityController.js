const WeeklyAvailability = require('../models/WeeklyAvailability');
const ScheduleException = require('../models/ScheduleException');
const Appointment = require('../models/Appointments');
const { generateTimeslots } = require('../utils/timeSlotGenerator');

// POST /api/availability
exports.addAvailability = async (req, res) => {
  try {
    const { doctorId, dayOfWeek, startTime, endTime, slotDurationMinutes } = req.body;

    if (!doctorId || !dayOfWeek || !startTime || !endTime || !slotDurationMinutes) {
      return res.status(400).json({
        success: false,
        message:
          'doctorId, dayOfWeek, startTime, endTime and slotDurationMinutes are required',
      });
    }

    const slot = await WeeklyAvailability.create({
      doctorId,
      dayOfWeek,
      startTime,
      endTime,
      slotDurationMinutes,
    });

    return res.status(201).json({ success: true, data: slot });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'This doctor already has a weekly availability entry for that day',
      });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/availability/:doctorId
exports.getAvailabilityByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const slots = await WeeklyAvailability.find({ doctorId }).sort({
      dayOfWeek: 1,
      startTime: 1,
    });

    return res.status(200).json({ success: true, count: slots.length, data: slots });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/availability/:id
exports.updateAvailability = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await WeeklyAvailability.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Slot not found' });
    }

    Object.assign(existing, req.body);
    const updated = await existing.save();

    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'This doctor already has a weekly availability entry for that day',
      });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/availability/:id
exports.deleteAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await WeeklyAvailability.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Slot not found' });
    }

    return res.status(200).json({ success: true, message: 'Slot deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/availability/:doctorId/slots?date=YYYY-MM-DD
// Returns calculated available time slots for a doctor on a specific date
exports.getAvailableSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query; // expected format: YYYY-MM-DD
    if (!date) {
      return res.status(400).json({ success: false, message: 'Date query parameter is required' });
    }
    const dayOfWeek = new Date(date).getUTCDay(); // 0 (Sun) - 6 (Sat)
    // Convert to ISO day (1=Mon, 7=Sun)
    const isoDay = dayOfWeek === 0 ? 7 : dayOfWeek;
    const weeklySlot = await WeeklyAvailability.findOne({ doctorId, dayOfWeek: isoDay });
    if (!weeklySlot) {
      return res.status(404).json({ success: false, message: 'No weekly availability for this day' });
    }
    // Check schedule exceptions (doctor on vacation etc.)
    const exception = await ScheduleException.findOne({
      doctorId,
      startDate: { $lte: new Date(date) },
      endDate: { $gte: new Date(date) },
    });
    if (exception) {
      return res.status(200).json({ success: true, slots: [] }); // doctor unavailable
    }
    const appointments = await Appointment.find({
      doctorId,
      appointmentDate: new Date(date),
      status: { $ne: 'Cancelled' },
    }).select('appointmentTime');
    const start = weeklySlot.startTime; // HH:MM
    const end = weeklySlot.endTime;
    const slotDuration = weeklySlot.slotDurationMinutes;
    const toMinutes = (t) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };
    const fromMinutes = (m) => {
      const h = Math.floor(m / 60).toString().padStart(2, '0');
      const min = (m % 60).toString().padStart(2, '0');
      return `${h}:${min}`;
    };
    const startMin = toMinutes(start);
    const endMin = toMinutes(end);
    const occupied = appointments.map(a => a.appointmentTime);
    const availableSlots = [];
    for (let cur = startMin; cur + slotDuration <= endMin; cur += slotDuration) {
      const slotTime = fromMinutes(cur);
      if (!occupied.includes(slotTime)) {
        availableSlots.push(slotTime);
      }
    }
    return res.status(200).json({ success: true, slots: availableSlots });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
