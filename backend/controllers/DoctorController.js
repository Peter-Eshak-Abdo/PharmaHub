const Doctor = require("../models/Doctors");

const assertDoctorRole = (req, res) => {
  if (!req.user || req.user.role !== "doctor") {
    res.status(403).json({ message: "غير مصرح، هذا المسار مخصص للدكتور فقط" });
    return false;
  }

  return true;
};

// جلب بيانات الدكتور
const getDoctorProfile = async (req, res) => {
  try {
    if (!assertDoctorRole(req, res)) return;

    const doctor = await Doctor.findOne({ userId: req.user._id }).populate(
      "userId",
      "email role",
    );

    if (!doctor) {
      return res.status(404).json({ message: "ملف الدكتور غير موجود" });
    }

    res.json({ success: true, data: doctor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// إنشاء بيانات الدكتور لأول مرة
const createDoctorProfile = async (req, res) => {
  try {
    if (!assertDoctorRole(req, res)) return;

    const existingDoctor = await Doctor.findOne({ userId: req.user._id });
    if (existingDoctor) {
      return res.status(400).json({ message: "ملف الدكتور موجود بالفعل" });
    }

    const {
      fullName,
      specialization,
      education,
      qualifications,
      yearsOfExperience,
      bio,
      rating,
    } = req.body;

    if (!fullName || !specialization) {
      return res.status(400).json({
        message: "fullName and specialization are required",
      });
    }

    const doctor = await Doctor.create({
      userId: req.user._id,
      fullName,
      specialization,
      education,
      qualifications,
      yearsOfExperience,
      bio,
      rating,
    });

    const populatedDoctor = await Doctor.findById(doctor._id).populate(
      "userId",
      "email role",
    );

    res.status(201).json({ success: true, data: populatedDoctor });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: "هذا المستخدم لديه ملف دكتور بالفعل" });
    }
    res.status(500).json({ message: error.message });
  }
};

// تحديث بيانات الدكتور
const updateDoctorProfile = async (req, res) => {
  try {
    if (!assertDoctorRole(req, res)) return;

    const updates = req.body;
    delete updates.userId;

    const updatedDoctor = await Doctor.findOneAndUpdate(
      { userId: req.user._id },
      updates,
      {
        new: true,
        runValidators: true,
      },
    ).populate("userId", "email role");

    if (!updatedDoctor) {
      return res.status(404).json({ message: "ملف الدكتور غير موجود" });
    }

    res.status(200).json({
      message: "تم تحديث بيانات الدكتور بنجاح",
      user: updatedDoctor,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDoctorProfile, createDoctorProfile, updateDoctorProfile };
