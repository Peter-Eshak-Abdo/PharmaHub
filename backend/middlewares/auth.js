const jwt = require("jsonwebtoken");
const User = require("../models/User"); // الربط بملف المستخدمين

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

// Optional Auth Middleware (allows both guests and logged-in users)
const optionalAuth = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      req.user = await User.findById(decoded.id).select("-password");
    } catch (error) {
      req.user = null;
    }
  }
  next();
};

// Reusable Role Checker (BR-AUTH-005 - checkRole / authorize)
const checkRole = (...roles) => {
  const flatRoles = roles.flat();
  return (req, res, next) => {
    if (!req.user || !flatRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user ? req.user.role : 'unknown'} is not authorized to access this route`,
      });
    }
    next();
  };
};

const authorize = checkRole;

module.exports = { protect, optionalAuth, checkRole, authorize };
