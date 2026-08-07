# 📡 دليل الـ API Endpoints الكامل

قاعدة المسار الأساسي: `http://localhost:5000`

## 🔐 المصادقة (Auth)

### 1. تسجيل حساب جديد

- **POST** `/api/auth/register`
- **Body:**

```json
{
  "email": "doctor@example.com",
  "password": "123456",
  "role": "doctor" // "patient" | "doctor" | "admin"
}
```

- **Response:** `201 Created` → `{ _id, email, role, token }`

### 2. تسجيل الدخول

- **POST** `/api/auth/login`
- **Body:**

```json
{
  "email": "doctor@example.com",
  "password": "123456"
}
```

- **Response:** `200 OK` → `{ _id, email, role, token }`

> ⚠️ **ملاحظة:** جميع الـ endpoints المحمية تحتاج هيدر `Authorization: Bearer <token>`

---

## 👤 المريض (Patient)

### 3. جلب ملف المريض (محمي - patient فقط)

- **GET** `/api/patient/profile`
- **Auth:** Bearer token
- **Response:** `200 OK` → `{ success, data: { patient } }`

### 4. إنشاء ملف المريض (محمي)

- **POST** `/api/patient/profile`
- **Auth:** Bearer token
- **Body:**

```json
{
  "fullName": "أحمد محمد",
  "phoneNumber": "01012345678",
  "age": 30,
  "gender": "male", // "male" | "female"
  "address": "القاهرة",
  "occupation": "مهندس",
  "companyName": "شركة"
}
```

- **Response:** `201 Created`

### 5. تحديث ملف المريض (محمي)

- **PUT** `/api/patient/profile`
- **Auth:** Bearer token
- **Body:** أي حقول تريد تحديثها

---

## 👨⚕️ الطبيب (Doctor)

### 6. جلب ملف الطبيب (محمي - doctor فقط)

- **GET** `/api/doctor/profile`
- **Auth:** Bearer token
- **Response:** `200 OK` → `{ success, data: { doctor } }`

### 7. إنشاء ملف الطبيب (محمي)

- **POST** `/api/doctor/profile`
- **Auth:** Bearer token
- **Body:**

```json
{
  "fullName": "د. محمد علي",
  "specialization": "قلب",
  "education": "كلية الطب",
  "qualifications": "ماجستير",
  "yearsOfExperience": 10,
  "bio": "نبذة",
  "rating": 0,
  "consultationFeeSnapshot": 200
}
```

- **Response:** `201 Created`

### 8. تحديث ملف الطبيب (محمي)

- **PUT** `/api/doctor/profile`
- **Auth:** Bearer token
- **Body:** أي حقول تريد تحديثها

---

## 📅 المواعيد (Appointments)

### 9. إنشاء حجز جديد

- **POST** `/api/appointments`
- **Body:**

```json
{
  "patientId": "<patient_id>",
  "doctorId": "<doctor_id>",
  "appointmentDate": "2025-06-15",
  "appointmentTime": "10:30",
  "consultationType": "In-Clinic", // "In-Clinic" | "Online"
  "reasonForVisit": "ألم في الصدر",
  "estimatedDurationMinutes": 30,
  "consultationFeeSnapshot": 200
}
```

- **Response:** `201 Created`

### 10. جلب حجوزات مريض

- **GET** `/api/appointments/patient/:patientId`

### 11. جلب حجوزات طبيب

- **GET** `/api/appointments/doctor/:doctorId`

### 12. تحديث حالة الحجز

- **PATCH** `/api/appointments/:id/status`
- **Body:**

```json
{ "status": "Completed" } // Pending | Confirmed | Completed | Cancelled | No-Show
```

---

## 🗓️ المواعيد المتاحة (Weekly Availability)

### 13. إضافة موعد أسبوعي (محمي)

- **POST** `/api/availability`
- **Auth:** Bearer token
- **Body:**

```json
{
  "doctorId": "<doctor_id>",
  "dayOfWeek": "Monday", // حتى Sunday
  "startTime": "09:00",
  "endTime": "17:00",
  "slotDurationMinutes": 30
}
```

- **Response:** `201 Created`

### 14. جلب مواعيد طبيب المتاحة (عام)

- **GET** `/api/availability/:doctorId`

### 15. تحديث موعد (محمي)

- **PUT** `/api/availability/:id`
- **Auth:** Bearer token
- **Body:** الحقول المراد تحديثها

### 16. حذف موعد (محمي)

- **DELETE** `/api/availability/:id`
- **Auth:** Bearer token

---

## 🏖️ الاستثناءات (Schedule Exceptions)

### 17. إضافة استثناء (محمي)

- **POST** `/api/exceptions`
- **Auth:** Bearer token
- **Body:**

```json
{
  "doctorId": "<doctor_id>",
  "startDate": "2025-07-01",
  "endDate": "2025-07-10",
  "type": "Vacation", // Vacation | Blocked | Emergency
  "reason": "إجازة"
}
```

- **Response:** `201 Created`

### 18. جلب استثناءات طبيب (عام)

- **GET** `/api/exceptions/:doctorId`

### 19. فحص إذا كان تاريخ محجوب (عام)

- **GET** `/api/exceptions/:doctorId/check?date=2025-07-05`
- **Response:** `{ success, isBlocked: true/false, data }`

### 20. حذف استثناء (محمي)

- **DELETE** `/api/exceptions/:id`
- **Auth:** Bearer token

---

## 🩺 التشخيصات (Diagnoses)

### 21. إضافة تشخيص

- **POST** `/api/diagnoses`
- **Body:**

```json
{
  "name": "السكري",
  "icdCode": "E11.9",
  "description": "داء السكري من النوع الثاني"
}
```

- **Response:** `201 Created` (409 إذا كان موجود)

### 22. جلب كل التشخيصات

- **GET** `/api/diagnoses`

### 23. جلب تشخيص واحد

- **GET** `/api/diagnoses/:id`

---

## 💊 الأدوية (Medications)

### 24. إضافة دواء

- **POST** `/api/medications`
- **Body:**

```json
{
  "name": "باراسيتامول",
  "genericName": "Acetaminophen",
  "type": "مسكن"
}
```

- **Response:** `201 Created`

### 25. جلب كل الأدوية (مع فلترة اختيارية)

- **GET** `/api/medications`
- **Query:** `?type=مسكن` (اختياري)

### 26. جلب دواء واحد

- **GET** `/api/medications/:id`

---

## 📋 الوصفات الطبية (Prescriptions)

### 27. إنشاء وصفة طبية (حجز مكتمل فقط)

- **POST** `/api/prescriptions`
- **Body:**

```json
{
  "patientId": "<patient_id>",
  "doctorId": "<doctor_id>",
  "appointmentId": "<appointment_id مكتمل>",
  "diagnosisIds": ["<diagnosis_id>"],
  "medications": [
    {
      "medicationId": "<medication_id>",
      "dosage": "500mg",
      "frequency": "3 مرات يومياً",
      "duration": "5 أيام",
      "instructions": "بعد الأكل"
    }
  ],
  "notes": "ملاحظات"
}
```

- **Response:** `201 Created`

### 28. جلب وصفة مباشرة من حجز

- **GET** `/api/prescriptions/appointment/:appointmentId`

### 29. جلب وصفات مريض

- **GET** `/api/prescriptions/patient/:patientId`

---

## ⭐ التقييمات (Reviews)

### 30. إضافة تقييم (حجز مكتمل فقط)

- **POST** `/api/reviews`
- **Body:**

```json
{
  "appointmentId": "<appointment_id مكتمل>",
  "rating": 5, // 1-5
  "comment": "دكتور ممتاز"
}
```

- **Response:** `201 Created` — يقوم تلقائياً بتحديث متوسط تقييم الطبيب

### 31. جلب تقييمات طبيب

- **GET** `/api/reviews/doctor/:doctorId`
