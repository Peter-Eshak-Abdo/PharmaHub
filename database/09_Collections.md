# MongoDB Collections & Document Schemas

This document defines the exact BSON/JSON structure, document field definitions, and sample document payloads for all 15 MongoDB collections in the Doctor Appointment Management System.

---

## 1. Collection: `users`
```json
{
  "_id": { "$oid": "65c3b1a2e4b0123456789a01" },
  "email": "dr.smith@pharmahub.com",
  "passwordHash": "$2b$10$e8Z9K4xW2PqL1mN3vO5u7eY8R9S0T1U2V3W4X5Y6Z7a8b9c0d1e2f",
  "role": "doctor",
  "createdAt": { "$date": "2026-01-15T08:00:00.000Z" },
  "updatedAt": { "$date": "2026-01-15T08:00:00.000Z" }
}
```

---

## 2. Collection: `patients`
```json
{
  "_id": { "$oid": "65c3b1a2e4b0123456789abc" },
  "userId": { "$oid": "65c3b1a2e4b0123456789a02" },
  "fullName": "Alice Johnson",
  "address": "123 Healthcare Ave, Suite 400, Boston, MA",
  "age": 34,
  "gender": "Female",
  "phone": "+1-555-019-2834",
  "occupation": "Software Engineer",
  "companyName": "TechCorp Solutions"
}
```

---

## 3. Collection: `doctors`
```json
{
  "_id": { "$oid": "65c3b1a2e4b0123456789doc" },
  "userId": { "$oid": "65c3b1a2e4b0123456789a01" },
  "fullName": "Dr. Robert Smith, MD",
  "specialization": "Cardiology",
  "education": "MD from Harvard Medical School",
  "qualifications": "Board Certified in Cardiovascular Disease, FACC",
  "yearsExperience": 14,
  "bio": "Specializing in preventive cardiology, heart failure management, and hypertension.",
  "rating": 4.92
}
```

---

## 4. Collection: `clinics`
```json
{
  "_id": { "$oid": "65c3b1a2e4b0123456789cln" },
  "name": "Boston Heart & Wellness Clinic",
  "address": "750 Washington Street",
  "city": "Boston",
  "contactInfo": "+1-617-555-7000",
  "workingHours": "Mon-Fri: 08:00 AM - 06:00 PM, Sat: 09:00 AM - 01:00 PM"
}
```

---

## 5. Collection: `doctorClinicAssignments`
```json
{
  "_id": { "$oid": "65c3b1a2e4b0123456789asg" },
  "doctorId": { "$oid": "65c3b1a2e4b0123456789doc" },
  "clinicId": { "$oid": "65c3b1a2e4b0123456789cln" },
  "consultationFee": 150.00,
  "isActive": true
}
```

---

## 6. Collection: `weeklyAvailabilities`
```json
{
  "_id": { "$oid": "65c3b1a2e4b0123456789avl" },
  "doctorId": { "$oid": "65c3b1a2e4b0123456789doc" },
  "clinicId": { "$oid": "65c3b1a2e4b0123456789cln" },
  "dayOfWeek": "Monday",
  "startTime": "09:00",
  "endTime": "17:00",
  "slotDurationMinutes": 30
}
```

---

## 7. Collection: `scheduleExceptions`
```json
{
  "_id": { "$oid": "65c3b1a2e4b0123456789exc" },
  "doctorId": { "$oid": "65c3b1a2e4b0123456789doc" },
  "startDate": { "$date": "2026-08-20T00:00:00.000Z" },
  "endDate": { "$date": "2026-08-27T23:59:59.000Z" },
  "type": "VACATION"
}
```

---

## 8. Collection: `appointments`
```json
{
  "_id": { "$oid": "65c3b1a2e4b0123456789app" },
  "patientId": { "$oid": "65c3b1a2e4b0123456789abc" },
  "doctorId": { "$oid": "65c3b1a2e4b0123456789doc" },
  "clinicId": { "$oid": "65c3b1a2e4b0123456789cln" },
  "bookingDate": { "$date": "2026-08-01T10:30:00.000Z" },
  "appointmentDate": { "$date": "2026-08-10T00:00:00.000Z" },
  "appointmentTime": "10:00",
  "consultationType": "in-clinic",
  "reason": "Annual cardiovascular checkup and blood pressure evaluation.",
  "durationMinutes": 30,
  "status": "Completed",
  "consultationFeeSnapshot": 150.00
}
```

---

## 9. Collection: `payments`
```json
{
  "_id": { "$oid": "65c3b1a2e4b0123456789pay" },
  "appointmentId": { "$oid": "65c3b1a2e4b0123456789app" },
  "amount": 150.00,
  "method": "Credit Card",
  "paymentDate": { "$date": "2026-08-01T10:32:15.000Z" },
  "status": "Completed",
  "transactionRef": "ch_3N9x4kL2eZvKYlo10XyZaBc9",
  "attemptCount": 1
}
```

---

## 10. Collection: `prescriptions` (Includes Embedded Medications & Diagnosis References)
```json
{
  "_id": { "$oid": "65c3b1a2e4b0123456789rx1" },
  "appointmentId": { "$oid": "65c3b1a2e4b0123456789app" },
  "issuedDate": { "$date": "2026-08-10T00:00:00.000Z" },
  "diagnosisIds": [
    { "$oid": "65c3b1a2e4b0123456789dG1" },
    { "$oid": "65c3b1a2e4b0123456789dG2" }
  ],
  "medications": [
    {
      "_id": { "$oid": "65c3b1a2e4b0123456789rxM1" },
      "medicationId": { "$oid": "65c3b1a2e4b0123456789mEd1" },
      "dosage": "10 mg",
      "frequency": "Once daily in the morning",
      "duration": "30 days",
      "instructions": "Take with water before breakfast.",
      "notes": "Monitor blood pressure weekly."
    }
  ]
}
```

---

## 11. Collection: `diagnoses`
```json
{
  "_id": { "$oid": "65c3b1a2e4b0123456789dG1" },
  "name": "Essential (Primary) Hypertension",
  "icdCode": "I10",
  "description": "High blood pressure with no identifiable secondary cause."
}
```

---

## 12. Collection: `medications`
```json
{
  "_id": { "$oid": "65c3b1a2e4b0123456789mEd1" },
  "name": "Zestril",
  "genericName": "Lisinopril",
  "type": "Tablet"
}
```

---

## 13. Collection: `medicationReminders`
```json
{
  "_id": { "$oid": "65c3b1a2e4b0123456789rem" },
  "prescribedItemId": { "$oid": "65c3b1a2e4b0123456789rxM1" },
  "scheduledTime": { "$date": "2026-08-11T08:00:00.000Z" },
  "acknowledgmentStatus": "ACKNOWLEDGED",
  "completionStatus": "TAKEN"
}
```

---

## 14. Collection: `reviews`
```json
{
  "_id": { "$oid": "65c3b1a2e4b0123456789rev" },
  "appointmentId": { "$oid": "65c3b1a2e4b0123456789app" },
  "patientId": { "$oid": "65c3b1a2e4b0123456789abc" },
  "doctorId": { "$oid": "65c3b1a2e4b0123456789doc" },
  "rating": 5,
  "comment": "Dr. Smith was extremely thorough, explained my treatment options clearly, and put me at ease.",
  "submittedDate": { "$date": "2026-08-10T16:45:00.000Z" }
}
```

---

## 15. Collection: `notifications`
```json
{
  "_id": { "$oid": "65c3b1a2e4b0123456789ntf" },
  "recipientId": { "$oid": "65c3b1a2e4b0123456789a02" },
  "message": "Your appointment with Dr. Robert Smith has been confirmed for Aug 10, 2026 at 10:00 AM.",
  "triggerEvent": "APPOINTMENT_CONFIRMED",
  "sentAt": { "$date": "2026-08-01T10:32:16.000Z" },
  "readStatus": "READ"
}
```
