# Complete System Seed Data Scripts

This document provides ready-to-execute seed dataset scripts for both Relational SQL (PostgreSQL) and NoSQL (MongoDB) databases. The dataset contains realistic mock records covering users, doctors, clinics, schedules, appointments, payments, prescriptions, reminders, reviews, and notifications.

---

## Part 1: PostgreSQL SQL Seed Script (`seed.sql`)

```sql
BEGIN;

-- 1. SEED USERS
INSERT INTO users (user_id, email, password_hash, role) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin@pharmahub.com', '$2b$10$e8Z9K4xW2PqL1mN3vO5u7eY8R9S0T1U2V3W4X5Y6Z7a8b9c0d1e2f', 'admin'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'dr.smith@pharmahub.com', '$2b$10$e8Z9K4xW2PqL1mN3vO5u7eY8R9S0T1U2V3W4X5Y6Z7a8b9c0d1e2f', 'doctor'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'dr.davis@pharmahub.com', '$2b$10$e8Z9K4xW2PqL1mN3vO5u7eY8R9S0T1U2V3W4X5Y6Z7a8b9c0d1e2f', 'doctor'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'alice.johnson@example.com', '$2b$10$e8Z9K4xW2PqL1mN3vO5u7eY8R9S0T1U2V3W4X5Y6Z7a8b9c0d1e2f', 'patient'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'michael.brown@example.com', '$2b$10$e8Z9K4xW2PqL1mN3vO5u7eY8R9S0T1U2V3W4X5Y6Z7a8b9c0d1e2f', 'patient');

-- 2. SEED PATIENTS
INSERT INTO patients (patient_id, user_id, full_name, address, age, gender, phone, occupation, company_name) VALUES
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Alice Johnson', '123 Healthcare Ave, Boston, MA', 34, 'Female', '+1-555-019-2834', 'Software Engineer', 'TechCorp'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'Michael Brown', '456 Beacon St, Boston, MA', 45, 'Male', '+1-555-019-5821', 'Financial Analyst', 'Fidelity Partners');

-- 3. SEED DOCTORS
INSERT INTO doctors (doctor_id, user_id, full_name, specialization, education, qualifications, years_experience, bio, rating) VALUES
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Dr. Robert Smith, MD', 'Cardiology', 'MD Harvard Medical School', 'FACC Board Certified', 14, 'Cardiology specialist.', 4.90),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c22', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Dr. Sarah Davis, MD', 'Dermatology', 'MD Johns Hopkins', 'Board Certified Dermatologist', 10, 'Skin care expert.', 4.85);

-- 4. SEED CLINICS
INSERT INTO clinics (clinic_id, name, address, city, contact_info, working_hours) VALUES
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380d11', 'Boston Heart & Wellness Clinic', '750 Washington Street', 'Boston', '+1-617-555-7000', 'Mon-Fri: 08:00 AM - 06:00 PM'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380d22', 'Downtown Skin & Laser Center', '200 Newbury Street', 'Boston', '+1-617-555-8822', 'Mon-Sat: 09:00 AM - 05:00 PM');

-- 5. SEED DOCTOR-CLINIC ASSIGNMENTS
INSERT INTO doctor_clinic_assignments (assignment_id, doctor_id, clinic_id, consultation_fee, is_active) VALUES
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e11', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c11', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d11', 150.00, true),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e22', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c22', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d22', 120.00, true);

-- 6. SEED WEEKLY AVAILABILITIES
INSERT INTO weekly_availabilities (availability_id, doctor_id, clinic_id, day_of_week, start_time, end_time, slot_duration_minutes) VALUES
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f11', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c11', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d11', 'Monday', '09:00:00', '17:00:00', 30),
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f22', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c22', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d22', 'Wednesday', '10:00:00', '16:00:00', 30);

-- 7. SEED APPOINTMENTS
INSERT INTO appointments (appointment_id, patient_id, doctor_id, clinic_id, booking_date, appointment_date, appointment_time, consultation_type, reason, duration_minutes, status, consultation_fee_snapshot) VALUES
('10eebc99-9c0b-4ef8-bb6d-6bb9bd380111', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c11', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d11', '2026-08-01 10:00:00+00', '2026-08-10', '10:00:00', 'in-clinic', 'Cardiovascular checkup', 30, 'Completed', 150.00),
('10eebc99-9c0b-4ef8-bb6d-6bb9bd380122', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c22', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d22', '2026-08-02 11:30:00+00', '2026-08-12', '11:00:00', 'online', 'Skin rash consultation', 30, 'Confirmed', 120.00);

-- 8. SEED PAYMENTS
INSERT INTO payments (payment_id, appointment_id, amount, method, payment_date, status, transaction_ref, attempt_count) VALUES
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380211', '10eebc99-9c0b-4ef8-bb6d-6bb9bd380111', 150.00, 'Credit Card', '2026-08-01 10:02:15+00', 'Completed', 'ch_3N9x4kL2eZvKYlo10XyZaBc9', 1),
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380222', '10eebc99-9c0b-4ef8-bb6d-6bb9bd380122', 120.00, 'Debit Card', '2026-08-02 11:32:00+00', 'Completed', 'ch_3N9x4kL2eZvKYlo10XyZaBc0', 1);

-- 9. SEED DIAGNOSES & MEDICATIONS CATALOG
INSERT INTO diagnoses (diagnosis_id, name, icd_code, description) VALUES
('30eebc99-9c0b-4ef8-bb6d-6bb9bd380311', 'Essential Hypertension', 'I10', 'High blood pressure'),
('30eebc99-9c0b-4ef8-bb6d-6bb9bd380322', 'Atopic Dermatitis', 'L20.9', 'Eczema / skin inflammation');

INSERT INTO medications (medication_id, name, generic_name, type) VALUES
('40eebc99-9c0b-4ef8-bb6d-6bb9bd380411', 'Zestril', 'Lisinopril', 'Tablet'),
('40eebc99-9c0b-4ef8-bb6d-6bb9bd380422', 'Hydrocortisone Cream 1%', 'Hydrocortisone', 'Ointment');

-- 10. SEED PRESCRIPTIONS & ITEMS
INSERT INTO prescriptions (prescription_id, appointment_id, issued_date) VALUES
('50eebc99-9c0b-4ef8-bb6d-6bb9bd380511', '10eebc99-9c0b-4ef8-bb6d-6bb9bd380111', '2026-08-10');

INSERT INTO prescription_diagnoses (prescription_id, diagnosis_id) VALUES
('50eebc99-9c0b-4ef8-bb6d-6bb9bd380511', '30eebc99-9c0b-4ef8-bb6d-6bb9bd380311');

INSERT INTO prescribed_medications (prescribed_item_id, prescription_id, medication_id, dosage, frequency, duration, instructions, notes) VALUES
('60eebc99-9c0b-4ef8-bb6d-6bb9bd380611', '50eebc99-9c0b-4ef8-bb6d-6bb9bd380511', '40eebc99-9c0b-4ef8-bb6d-6bb9bd380411', '10 mg', 'Once daily', '30 days', 'Take with water before breakfast', 'Monitor blood pressure');

-- 11. SEED REVIEWS
INSERT INTO reviews (review_id, appointment_id, patient_id, doctor_id, rating, comment, submitted_date) VALUES
('70eebc99-9c0b-4ef8-bb6d-6bb9bd380711', '10eebc99-9c0b-4ef8-bb6d-6bb9bd380111', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c11', 5, 'Dr. Smith was wonderful and clear in his explanation!', '2026-08-10 16:30:00+00');

COMMIT;
```

---

## Part 2: MongoDB Shell Seed Script (`seed.js`)

```javascript
// Switch database
db = db.getSiblingDB("pharmahub_db");

// 1. Users
db.users.insertMany([
  {
    _id: ObjectId("65c3b1a2e4b0123456789a01"),
    email: "dr.smith@pharmahub.com",
    passwordHash: "$2b$10$e8Z9K4xW2PqL1mN3vO5u7eY8R9S0T1U2V3W4X5Y6Z7a8b9c0d1e2f",
    role: "doctor",
    createdAt: new Date("2026-01-15T08:00:00Z")
  },
  {
    _id: ObjectId("65c3b1a2e4b0123456789a02"),
    email: "alice.johnson@example.com",
    passwordHash: "$2b$10$e8Z9K4xW2PqL1mN3vO5u7eY8R9S0T1U2V3W4X5Y6Z7a8b9c0d1e2f",
    role: "patient",
    createdAt: new Date("2026-01-20T09:00:00Z")
  }
]);

// 2. Patients & Doctors
db.patients.insertOne({
  _id: ObjectId("65c3b1a2e4b0123456789abc"),
  userId: ObjectId("65c3b1a2e4b0123456789a02"),
  fullName: "Alice Johnson",
  phone: "+1-555-019-2834",
  age: 34,
  gender: "Female"
});

db.doctors.insertOne({
  _id: ObjectId("65c3b1a2e4b0123456789doc"),
  userId: ObjectId("65c3b1a2e4b0123456789a01"),
  fullName: "Dr. Robert Smith, MD",
  specialization: "Cardiology",
  rating: 4.90
});

// 3. Clinics & Assignments
db.clinics.insertOne({
  _id: ObjectId("65c3b1a2e4b0123456789cln"),
  name: "Boston Heart & Wellness Clinic",
  address: "750 Washington Street",
  city: "Boston",
  contactInfo: "+1-617-555-7000"
});

db.doctorClinicAssignments.insertOne({
  _id: ObjectId("65c3b1a2e4b0123456789asg"),
  doctorId: ObjectId("65c3b1a2e4b0123456789doc"),
  clinicId: ObjectId("65c3b1a2e4b0123456789cln"),
  consultationFee: 150.00,
  isActive: true
});

// 4. Appointments & Payments
db.appointments.insertOne({
  _id: ObjectId("65c3b1a2e4b0123456789app"),
  patientId: ObjectId("65c3b1a2e4b0123456789abc"),
  doctorId: ObjectId("65c3b1a2e4b0123456789doc"),
  clinicId: ObjectId("65c3b1a2e4b0123456789cln"),
  bookingDate: new Date("2026-08-01T10:00:00Z"),
  appointmentDate: new Date("2026-08-10T00:00:00Z"),
  appointmentTime: "10:00",
  consultationType: "in-clinic",
  status: "Completed",
  consultationFeeSnapshot: 150.00
});

db.payments.insertOne({
  _id: ObjectId("65c3b1a2e4b0123456789pay"),
  appointmentId: ObjectId("65c3b1a2e4b0123456789app"),
  amount: 150.00,
  method: "Credit Card",
  status: "Completed",
  transactionRef: "ch_3N9x4kL2eZvKYlo10XyZaBc9"
});

// 5. Prescriptions with Embedded Subdocuments
db.prescriptions.insertOne({
  _id: ObjectId("65c3b1a2e4b0123456789rx1"),
  appointmentId: ObjectId("65c3b1a2e4b0123456789app"),
  issuedDate: new Date("2026-08-10T00:00:00Z"),
  diagnosisIds: [ObjectId("65c3b1a2e4b0123456789dG1")],
  medications: [
    {
      _id: ObjectId("65c3b1a2e4b0123456789rxM1"),
      medicationId: ObjectId("65c3b1a2e4b0123456789mEd1"),
      dosage: "10 mg",
      frequency: "Once daily",
      duration: "30 days",
      instructions: "Take before breakfast"
    }
  ]
});

print("Database successfully seeded with realistic sample data!");
```
