const jwt = require("jsonwebtoken");
const User = require("../models/Users"); // الربط بملف المستخدمين

// Middleware للتحقق من التوكن (Token) وحماية المسارات
const protect = async (req, res, next) => {
  let token;

  // التأكد من إرسال التوكن في الـ Headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // قراءة التوكن من الـ Header
      token = req.headers.authorization.split(" ")[1];

      // فك تشفير التوكن والتحقق من صحته
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

      // جلب بيانات المستخدم بدون كلمة المرور وإرفاقها بالطلب
      req.user = await User.findById(decoded.id).select("-password");

      next(); // السماح للمستخدم بالانتقال للخطوة التالية
    } catch (error) {
      return res.status(401).json({ message: "غير مصرح، التوكن غير صالحة" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "غير مصرح، لا يوجد توكن" });
  }
};

// Reusable Role Checker (BR-AUTH-005 - checkRole)
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
          success: false,
          message: `User role ${req.user ? req.user.role : 'unknown'} is not authorized to access this route`
      });
    }
    next();
  };
};

module.exports = { protect, checkRole };
