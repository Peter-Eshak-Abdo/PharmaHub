const axios = require('axios');

const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID || '';
const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY || '';

/**
 * Send Push Notification to a specific User via their MongoDB userId (external_id)
 * @param {string|Array<string>} userIds Single userId or array of userIds
 * @param {Object} options Notification details { title, message, url, data }
 */
async function sendPushNotification(userIds, { title, message, url, data } = {}) {
  try {
    if (!ONESIGNAL_APP_ID || !ONESIGNAL_REST_API_KEY) {
      console.warn('[OneSignal] Warning: ONESIGNAL_APP_ID or ONESIGNAL_REST_API_KEY not configured in .env. Notification logged only:', {
        userIds,
        title,
        message,
      });
      return { success: false, message: 'OneSignal credentials not set' };
    }

    const targetUserIds = Array.isArray(userIds) ? userIds.map(String) : [String(userIds)];

    const payload = {
      app_id: ONESIGNAL_APP_ID,
      include_aliases: {
        external_id: targetUserIds,
      },
      target_channel: 'push',
      headings: {
        en: title || 'PharmaHub Update',
        ar: title || 'تحديث من PharmaHub',
      },
      contents: {
        en: message || 'You have a new update regarding your appointment.',
        ar: message || 'لديك تحديث جديد بخصوص موعدك الطبي.',
      },
      url: url || undefined,
      data: data || {},
    };

    const response = await axios.post('https://onesignal.com/api/v1/notifications', payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${ONESIGNAL_REST_API_KEY}`,
      },
    });

    console.log('[OneSignal] Push sent successfully:', response.data);
    return { success: true, data: response.data };
  } catch (err) {
    console.error('[OneSignal] Error sending push notification:', err.response?.data || err.message);
    return { success: false, error: err.response?.data || err.message };
  }
}

module.exports = {
  sendPushNotification,
};
