const User = require('../models/users');

// جلب بيانات المريض
const getPatientProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// تحديث بيانات المريض
const updatePatientProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const updates = req.body;

    if (updates.password) {
      delete updates.password;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    res.status(200).json({
      message: 'تم تحديث البيانات بنجاح',
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getPatientProfile, updatePatientProfile };