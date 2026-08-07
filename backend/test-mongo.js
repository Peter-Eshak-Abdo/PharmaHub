/**
 * سكربت اختبار الاتصال بـ MongoDB
 * ==================================
 * التشغيل:
 *   node test-mongo.js
 *
 * سيقوم بقراءة الاتصال من متغير MONGO_URI أو MONGODB_URI في ملف .env
 * ويتحقق من الاتصال ثم يقرأ/يكتب مستند اختبار للتأكد أن كل شيء يعمل.
 */

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const dns = require("dns");

// حل مشكلة DNS (نفس حل config/db.js)
dns.setServers(["8.8.8.8", "1.1.1.1"]);

// تحميل .env
dotenv.config();

// دعم كلا الاسمين (MONGO_URI أو MONGODB_URI)
const URI = process.env.MONGO_URI || process.env.MONGODB_URI;

async function test() {
  if (!URI) {
    console.error("❌ لم يتم العثور على MONGO_URI أو MONGODB_URI في ملف .env");
    process.exit(1);
  }

  console.log("🔗 محاولة الاتصال بـ MongoDB...");
  console.log(`   URI: ${URI.replace(/\/\/.*@/, "//***:***@")}`); // إخفاء كلمة المرور

  try {
    const conn = await mongoose.connect(URI, {
      serverSelectionTimeoutMS: 30000,
      dbName: process.env.DB_NAME || "pharmahub",
    });

    console.log("✅ الاتصال بـ MongoDB ناجح!");
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   Name: ${conn.connection.name}`);

    // اختبار الكتابة/القراءة
    const Model = mongoose.model(
      "Test_" + Date.now(),
      new mongoose.Schema({
        ping: String,
        createdAt: { type: Date, default: Date.now },
      }),
    );
    await Model.create({ ping: "pong" });
    const count = await Model.countDocuments();
    console.log(`✅ نجحت عملية الكتابة/القراءة (المستندات: ${count})`);

    // رابط قاعدة البيانات
    const collections = await conn.connection.db.listCollections().toArray();
    console.log(
      `📁 المجموعات الموجودة: ${collections.length ? collections.map((c) => c.name).join(", ") : "لا توجد مجموعات"}`,
    );

    // تنظيف مستند الاختبار
    await Model.collection.drop().catch(() => {});
    console.log("🧹 تم تنظيف مستند الاختبار");

    await mongoose.disconnect();
    console.log("🔌 تم قطع الاتصال بنجاح");
    process.exit(0);
  } catch (error) {
    console.error("❌ فشل الاتصال بـ MongoDB:");
    console.error(`   ${error.message}`);
    process.exit(1);
  }
}

test();
