const ScheduleException = require('../models/ScheduleException');

// POST /api/exceptions
// Creates a leave/exception period for a doctor (vacation, blocked day, emergency).
exports.addException = async (req, res) => {
  try {
    const { doctorId, startDate, endDate, type, reason } = req.body;

    if (!doctorId || !startDate || !endDate || !type) {
      return res.status(400).json({
        success: false,
        message: 'doctorId, startDate, endDate and type are required',
      });
    }

    const exception = await ScheduleException.create({
      doctorId,
      startDate,
      endDate,
      type,
      reason: reason || '',
    });

    return res.status(201).json({ success: true, data: exception });
  } catch (error) {
    // Triggered if endDate < startDate (schema validator)
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/exceptions/:doctorId
// Returns every exception period ever recorded for this doctor,
// ordered chronologically.
exports.getExceptionsByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const exceptions = await ScheduleException.find({ doctorId }).sort({
      startDate: 1,
    });

    return res.status(200).json({
      success: true,
      count: exceptions.length,
      data: exceptions,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/exceptions/:doctorId/check?date=YYYY-MM-DD
// Core integration point for the Appointments module (BR-APP-004):
// before letting a patient book, this endpoint is called to check
// whether the requested date falls inside ANY exception range for
// that doctor. If isBlocked is true, the booking must be rejected.
exports.checkExceptionForDate = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res
        .status(400)
        .json({ success: false, message: 'date query param is required' });
    }

    const targetDate = new Date(date);

    // Look for any exception whose [startDate, endDate] range contains targetDate
    const exception = await ScheduleException.findOne({
      doctorId,
      startDate: { $lte: targetDate },
      endDate: { $gte: targetDate },
    });

    return res.status(200).json({
      success: true,
      isBlocked: !!exception, // true/false — easy for the frontend/Appointments module to use
      data: exception || null,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/exceptions/:id
// Removes a leave/exception entry (e.g. doctor cancels a planned vacation).
exports.deleteException = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await ScheduleException.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Exception not found' });
    }

    return res.status(200).json({ success: true, message: 'Exception deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};