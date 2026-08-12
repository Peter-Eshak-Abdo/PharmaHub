const User = require("../models/users");
const Patient = require("../models/Patients");
const Doctor = require("../models/Doctors");
const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET || "secret",
    {
      expiresIn: "30d",
    },
  );
};

// تسجيل حساب جديد (With Profile Coupling)
const registerUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // 1. Check required account data
    if (!email || !password || !role) {
      return res.status(400).json({
        message: "Email, password and role are required",
      });
    }

    // 2. Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "المستخدم موجود بالفعل",
      });
    }

    // 3. Create User only
    const user = await User.create({
      email,
      password,
      role,
    });

    // 4. Return account + token
    res.status(201).json({
      _id: user._id,
      email: user.email,
      role: user.role,
      token: generateToken(user),
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// تسجيل الدخول
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        email: user.email,
        role: user.role,
        token: generateToken(user),
      });
    } else {
      res.status(401).json({ message: "البريد أو كلمة المرور غير صحيحة" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin Stats
const getAdminStats = async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        const patientCount = await Patient.countDocuments();
        const doctorCount = await Doctor.countDocuments();

        res.json({
            success: true,
            stats: {
                users: userCount,
                patients: patientCount,
                doctors: doctorCount
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, loginUser, getAdminStats };
