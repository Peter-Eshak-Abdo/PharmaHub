const mongoose = require("mongoose");
const dns = require("dns");

// حل مشكلة فشل استعلام DNS نوع SRV (querySrv ECONNREFUSED)
// خادم DNS المحلي يرفض استعلامات SRV التي يحتاجها MongoDB Atlas
// بحيث يتم استخدام DNS عام (8.8.8.8 / 1.1.1.1) كبديل موثوق
dns.setServers(["8.8.8.8", "1.1.1.1"]);

// دالة غير متزامنة للاتصال بقاعدة البيانات
const connectDB = async () => {
  try {
    // يدعم كلا الاسمين: MONGO_URI أو MONGODB_URI
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("MONGO_URI is not defined in .env file");
    }
    const conn = await mongoose.connect(uri, {
      // زيادة مهلة اختيار الخادم لتجنب الانقطاعات المؤقتة
      serverSelectionTimeoutMS: 30000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // إغلاق التطبيق في حالة حدوث خطأ
  }
};

module.exports = connectDB;
