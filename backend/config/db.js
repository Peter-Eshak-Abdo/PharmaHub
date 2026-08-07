const mongoose = require('mongoose');

// دالة غير متزامنة للاتصال بقاعدة البيانات
const connectDB = async () => {
  try {
    // الاتصال بالرابط الموجود في ملف البيئة .env
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // إغلاق التطبيق في حالة حدوث خطأ
  }
};

module.exports = connectDB;
