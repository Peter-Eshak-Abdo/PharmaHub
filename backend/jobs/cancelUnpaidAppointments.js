const Appointment = require('../models/Appointment');

// Function that cancels unpaid appointments that passed the payment deadline
async function checkAndCancelUnpaidAppointments() {
  try {
    const now = new Date();
    const overdueAppointments = await Appointment.find({
      status: 'Pending',
      paymentStatus: 'Unpaid',
      paymentDeadline: { $exists: true, $ne: null, $lt: now },
    });

    if (overdueAppointments.length === 0) return;

    const ids = overdueAppointments.map((a) => a._id);
    await Appointment.updateMany(
      { _id: { $in: ids } },
      {
        status: 'Cancelled',
        $set: { cancelReason: 'Auto-cancelled: Payment deadline exceeded (5 hours prior)' },
      }
    );

    console.log(`[Job] Auto-cancelled ${overdueAppointments.length} unpaid appointments.`);
  } catch (err) {
    console.error('[Job] Error cancelling unpaid appointments:', err.message);
  }
}

// Run periodically every 15 minutes
setInterval(checkAndCancelUnpaidAppointments, 15 * 60 * 1000);

module.exports = { checkAndCancelUnpaidAppointments };
