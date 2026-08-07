/**
 * سكربت اختبار جميع الـ API Endpoints
 * =====================================
 * يتطلب تشغيل الخادم أولاً ثم تشغيل هذا السكربت من مجلد backend:
 *
 *   node test-api.js
 *
 * أو يمكن تشغيل هذا السكربت وهو يبدأ الخادم تلقائياً:
 *   node test-api.js --start-server
 */

// يمكن تغيير المنفذ هنا أو عبر متغير بيئة API_PORT
const API_PORT = process.env.API_PORT || 8080;
const BASE_URL = `http://localhost:${API_PORT}`;

// تسلسل فريد لتجنب التكرار عند التشغيل المتكرر
const TS = Date.now().toString().slice(-6);

// بيانات الاختبار
const testData = {
  patientEmail: `patient_${TS}@test.com`,
  doctorEmail: `doctor_${TS}@test.com`,
  password: "123456",
};

// متغيرات لتخزين النتائج
const store = {
  patientToken: null,
  patientId: null,
  doctorToken: null,
  doctorId: null,
  appointmentId: null,
  medicationId: null,
  diagnosisId: null,
  availabilityId: null,
  exceptionId: null,
  reviewId: null,
};

let passed = 0;
let failed = 0;

function logPass(name, data) {
  passed++;
  console.log(`  ✅ ${name}`);
}

function logFail(name, error, status) {
  failed++;
  console.error(`  ❌ ${name} (status: ${status})`);
  console.error(`     ${JSON.stringify(error)}`);
}

async function request(method, path, body, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    data = { raw: await res.text() };
  }

  return { status: res.status, data };
}

async function testAuth() {
  console.log("\n🔐 === اختبار المصادقة (Auth) ===");

  // 1. تسجيل مريض
  let { status, data } = await request("POST", "/api/auth/register", {
    email: testData.patientEmail,
    password: testData.password,
    role: "patient",
  });
  if (status === 201 && data.token) {
    store.patientToken = data.token;
    logPass("تسجيل مريض جديد", data);
  } else {
    logFail("تسجيل مريض جديد", data, status);
  }

  // 2. تسجيل دكتور
  ({ status, data } = await request("POST", "/api/auth/register", {
    email: testData.doctorEmail,
    password: testData.password,
    role: "doctor",
  }));
  if (status === 201 && data.token) {
    store.doctorToken = data.token;
    logPass("تسجيل دكتور جديد", data);
  } else {
    logFail("تسجيل دكتور جديد", data, status);
  }

  // 3. تسجيل الدخول مريض
  ({ status, data } = await request("POST", "/api/auth/login", {
    email: testData.patientEmail,
    password: testData.password,
  }));
  if (status === 200 && data.token) {
    store.patientToken = data.token;
    logPass("تسجيل دخول المريض", data);
  } else {
    logFail("تسجيل دخول المريض", data, status);
  }

  // 4. تسجيل الدخول دكتور
  ({ status, data } = await request("POST", "/api/auth/login", {
    email: testData.doctorEmail,
    password: testData.password,
  }));
  if (status === 200 && data.token) {
    store.doctorToken = data.token;
    logPass("تسجيل دخول الدكتور", data);
  } else {
    logFail("تسجيل دخول الدكتور", data, status);
  }
}

async function testProfiles() {
  console.log("\n👤 === اختبار ملفات المريض والطبيب ===");

  // 5. إنشاء ملف مريض
  let { status, data } = await request(
    "POST",
    "/api/patient/profile",
    {
      fullName: "أحمد محمد",
      phoneNumber: "01012345678",
      age: 30,
      gender: "male",
      address: "القاهرة",
      occupation: "مهندس",
    },
    store.patientToken,
  );
  if (status === 201 && data.data) {
    store.patientId = data.data._id;
    logPass("إنشاء ملف المريض", data);
  } else {
    logFail("إنشاء ملف المريض", data, status);
  }

  // 6. جلب ملف المريض
  ({ status, data } = await request(
    "GET",
    "/api/patient/profile",
    null,
    store.patientToken,
  ));
  if (status === 200) {
    logPass("جلب ملف المريض", data);
  } else {
    logFail("جلب ملف المريض", data, status);
  }

  // 7. إنشاء ملف دكتور
  ({ status, data } = await request(
    "POST",
    "/api/doctor/profile",
    {
      fullName: "د. محمد علي",
      specialization: "قلب وأوعية دموية",
      education: "كلية الطب جامعة القاهرة",
      qualifications: "دكتوراه القلب",
      yearsOfExperience: 10,
      bio: "استشاري أمراض القلب",
      consultationFeeSnapshot: 200,
    },
    store.doctorToken,
  ));
  if (status === 201 && data.data) {
    store.doctorId = data.data._id;
    logPass("إنشاء ملف الدكتور", data);
  } else {
    logFail("إنشاء ملف الدكتور", data, status);
  }

  // 8. جلب ملف الدكتور
  ({ status, data } = await request(
    "GET",
    "/api/doctor/profile",
    null,
    store.doctorToken,
  ));
  if (status === 200) {
    logPass("جلب ملف الدكتور", data);
  } else {
    logFail("جلب ملف الدكتور", data, status);
  }
}

async function testCatalog() {
  console.log("\n💊 === اختبار كتالوج الأدوية والتشخيصات ===");

  // 9. إضافة دواء
  let { status, data } = await request("POST", "/api/medications", {
    name: `باراسيتامول_${TS}`,
    genericName: "Acetaminophen",
    type: "مسكن",
  });
  if (status === 201 && data.data) {
    store.medicationId = data.data._id;
    logPass("إضافة دواء", data);
  } else {
    logFail("إضافة دواء", data, status);
  }

  // 10. جلب الأدوية
  ({ status, data } = await request("GET", "/api/medications"));
  if (status === 200) {
    logPass("جلب الأدوية", data);
  } else {
    logFail("جلب الأدوية", data, status);
  }

  // 11. إضافة تشخيص
  ({ status, data } = await request("POST", "/api/diagnoses", {
    name: `السكري_${TS}`,
    icdCode: `E11_${TS}`,
    description: "داء السكري من النوع الثاني",
  }));
  if (status === 201 && data.data) {
    store.diagnosisId = data.data._id;
    logPass("إضافة تشخيص", data);
  } else {
    logFail("إضافة تشخيص", data, status);
  }

  // 12. جلب التشخيصات
  ({ status, data } = await request("GET", "/api/diagnoses"));
  if (status === 200) {
    logPass("جلب التشخيصات", data);
  } else {
    logFail("جلب التشخيصات", data, status);
  }
}

async function testAvailability() {
  console.log("\n🗓️ === اختبار المواعيد المتاحة والاستثناءات ===");
  if (!store.doctorId) {
    console.log("  ⚠️ تخطي (لا يوجد doctorId)");
    return;
  }

  // 13. إضافة موعد أسبوعي
  let { status, data } = await request(
    "POST",
    "/api/availability",
    {
      doctorId: store.doctorId,
      dayOfWeek: "Monday",
      startTime: "09:00",
      endTime: "17:00",
      slotDurationMinutes: 30,
    },
    store.doctorToken,
  );
  if (status === 201 && data.data) {
    store.availabilityId = data.data._id;
    logPass("إضافة موعد أسبوعي", data);
  } else {
    logFail("إضافة موعد أسبوعي", data, status);
  }

  // 14. جلب مواعيد الطبيب المتاحة (عام)
  ({ status, data } = await request(
    "GET",
    `/api/availability/${store.doctorId}`,
  ));
  if (status === 200) {
    logPass("جلب مواعيد الطبيب المتاحة (عام)", data);
  } else {
    logFail("جلب مواعيد الطبيب المتاحة (عام)", data, status);
  }

  // 15. إضافة استثناء (إجازة)
  const startDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const endDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  ({ status, data } = await request(
    "POST",
    "/api/exceptions",
    {
      doctorId: store.doctorId,
      startDate,
      endDate,
      type: "Vacation",
      reason: "إجازة سنوية",
    },
    store.doctorToken,
  ));
  if (status === 201 && data.data) {
    store.exceptionId = data.data._id;
    logPass("إضافة استثناء (إجازة)", data);
  } else {
    logFail("إضافة استثناء (إجازة)", data, status);
  }

  // 16. فحص تاريخ محجوب (اليوم داخل نطاق الإجازة)
  const checkDate = new Date(Date.now() + 8 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  ({ status, data } = await request(
    "GET",
    `/api/exceptions/${store.doctorId}/check?date=${checkDate}`,
  ));
  if (status === 200 && data.isBlocked === true) {
    logPass("فحص تاريخ محجوب (متوقع مسدود)", data);
  } else {
    logFail("فحص تاريخ محجوب (متوقع مسدود)", data, status);
  }

  // 17. فحص تاريخ غير محجوب
  const freeDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  ({ status, data } = await request(
    "GET",
    `/api/exceptions/${store.doctorId}/check?date=${freeDate}`,
  ));
  if (status === 200 && data.isBlocked === false) {
    logPass("فحص تاريخ غير محجوب (متوقع مفتوح)", data);
  } else {
    logFail("فحص تاريخ غير محجوب (متوقع مفتوح)", data, status);
  }
}

async function testAppointments() {
  console.log("\n📅 === اختبار المواعيد (Appointments) ===");
  if (!store.patientId || !store.doctorId) {
    console.log("  ⚠️ تخطي (لا يوجد patientId/doctorId)");
    return;
  }

  // 18. إنشاء حجز
  const apptDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  let { status, data } = await request("POST", "/api/appointments", {
    patientId: store.patientId,
    doctorId: store.doctorId,
    appointmentDate: apptDate,
    appointmentTime: "10:30",
    consultationType: "In-Clinic",
    reasonForVisit: "ألم في الصدر",
    estimatedDurationMinutes: 30,
    consultationFeeSnapshot: 200,
  });
  if (status === 201 && data.data) {
    store.appointmentId = data.data._id;
    logPass("إنشاء حجز", data);
  } else {
    logFail("إنشاء حجز", data, status);
  }

  // 19. جلب حجوزات مريض
  ({ status, data } = await request(
    "GET",
    `/api/appointments/patient/${store.patientId}`,
  ));
  if (status === 200) {
    logPass("جلب حجوزات المريض", data);
  } else {
    logFail("جلب حجوزات المريض", data, status);
  }

  // 20. جلب حجوزات طبيب
  ({ status, data } = await request(
    "GET",
    `/api/appointments/doctor/${store.doctorId}`,
  ));
  if (status === 200) {
    logPass("جلب حجوزات الطبيب", data);
  } else {
    logFail("جلب حجوزات الطبيب", data, status);
  }

  // 21. تحديث حالة الحجز إلى مكتمل (حتى نتمكن من عمل وصفة وتقييم)
  if (store.appointmentId) {
    ({ status, data } = await request(
      "PATCH",
      `/api/appointments/${store.appointmentId}/status`,
      { status: "Completed" },
    ));
    if (status === 200) {
      logPass("تحديث حالة الحجز إلى مكتمل", data);
    } else {
      logFail("تحديث حالة الحجز إلى مكتمل", data, status);
    }
  }
}

async function testPrescription() {
  console.log("\n📋 === اختبار الوصفات الطبية (Prescriptions) ===");
  if (!store.appointmentId || !store.patientId || !store.doctorId) {
    console.log("  ⚠️ تخطي (لا يوجد بيانات كافية)");
    return;
  }

  // 22. إنشاء وصفة طبية
  let { status, data } = await request("POST", "/api/prescriptions", {
    patientId: store.patientId,
    doctorId: store.doctorId,
    appointmentId: store.appointmentId,
    diagnosisIds: store.diagnosisId ? [store.diagnosisId] : [],
    medications: [
      {
        medicationId: store.medicationId,
        dosage: "500mg",
        frequency: "3 مرات يومياً",
        duration: "5 أيام",
        instructions: "بعد الأكل",
      },
    ],
    notes: "راحة تامة",
  });
  if (status === 201 && data.data) {
    logPass("إنشاء وصفة طبية", data);
  } else {
    logFail("إنشاء وصفة طبية", data, status);
  }

  // 23. جلب وصفة من حجز
  ({ status, data } = await request(
    "GET",
    `/api/prescriptions/appointment/${store.appointmentId}`,
  ));
  if (status === 200) {
    logPass("جلب وصفة من حجز", data);
  } else {
    logFail("جلب وصفة من حجز", data, status);
  }

  // 24. جلب وصفات مريض
  ({ status, data } = await request(
    "GET",
    `/api/prescriptions/patient/${store.patientId}`,
  ));
  if (status === 200) {
    logPass("جلب وصفات المريض", data);
  } else {
    logFail("جلب وصفات المريض", data, status);
  }
}

async function testReviews() {
  console.log("\n⭐ === اختبار التقييمات (Reviews) ===");
  if (!store.appointmentId || !store.doctorId) {
    console.log("  ⚠️ تخطي (لا يوجد حجز مكتمل)");
    return;
  }

  // 25. إضافة تقييم
  let { status, data } = await request("POST", "/api/reviews", {
    appointmentId: store.appointmentId,
    rating: 5,
    comment: "دكتور ممتاز جداً",
  });
  if (status === 201 && data.data) {
    store.reviewId = data.data._id;
    logPass("إضافة تقييم", data);
  } else {
    logFail("إضافة تقييم", data, status);
  }

  // 26. جلب تقييمات دكتور
  ({ status, data } = await request(
    "GET",
    `/api/reviews/doctor/${store.doctorId}`,
  ));
  if (status === 200) {
    logPass("جلب تقييمات الدكتور", data);
  } else {
    logFail("جلب تقييمات الدكتور", data, status);
  }
}

async function testCleanup() {
  console.log("\n🧹 === اختبار الحذف ===");

  // 27. حذف استثناء
  if (store.exceptionId) {
    let { status, data } = await request(
      "DELETE",
      `/api/exceptions/${store.exceptionId}`,
      null,
      store.doctorToken,
    );
    if (status === 200) {
      logPass("حذف الاستثناء", data);
    } else {
      logFail("حذف الاستثناء", data, status);
    }
  }

  // 28. حذف موعد أسبوعي
  if (store.availabilityId) {
    let { status, data } = await request(
      "DELETE",
      `/api/availability/${store.availabilityId}`,
      null,
      store.doctorToken,
    );
    if (status === 200) {
      logPass("حذف الموعد الأسبوعي", data);
    } else {
      logFail("حذف الموعد الأسبوعي", data, status);
    }
  }
}

async function run() {
  console.log("🧪 بدء اختبار الـ API Endpoints...");
  console.log(`🔗 BASE_URL: ${BASE_URL}`);

  try {
    // اختبار الاتصال بالخادم
    const testRes = await request("GET", "/api/medications");
    if (testRes.status === 200) {
      console.log("✅ الخادم يعمل بنجاح");
    }
  } catch (e) {
    console.error(
      "❌ لا يمكن الاتصال بالخادم. تأكد من تشغيله أولاً (npm start)",
    );
    console.log("   ثم أعد تشغيل هذا السكربت.");
    process.exit(1);
  }

  await testAuth();
  await testProfiles();
  await testCatalog();
  await testAvailability();
  await testAppointments();
  await testPrescription();
  await testReviews();
  await testCleanup();

  console.log("\n" + "=".repeat(50));
  console.log(`📊 النتيجة: ${passed} ✅ نجحت | ${failed} ❌ فشلت`);
  console.log("=".repeat(50));

  process.exit(failed > 0 ? 1 : 0);
}

run();
