const user = require("../models/User");
const Patient = require("../models/Patient");

const assertPatientRole = (req, res) => {
  if (!req.user || req.user.role !== "patient") {
    res.status(403).json({ message: "غير مصرح، هذا المسار مخصص للمريض فقط" });
    return false;
  }

  return true;
};

// جلب بيانات المريض
const getPatientProfile = async (req, res) => {
  try {
    if (!assertPatientRole(req, res)) return;

    console.log("User Data from Request:", req.user);
    // const userId = new mongoose.Types.ObjectId(req.user._id);
    // const patient = await Patient.findOne({ userId: userId });

    const patient = await Patient.findOne({ userId: req.user._id }).populate(
      "userId",
      "email role",
    );

    if (!patient) {
      return res.status(404).json({ message: "ملف المريض غير موجود" });
    }

    res.json({ success: true, data: patient });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// إنشاء بيانات المريض لأول مرة
const createPatientProfile = async (req, res) => {
  try {
    if (!assertPatientRole(req, res)) return;

    const existingPatient = await Patient.findOne({ userId: req.user._id });
    if (existingPatient) {
      return res.status(400).json({ message: "ملف المريض موجود بالفعل" });
    }

    const {
      fullName,
      phoneNumber,
      age,
      gender,
      address,
      occupation,
      companyName,
    } = req.body;

    if (!fullName || !phoneNumber || age === undefined || !gender) {
      return res.status(400).json({
        message: "fullName, phoneNumber, age and gender are required",
      });
    }

    const patient = await Patient.create({
      userId: req.user._id,
      fullName,
      phoneNumber,
      age,
      gender,
      address,
      occupation,
      companyName,
    });

    const populatedPatient = await Patient.findById(patient._id).populate(
      "userId",
      "email role",
    );

    res.status(201).json({ success: true, data: populatedPatient });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: "هذا المستخدم لديه ملف مريض بالفعل" });
    }
    res.status(500).json({ message: error.message });
  }
};

// تحديث بيانات المريض
const updatePatientProfile = async (req, res) => {
  try {
    if (!assertPatientRole(req, res)) return;

    const updates = req.body;
    delete updates.userId;

    const updatedPatient = await Patient.findOneAndUpdate(
      { userId: req.user._id },
      updates,
      {
        returnDocument: "after",
        runValidators: true,
      },
    ).populate("userId", "email role");

    if (!updatedPatient) {
      return res.status(404).json({ message: "ملف المريض غير موجود" });
    }

    res.status(200).json({
      message: "تم تحديث بيانات المريض بنجاح",
      user: updatedPatient,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPatientProfile,
  createPatientProfile,
  updatePatientProfile,
};
