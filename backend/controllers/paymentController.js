const axios = require('axios');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY || '';
const PAYMOB_INTEGRATION_ID_CARD = process.env.PAYMOB_INTEGRATION_ID_CARD || '';
const PAYMOB_INTEGRATION_ID_WALLET = process.env.PAYMOB_INTEGRATION_ID_WALLET || '';
const PAYMOB_IFRAME_ID = process.env.PAYMOB_IFRAME_ID || '';
const PAYMOB_HMAC = process.env.PAYMOB_HMAC || '';

/**
 * Step 1: Get Paymob Auth Token
 */
async function getPaymobAuthToken() {
  const res = await axios.post('https://accept.paymob.com/api/auth/tokens', {
    api_key: PAYMOB_API_KEY,
  });
  return res.data.token;
}

/**
 * Step 2: Register Order with Paymob
 */
async function registerPaymobOrder(authToken, amountCents, appointmentId) {
  const res = await axios.post('https://accept.paymob.com/api/ecommerce/orders', {
    auth_token: authToken,
    delivery_needed: 'false',
    amount_cents: amountCents.toString(),
    currency: 'EGP',
    merchant_order_id: appointmentId.toString(),
    items: [],
  });
  return res.data.id; // order_id
}

/**
 * Step 3: Generate Payment Key Token
 */
async function generatePaymentKey(authToken, orderId, amountCents, billingData, integrationId) {
  const res = await axios.post('https://accept.paymob.com/api/acceptance/payment_keys', {
    auth_token: authToken,
    amount_cents: amountCents.toString(),
    expiration: 3600,
    order_id: orderId,
    billing_data: billingData,
    currency: 'EGP',
    integration_id: integrationId,
  });
  return res.data.token; // payment_key_token
}

/**
 * Initiate Paymob Checkout Session for Appointment
 * POST /api/payments/paymob/initiate
 */
exports.initiatePaymobPayment = async (req, res) => {
  try {
    const { appointmentId, paymentMethod } = req.body; // 'card' or 'wallet'

    const appointment = await Appointment.findById(appointmentId)
      .populate('patientId')
      .populate('doctorId');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'الموعد غير موجود' });
    }

    const doctor = appointment.doctorId;
    const patient = appointment.patientId;
    const amountEgp = appointment.consultationFeeSnapshot || doctor.consultationFee || 100;
    const amountCents = Math.round(amountEgp * 100);

    if (!PAYMOB_API_KEY) {
      // Mock / Sandbox response for testing when credentials aren't yet populated in .env
      return res.json({
        success: true,
        isMock: true,
        message: 'Paymob API key not configured yet in .env, returning sandbox checkout URL.',
        paymentUrl: `https://accept.paymob.com/api/acceptance/iframes/${PAYMOB_IFRAME_ID || '12345'}?payment_token=mock_token_pharmahub`,
        amount: amountEgp,
      });
    }

    const authToken = await getPaymobAuthToken();
    const orderId = await registerPaymobOrder(authToken, amountCents, appointment._id);

    const integrationId = paymentMethod === 'wallet'
      ? PAYMOB_INTEGRATION_ID_WALLET
      : PAYMOB_INTEGRATION_ID_CARD;

    const billingData = {
      apartment: 'NA',
      email: patient.email || 'patient@pharmahub.com',
      floor: 'NA',
      first_name: patient.fullName ? patient.fullName.split(' ')[0] : 'Patient',
      street: 'NA',
      building: 'NA',
      phone_number: patient.phoneNumber || '+201000000000',
      shipping_method: 'PKG',
      postal_code: 'NA',
      city: 'Cairo',
      country: 'EGY',
      last_name: patient.fullName ? patient.fullName.split(' ').slice(1).join(' ') || 'User' : 'User',
      state: 'Cairo',
    };

    const paymentKey = await generatePaymentKey(authToken, orderId, amountCents, billingData, integrationId);

    const paymentUrl = `https://accept.paymob.com/api/acceptance/iframes/${PAYMOB_IFRAME_ID}?payment_token=${paymentKey}`;

    res.json({
      success: true,
      paymentUrl,
      paymentKey,
      orderId,
      amount: amountEgp,
    });
  } catch (err) {
    console.error('Paymob initiate error:', err.response?.data || err.message);
    res.status(500).json({ success: false, message: 'فشل في إنشاء جلسة الدفع', error: err.response?.data || err.message });
  }
};

/**
 * Paymob Webhook (Processed Callback)
 * POST /api/payments/paymob/webhook
 */
exports.handlePaymobWebhook = async (req, res) => {
  try {
    const { obj } = req.body;
    if (!obj) {
      return res.status(400).send('Invalid webhook data');
    }

    const isSuccess = obj.success === true;
    const appointmentId = obj.order?.merchant_order_id;

    if (isSuccess && appointmentId) {
      const appt = await Appointment.findById(appointmentId);
      if (appt) {
        appt.paymentStatus = 'Paid';
        appt.paymentConfirmedAt = new Date();
        appt.status = 'Confirmed';
        await appt.save();
        console.log(`[Paymob Webhook] Appointment ${appointmentId} confirmed and paid.`);
      }
    }

    res.status(200).send('Webhook processed');
  } catch (err) {
    console.error('Paymob webhook error:', err.message);
    res.status(500).send('Error');
  }
};
