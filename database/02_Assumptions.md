# System Assumptions & Design Decisions

This document outlines the core architectural assumptions, domain constraints, and technical design decisions governing the database model for the Doctor Appointment Management System.

---

## 1. Authentication & Profile Architecture

### 1.1 Single Unified Authentication Layer
* **Assumption**: Every active user in the system (Patient, Doctor, Administrator) authenticates through a single `User` table/collection storing core credentials (`email`, `password_hash`, `role`).
* **Rationale**: Eliminates redundant login flows, password reset mechanisms, and session management logic across different user types. Security audits and permissions are centralized in one authentication layer.

### 1.2 Profile Extension Pattern (1 : 0..1)
* **Assumption**: A `User` record with `role = 'patient'` has exactly one corresponding `Patient` profile record. A `User` record with `role = 'doctor'` has exactly one corresponding `Doctor` profile record.
* **Admin Profile-less Design**: Users with `role = 'admin'` do **not** have an associated profile record in `Patient` or `Doctor`. Administrators require system-level access to management tools and reports, but do not possess medical attributes, personal addresses, or clinical qualifications. Creating dummy profile tables for admins is avoided.

---

## 2. Multi-Clinic Pricing & Availability Modeling

### 2.1 Doctor-Clinic Decoupling
* **Assumption**: Doctors can practice across multiple clinics simultaneously, and clinics can host multiple doctors (Many-to-Many).
* **Consultation Fee Location**: Consultation fees are **not** stored on the `Doctor` profile. Instead, fees are stored on the `Doctor_Clinic_Assignment` entity.
* **Rationale**: The same doctor may charge different rates based on clinic location, facility amenities, or contractual terms (e.g., $100 at Clinic A vs. $150 at Clinic B).

### 2.2 Financial Snapshotting on Appointments
* **Assumption**: When a patient books an appointment, the system copies the current consultation fee from `Doctor_Clinic_Assignment` into `consultation_fee_snapshot` on the `Appointment` entity.
* **Rationale**: If a doctor increases their consultation fee months after an appointment occurred, historical financial reports, invoices, and accounting audits must reflect the exact amount charged at the time of booking.

### 2.3 Two-Tier Availability Engine
* **Assumption**: Doctor availability is strictly separated into:
  1. `Weekly_Availability`: A recurring weekly schedule template (e.g., Every Monday 09:00 - 17:00 at Clinic A with 30-min slots).
  2. `Schedule_Exception`: Time-bounded overrides (e.g., Vacation from Aug 10 to Aug 20, or an emergency evening shift).
* **Slot Overriding Rule**: A requested appointment time is valid **if and only if**:
  * It falls within an active `Weekly_Availability` window for that doctor and clinic.
  * It does **not** fall within any `Schedule_Exception` of type `BLOCKED` / `VACATION`.
  * It does **not** overlap with an existing `Appointment` that has a status of `Pending`, `Confirmed`, or `Completed`.

---

## 3. Financial & Payment Processing

### 3.1 Strict 1:1 Appointment-Payment Mapping
* **Assumption**: Every appointment requires exactly one associated `Payment` record.
* **Payment Lifecycle**: Payment records track payment status (`Pending`, `Completed`, `Failed`, `Refunded`), payment method, timestamp, and external transaction reference strings.
* **Retry Strategy**: The `attempt_count` attribute on `Payment` tracks the number of charge attempts made before success or final cancellation, ensuring transaction auditability without creating multiple dangling payment records for a single booking attempt.

---

## 4. Clinical & Prescription Subsystem

### 4.1 Prescription Lifecycle & Binding
* **Assumption**: A `Prescription` can only be generated after an `Appointment` is transitioned to `Completed` status. An appointment can yield at most one `Prescription` (`1 : 0..1`).
* **Rationale**: Prescriptions cannot exist in isolation without a verified completed consultation visit.

### 4.2 Shared Catalog vs. Instance Data
* **Catalog Entities**: `Diagnosis` (ICD code, diagnosis name) and `Medication` (generic name, brand name, formulation type) exist as global catalog entities shared across the platform.
* **Instance Entities**: Dosage, frequency (e.g., "Twice daily"), duration (e.g., "7 days"), administration instructions, and doctor notes vary per patient and prescription. This instance-level data is stored in `Prescribed_Medication`.

### 4.3 Automated Medication Reminders
* **Assumption**: `Medication_Reminder` records are spawned directly from `Prescribed_Medication` entries based on prescribed frequency and duration.
* **Reminder Tracking**: Reminders track exact scheduled execution times (`scheduled_time`), acknowledgment status (`PENDING`, `ACKNOWLEDGED`), and completion status (`TAKEN`, `MISSED`, `SKIPPED`).

---

## 5. Medical History & Review Integrity

### 5.1 On-Demand Medical History Aggregation
* **Assumption**: `Medical History` is **not** stored as a separate table or collection in the database.
* **Rationale**: Storing medical history as a static table creates severe data synchronization risks (e.g., updating a diagnosis or prescription would require updating duplicate history records). Instead, medical history is dynamically aggregated on-demand via database joins/MongoDB aggregation pipelines filtering by `patient_id`.

### 5.2 Review Authenticity Enforcement
* **Assumption**: A `Review` must be linked directly to a specific `Appointment` (`1 : 0..1`), not just generally to a doctor.
* **Validation Constraint**: A patient can only submit a review for an appointment that has status = `Completed` and does not already have an associated review. This prevents fake reviews, spamming, or duplicate reviews for a single visit.

---

## 6. Multi-Database Paradigm (Relational & NoSQL Rules)

| Architectural Domain | Relational (SQL) Rule | MongoDB (NoSQL) Rule |
|---|---|---|
| **Referential Integrity** | Enforced via strict Foreign Key constraints (`FK`, `ON DELETE RESTRICT`) | Enforced at Application Layer (Mongoose middleware / Service validation) |
| **Prescription Items** | Normalization via `Prescribed_Medication` join table | Embedded Array (`prescription.medications: [...]`) with auto-generated subdocument `_id` |
| **Diagnoses Link** | Junction table `Prescription_Diagnosis` | Array of ObjectIds (`prescription.diagnosis_ids: [...]`) |
| **Concurrency Control** | Transactional locks & isolation levels (`SERIALIZABLE` / `READ COMMITTED`) | Document atomicity & compound unique indexing |
