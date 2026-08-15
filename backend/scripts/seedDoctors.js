const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

const User = require("../models/User");
const Doctor = require("../models/Doctor");
const WeeklyAvailability = require("../models/WeeklyAvailability");

const sampleDoctors = [
  {
    email: "doctor.ahmed@pharmahub.com",
    password: "Password123!",
    fullName: "د. أحمد المنصوري",
    specialization: "طب القلب والأوعية الدموية",
    education: "دكتوراه في أمراض القلب - جامعة القاهرة",
    qualifications: "زمالة الكلية الملكية للأطباء (FRCP)",
    yearsOfExperience: 14,
    bio: "استشاري أمراض القلب والقسطرة التداخلية بخبرة تتجاوز 14 عاماً في علاج حالات القلب المعقدة وارتفاع ضغط الدم.",
    rating: 4.9,
    consultationFeeSnapshot: 250,
    availability: [
      { dayOfWeek: "Sunday", startTime: "09:00", endTime: "15:00", slotDurationMinutes: 30 },
      { dayOfWeek: "Monday", startTime: "09:00", endTime: "15:00", slotDurationMinutes: 30 },
      { dayOfWeek: "Wednesday", startTime: "10:00", endTime: "16:00", slotDurationMinutes: 30 },
      { dayOfWeek: "Thursday", startTime: "09:00", endTime: "14:00", slotDurationMinutes: 30 },
    ],
  },
  {
    email: "doctor.sara@pharmahub.com",
    password: "Password123!",
    fullName: "د. سارة عبد الرحمن",
    specialization: "طب الأطفال وحديثي الولادة",
    education: "ماجستير طب الأطفال - جامعة عين شمس",
    qualifications: "البورد العربي في طب الأطفال",
    yearsOfExperience: 9,
    bio: "أخصائية طب الأطفال ومتابعة نمو الرضع وحديثي الولادة والتغذية العلاجية السليمة.",
    rating: 4.8,
    consultationFeeSnapshot: 180,
    availability: [
      { dayOfWeek: "Sunday", startTime: "10:00", endTime: "16:00", slotDurationMinutes: 30 },
      { dayOfWeek: "Tuesday", startTime: "10:00", endTime: "16:00", slotDurationMinutes: 30 },
      { dayOfWeek: "Thursday", startTime: "12:00", endTime: "18:00", slotDurationMinutes: 30 },
    ],
  },
  {
    email: "doctor.khaled@pharmahub.com",
    password: "Password123!",
    fullName: "د. خالد السعيد",
    specialization: "الجلدية والتجميل والليزر",
    education: "دكتوراه الجلدية والتناسلية - جامعة الإسكندرية",
    qualifications: "عضو الأكاديمية الأمريكية للأمراض الجلدية (AAD)",
    yearsOfExperience: 11,
    bio: "استشاري الأمراض الجلدية والعلاج بالليزر وعلاج مشاكل البشرة والشعر.",
    rating: 4.7,
    consultationFeeSnapshot: 200,
    availability: [
      { dayOfWeek: "Monday", startTime: "14:00", endTime: "20:00", slotDurationMinutes: 30 },
      { dayOfWeek: "Wednesday", startTime: "14:00", endTime: "20:00", slotDurationMinutes: 30 },
      { dayOfWeek: "Saturday", startTime: "11:00", endTime: "17:00", slotDurationMinutes: 30 },
    ],
  },
];

async function seed() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.DB_URI || "mongodb://localhost:27017/pharmahub";
    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("Connected successfully.");

    for (const docData of sampleDoctors) {
      // 1. Create or find User
      let user = await User.findOne({ email: docData.email });
      if (!user) {
        user = await User.create({
          email: docData.email,
          password: docData.password,
          role: "doctor",
        });
        console.log(`Created user account: ${docData.email}`);
      } else {
        console.log(`User already exists: ${docData.email}`);
      }

      // 2. Create or update Doctor profile
      let doctor = await Doctor.findOne({ userId: user._id });
      if (!doctor) {
        doctor = await Doctor.create({
          userId: user._id,
          fullName: docData.fullName,
          specialization: docData.specialization,
          education: docData.education,
          qualifications: docData.qualifications,
          yearsOfExperience: docData.yearsOfExperience,
          bio: docData.bio,
          rating: docData.rating,
          consultationFeeSnapshot: docData.consultationFeeSnapshot,
        });
        console.log(`Created doctor profile: ${docData.fullName}`);
      } else {
        console.log(`Doctor profile already exists: ${docData.fullName}`);
      }

      // 3. Create weekly availability
      for (const slot of docData.availability) {
        await WeeklyAvailability.findOneAndUpdate(
          { doctorId: doctor._id, dayOfWeek: slot.dayOfWeek },
          {
            doctorId: doctor._id,
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
            slotDurationMinutes: slot.slotDurationMinutes,
          },
          { upsert: true, new: true }
        );
      }
      console.log(`Saved schedule for: ${docData.fullName}`);
    }

    console.log("\n✅ All sample doctors seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding doctors:", error);
    process.exit(1);
  }
}

seed();
