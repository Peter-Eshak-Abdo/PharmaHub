const User = require("../models/users");
const Patient = require("../models/Patients");
const Doctor = require("../models/Doctors");
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "secret", {
    expiresIn: "30d",
  });
};

// تسجيل حساب جديد (With Profile Coupling)
const registerUser = async (req, res) => {
  try {
    const { email, password, role, fullName, ...profileData } = req.body;
    
    // 1. Validation
    if (!fullName) {
        return res.status(400).json({ message: "Full Name is required for profiles" });
    }
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "المستخدم موجود بالفعل" });
    }

    // 2. Create User
    const user = await User.create({ email, password, role });

    // 3. Profile Coupling (BR-AUTH-003)
    try {
        if (role === 'patient') {
            await Patient.create({ userId: user._id, fullName, ...profileData });
        } else if (role === 'doctor') {
            await Doctor.create({ userId: user._id, fullName, ...profileData });
        }
        // If admin, no profile is created.
    } catch (profileError) {
        // If profile creation fails, we should ideally rollback user creation (simulate transaction)
        await User.findByIdAndDelete(user._id);
        return res.status(400).json({ message: "Failed to create profile, user creation rolled back: " + profileError.message });
    }

    res.status(201).json({
      _id: user._id,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
        token: generateToken(user._id),
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
