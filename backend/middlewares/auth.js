const jwt = require('jsonwebtoken');
const User = require('../models/users'); // الربط بملف المستخدمين

// Middleware للتحقق من التوكن (Token) وحماية المسارات
const protect = async (req, res, next) => {
  let token;

  // التأكد من إرسال التوكن في الـ Headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // قراءة التوكن من الـ Header
      token = req.headers.authorization.split(' ')[1];

      // فك تشفير التوكن والتحقق من صحته
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // جلب بيانات المستخدم بدون كلمة المرور وإرفاقها بالطلب
      req.user = await User.findById(decoded.id).select('-password');

      next(); // السماح للمستخدم بالانتقال للخطوة التالية
    } catch (error) {
      return res.status(401).json({ message: 'غير مصرح، التوكن غير صالحة' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'غير مصرح، لا يوجد توكن' });
  }
};

module.exports = { protect };