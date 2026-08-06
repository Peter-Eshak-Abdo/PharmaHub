# Entity Relationships & Diagram

This document describes all relationships, cardinalities, and data mapping rules in the Doctor Appointment Management System.

---

## 1. Entity-Relationship Diagram (Simplified)

```mermaid
erDiagram
  USER ||--o| PATIENT : "has profile"
  USER ||--o| DOCTOR : "has profile"
  DOCTOR ||--o{ WEEKLY_AVAILABILITY : defines
  DOCTOR ||--o{ SCHEDULE_EXCEPTION : declares
  PATIENT ||--o{ APPOINTMENT : books
  DOCTOR ||--o{ APPOINTMENT : "is assigned to"
  APPOINTMENT ||--o| PRESCRIPTION : "may yield"
  PRESCRIPTION }o--o{ DIAGNOSIS : identifies
  PRESCRIPTION ||--|{ PRESCRIBED_MEDICATION : contains
  MEDICATION ||--o{ PRESCRIBED_MEDICATION : "used in"
  PATIENT ||--o{ REVIEW : writes
  DOCTOR ||--o{ REVIEW : receives
  APPOINTMENT ||--o| REVIEW : "reviewed via"

  USER {
    ObjectId _id PK
    string email UK
    string password_hash
    string role
  }
  PATIENT {
    ObjectId _id PK
    ObjectId userId FK
    string full_name
    string address
    int age
    string gender
    string phone
    string occupation
    string company_name
  }
  DOCTOR {
    ObjectId _id PK
    ObjectId userId FK
    string full_name
    string specialization
    string education
    string qualifications
    int years_experience
    string bio
    float rating
  }
  WEEKLY_AVAILABILITY {
    ObjectId _id PK
    ObjectId doctorId FK
    string day_of_week
    string start_time
    string end_time
    int slot_duration_minutes
  }
  SCHEDULE_EXCEPTION {
    ObjectId _id PK
    ObjectId doctorId FK
    date start_date
    date end_date
    string type
    string reason
  }
  APPOINTMENT {
    ObjectId _id PK
    ObjectId patientId FK
    ObjectId doctorId FK
    date appointment_date
    string appointment_time
    string consultation_type
    string reason
    int duration_minutes
    string status
    float consultation_fee_snapshot
  }
  PRESCRIPTION {
    ObjectId _id PK
    ObjectId patientId FK
    ObjectId doctorId FK
    ObjectId appointmentId FK
    date issued_date
    string notes
  }
  DIAGNOSIS {
    ObjectId _id PK
    string name UK
    string icd_code UK
    string description
  }
  MEDICATION {
    ObjectId _id PK
    string name UK
    string generic_name
    string type
  }
  PRESCRIBED_MEDICATION {
    ObjectId _id PK
    ObjectId medicationId FK
    string dosage
    string frequency
    string duration
    string instructions
    string notes
  }
  REVIEW {
    ObjectId _id PK
    ObjectId patientId FK
    ObjectId doctorId FK
    ObjectId appointmentId FK
    int rating
    string comment
    date submitted_date
  }
```

---

## 2. Relationship Reference Matrix

| Relationship | Cardinality | FK Location | Foreign Entity | Notes / Constraints |
|---|---|---|---|---|
| User $\rightarrow$ Patient | 1 : 0..1 | `Patient.userId` | `User._id` | Unique FK; present only when `role = 'patient'` |
| User $\rightarrow$ Doctor | 1 : 0..1 | `Doctor.userId` | `User._id` | Unique FK; present only when `role = 'doctor'` |
| Doctor $\rightarrow$ WeeklyAvailability | 1 : 0..N | `WeeklyAvailability.doctorId` | `Doctor._id` | Recurring weekly schedule template per doctor |
| Doctor $\rightarrow$ ScheduleException | 1 : 0..N | `ScheduleException.doctorId` | `Doctor._id` | One-off departures (vacations, blocked shifts) |
| Patient $\rightarrow$ Appointment | 1 : 0..N | `Appointment.patientId` | `Patient._id` | A patient books many visits |
| Doctor $\rightarrow$ Appointment | 1 : 0..N | `Appointment.doctorId` | `Doctor._id` | A doctor sees many patients |
| Appointment $\rightarrow$ Prescription | 1 : 0..1 | `Prescription.appointmentId` | `Appointment._id` | Unique FK; created post-appointment completion |
| Prescription $\rightarrow$ Diagnosis | M : N | `Prescription.diagnosisIds` | `Diagnosis._id` | Array of ObjectIds (references shared catalog entries) |
| Prescription $\rightarrow$ Medication | M : N | Embedded Subdocument | `Medication._id` | `medications` array; dosage/frequency per prescription |
| Patient $\rightarrow$ Review | 1 : 0..N | `Review.patientId` | `Patient._id` | Reviews written by patient |
| Doctor $\rightarrow$ Review | 1 : 0..N | `Review.doctorId` | `Doctor._id` | Reviews received by doctor |
| Appointment $\rightarrow$ Review | 1 : 0..1 | `Review.appointmentId` | `Appointment._id` | Unique FK; enforces 1 review per completed visit |

---

## 3. MongoDB Mapping Guidelines (Referencing vs. Embedding)

1. **Top-Level Collections (10 Collections)**:
   - `users`, `patients`, `doctors`, `weeklyavailabilities`, `scheduleexceptions`, `appointments`, `prescriptions`, `diagnoses`, `medications`, `reviews`.
   - Independent collections allow direct querying, clean schema updates, and efficient indexing.

2. **Embedded Subdocument Pattern**:
   - `prescribedMedication` subdocuments are embedded inside `prescriptions` (`prescription.medications: [{ medicationId, dosage, frequency, duration, instructions, notes }]`).
   - Mongoose auto-assigns `_id` to each subdocument item.

3. **Array of ObjectIds Pattern**:
   - `prescription.diagnosisIds: [ObjectId]` references items in the global `diagnoses` catalog directly without requiring a junction collection.
