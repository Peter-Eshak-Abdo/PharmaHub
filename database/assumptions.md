# System Assumptions & Architectural Decisions

This document outlines the core architectural assumptions, domain constraints, and technical design decisions governing the database model for the Doctor Appointment Management System.

---

## 1. Authentication & Profile Architecture

### 1.1 Single Unified Authentication Layer
* **Assumption**: Every active user in the system (Patient, Doctor, Administrator) authenticates through a single `User` collection storing core credentials (`email`, `password_hash`, `role`).
* **Rationale**: Eliminates redundant login flows, password reset mechanisms, and session management logic across different user types. Security audits and permissions are centralized in one authentication layer.

### 1.2 Profile Extension Pattern (1 : 0..1)
* **Assumption**: A `User` record with `role = 'patient'` has exactly one corresponding `Patient` profile record (`userId` unique constraint). A `User` record with `role = 'doctor'` has exactly one corresponding `Doctor` profile record (`userId` unique constraint).
* **Admin Profile-less Design**: Users with `role = 'admin'` do **not** have an associated profile record in `Patient` or `Doctor`. Administrators require system-level access to management tools and reports, but do not possess clinical or demographic attributes. Creating dummy profile records for admins is avoided.

---

## 2. Availability Modeling & Financial Snapshotting

### 2.1 Financial Snapshotting on Appointments
* **Assumption**: When a patient books an appointment, the system captures and stores the effective consultation fee in `consultationFeeSnapshot` on the `Appointment` record.
* **Rationale**: If a doctor adjusts their fee structure in the future, historical financial records and analytics will accurately reflect the exact rate agreed upon at the time of booking.

### 2.2 Two-Tier Availability Engine
* **Assumption**: Doctor availability is strictly separated into:
  1. `WeeklyAvailability`: A recurring weekly schedule template (e.g., Every Monday 09:00 - 17:00 with 30-min slots).
  2. `ScheduleException`: Time-bounded overrides (e.g., Vacation from Aug 10 to Aug 20, or an emergency schedule change).
* **Slot Overriding Rule**: A requested appointment time is valid **if and only if**:
  * It falls within an active `WeeklyAvailability` window for that doctor.
  * It does **not** fall within any `ScheduleException` of type `Blocked`, `Vacation`, or `Emergency`.
  * It does **not** overlap with an existing `Appointment` for that doctor that has a status of `Pending`, `Confirmed`, or `Completed`.

---

## 3. Clinical & Prescription Subsystem

### 3.1 Prescription Lifecycle & Binding
* **Assumption**: A `Prescription` can only be generated after an `Appointment` is transitioned to `Completed` status. An appointment can yield at most one `Prescription` (`1 : 0..1`).
* **Rationale**: Prescriptions cannot exist in isolation without a verified completed consultation visit. Enforced via a unique index on `Prescription.appointmentId`.

### 3.2 Shared Catalog vs. Instance Data
* **Catalog Entities**: `Diagnosis` (ICD code, diagnosis name) and `Medication` (generic name, brand name, formulation type) exist as global catalog collections shared across the platform.
* **Instance Data**: Dosage, frequency (e.g., "Twice daily"), duration (e.g., "7 days"), administration instructions, and doctor notes vary per prescription. This instance-level data is embedded in `medications` subdocuments directly inside the prescription.

---

## 4. Medical History & Review Integrity

### 4.1 On-Demand Medical History Aggregation
* **Assumption**: `Medical History` is **not** stored as a separate collection in the database.
* **Rationale**: Storing medical history as a static collection creates severe data synchronization risks (e.g., updating a diagnosis or prescription would require updating duplicate history records). Instead, medical history is dynamically aggregated on-demand via MongoDB aggregation pipelines filtering by `patientId`.

### 4.2 Review Authenticity Enforcement
* **Assumption**: A `Review` must be linked directly to a specific `Appointment` (`1 : 0..1`), not just generally to a doctor.
* **Validation Constraint**: A patient can only submit a review for an appointment that has `status = 'Completed'` and does not already have an associated review. This prevents fake reviews, spamming, or duplicate feedback for a single visit.

---

## 5. Database Paradigm & Technical Rules

| Architectural Domain | MongoDB (NoSQL) Implementation Rule |
|---|---|
| **Referential Integrity** | Enforced at Application Layer (Mongoose middleware / Service validation) & Unique Indexes |
| **Prescription Items** | Embedded Subdocument Array (`prescription.medications: [{ medicationId, dosage, frequency, ... }]`) |
| **Diagnoses Link** | Array of ObjectIds (`prescription.diagnosisIds: [ObjectId]`) |
| **Concurrency Control** | Compound Unique Indexes (e.g., partial unique index on doctor appointment slots excluding cancelled status) |
