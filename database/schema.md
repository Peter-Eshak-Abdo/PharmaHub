# Database Schemas & Data Dictionary

This document defines the exact field specifications, data types, constraints, and index definitions for all 10 entities in the Doctor Appointment Management System.

---

## 1. Table / Collection Data Dictionary

### 1. `users`
*Description*: Central authentication collection storing credentials and role assignments.

| Field Name | Data Type | PK/FK | Nullable | Default | Constraints | Description |
|---|---|---|---|---|---|---|
| `_id` | ObjectId | PK | No | Auto | Primary Key | Unique user identity key |
| `email` | String | — | No | None | UNIQUE, Lowercase | User authentication email |
| `password_hash` | String | — | No | None | Hashed string | Encrypted password hash |
| `role` | String | — | No | None | `enum: ['patient', 'doctor', 'admin']` | System access role |
| `createdAt` | Date | — | No | `Date.now` | None | Account creation timestamp |
| `updatedAt` | Date | — | No | `Date.now` | None | Last update timestamp |

---

### 2. `patients`
*Description*: Profile attributes for users with role `'patient'`.

| Field Name | Data Type | PK/FK | Nullable | Default | Constraints | Description |
|---|---|---|---|---|---|---|
| `_id` | ObjectId | PK | No | Auto | Primary Key | Unique patient profile ID |
| `userId` | ObjectId | FK | No | None | ref: User, UNIQUE | Reference to parent user account |
| `fullName` | String | — | No | None | None | Legal full name |
| `address` | String | — | Yes | None | None | Residential street address |
| `age` | Number | — | Yes | None | `min: 0, max: 120` | Patient age in years |
| `gender` | String | — | Yes | None | `enum: ['Male', 'Female', 'Other']` | Self-reported gender identity |
| `phoneNumber` | String | — | Yes | None | None | Contact telephone number |
| `occupation` | String | — | Yes | None | None | Employment title |
| `companyName` | String | — | Yes | None | None | Employer company organization |
| `createdAt` | Date | — | No | `Date.now` | None | Record creation timestamp |
| `updatedAt` | Date | — | No | `Date.now` | None | Last update timestamp |

---

### 3. `doctors`
*Description*: Professional credentials and clinical statistics for doctors.

| Field Name | Data Type | PK/FK | Nullable | Default | Constraints | Description |
|---|---|---|---|---|---|---|
| `_id` | ObjectId | PK | No | Auto | Primary Key | Unique doctor profile ID |
| `userId` | ObjectId | FK | No | None | ref: User, UNIQUE | Reference to parent user account |
| `fullName` | String | — | No | None | None | Doctor's professional title & name |
| `specialization` | String | — | No | None | None | Medical domain (e.g. Cardiology) |
| `education` | String | — | Yes | None | None | Academic degrees |
| `qualifications` | String | — | Yes | None | None | Board certifications & licenses |
| `yearsOfExperience` | Number | — | Yes | None | `min: 0` | Active practice years |
| `bio` | String | — | Yes | None | None | Professional biography |
| `rating` | Number | — | No | `0` | `min: 0, max: 5` | Aggregate average rating score |
| `createdAt` | Date | — | No | `Date.now` | None | Record creation timestamp |
| `updatedAt` | Date | — | No | `Date.now` | None | Last update timestamp |

---

### 4. `weeklyavailabilities`
*Description*: Recurring weekly operating schedule templates per doctor.

| Field Name | Data Type | PK/FK | Nullable | Default | Constraints | Description |
|---|---|---|---|---|---|---|
| `_id` | ObjectId | PK | No | Auto | Primary Key | Unique schedule template ID |
| `doctorId` | ObjectId | FK | No | None | ref: Doctor | Reference to doctor |
| `dayOfWeek` | String | — | No | None | `enum: ['Monday', 'Tuesday', ..., 'Sunday']` | Day of week |
| `startTime` | String | — | No | None | HH:MM format | Window start time |
| `endTime` | String | — | No | None | HH:MM format | Window end time (`startTime < endTime`) |
| `slotDurationMinutes` | Number | — | No | None | `min: 1` | Slot duration in minutes (e.g., 30, 45, 60) |
| `createdAt` | Date | — | No | `Date.now` | None | Record creation timestamp |
| `updatedAt` | Date | — | No | `Date.now` | None | Last update timestamp |

---

### 5. `scheduleexceptions`
*Description*: Non-recurring leave, vacations, and emergency schedule overrides per doctor.

| Field Name | Data Type | PK/FK | Nullable | Default | Constraints | Description |
|---|---|---|---|---|---|---|
| `_id` | ObjectId | PK | No | Auto | Primary Key | Unique exception ID |
| `doctorId` | ObjectId | FK | No | None | ref: Doctor | Reference to doctor |
| `startDate` | Date | — | No | None | None | Exception start date |
| `endDate` | Date | — | No | None | `startDate <= endDate` | Exception end date |
| `type` | String | — | No | None | `enum: ['Vacation', 'Blocked', 'Emergency']` | Exception type category |
| `reason` | String | — | Yes | None | None | Explanation for exception |
| `createdAt` | Date | — | No | `Date.now` | None | Record creation timestamp |
| `updatedAt` | Date | — | No | `Date.now` | None | Last update timestamp |

---

### 6. `appointments`
*Description*: Booking consultations between patients and doctors.

| Field Name | Data Type | PK/FK | Nullable | Default | Constraints | Description |
|---|---|---|---|---|---|---|
| `_id` | ObjectId | PK | No | Auto | Primary Key | Unique appointment ID |
| `patientId` | ObjectId | FK | No | None | ref: Patient | Reference to patient |
| `doctorId` | ObjectId | FK | No | None | ref: Doctor | Reference to doctor |
| `appointmentDate` | Date | — | No | None | None | Date of consultation |
| `appointmentTime` | String | — | No | None | HH:MM format | Start time |
| `consultationType` | String | — | No | None | `enum: ['In-Clinic', 'Online']` | Consultation medium |
| `reasonForVisit` | String | — | Yes | None | None | Patient reason text |
| `estimatedDurationMinutes` | Number | — | Yes | None | None | Visit duration in minutes |
| `status` | String | — | No | `'Pending'` | `enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled', 'No-Show']` | Lifecycle status |
| `consultationFeeSnapshot` | Number | — | Yes | None | Captured at booking time | Frozen consultation fee |
| `bookingDate` | Date | — | No | `Date.now` | None | Booking timestamp |
| `createdAt` | Date | — | No | `Date.now` | None | Record creation timestamp |
| `updatedAt` | Date | — | No | `Date.now` | None | Last update timestamp |

---

### 7. `prescriptions`
*Description*: Post-consultation medical prescriptions carrying embedded medications.

| Field Name | Data Type | PK/FK | Nullable | Default | Constraints | Description |
|---|---|---|---|---|---|---|
| `_id` | ObjectId | PK | No | Auto | Primary Key | Unique prescription ID |
| `patientId` | ObjectId | FK | No | None | ref: Patient | Reference to patient |
| `doctorId` | ObjectId | FK | No | None | ref: Doctor | Reference to doctor |
| `appointmentId` | ObjectId | FK | No | None | ref: Appointment, UNIQUE | 1:1 reference to completed visit |
| `issuedDate` | Date | — | No | `Date.now` | None | Date prescription issued |
| `diagnosisIds` | Array of ObjectIds | FK | Yes | `[]` | ref: Diagnosis | Linked diagnosis catalog references |
| `medications` | Array of Objects | — | No | `[]` | Subdocuments | Prescribed medication line items |
| `notes` | String | — | Yes | None | None | Doctor notes |
| `createdAt` | Date | — | No | `Date.now` | None | Record creation timestamp |
| `updatedAt` | Date | — | No | `Date.now` | None | Last update timestamp |

*Embedded Subdocument (`prescribedMedication`)*:
- `_id`: Auto-generated ObjectId
- `medicationId`: ObjectId (ref: Medication, required)
- `dosage`: String (required, e.g., "500mg")
- `frequency`: String (required, e.g., "Twice daily")
- `duration`: String (required, e.g., "7 days")
- `instructions`: String
- `notes`: String

---

### 8. `diagnoses`
*Description*: Master reference catalog of medical conditions and ICD codes.

| Field Name | Data Type | PK/FK | Nullable | Default | Constraints | Description |
|---|---|---|---|---|---|---|
| `_id` | ObjectId | PK | No | Auto | Primary Key | Unique diagnosis ID |
| `name` | String | — | No | None | UNIQUE | Disease / condition name |
| `icdCode` | String | — | No | None | UNIQUE | International ICD Code |
| `description` | String | — | Yes | None | None | Diagnostic description |
| `createdAt` | Date | — | No | `Date.now` | None | Record creation timestamp |
| `updatedAt` | Date | — | No | `Date.now` | None | Last update timestamp |

---

### 9. `medications`
*Description*: Master reference catalog of pharmaceutical drugs.

| Field Name | Data Type | PK/FK | Nullable | Default | Constraints | Description |
|---|---|---|---|---|---|---|
| `_id` | ObjectId | PK | No | Auto | Primary Key | Unique medication ID |
| `name` | String | — | No | None | UNIQUE | Commercial brand name |
| `genericName` | String | — | Yes | None | None | Generic active chemical |
| `type` | String | — | No | None | required (e.g., 'Antibiotic', 'Painkiller') | Drug formulation/category |
| `createdAt` | Date | — | No | `Date.now` | None | Record creation timestamp |
| `updatedAt` | Date | — | No | `Date.now` | None | Last update timestamp |

---

### 10. `reviews`
*Description*: Patient feedback ratings and comments for completed appointments.

| Field Name | Data Type | PK/FK | Nullable | Default | Constraints | Description |
|---|---|---|---|---|---|---|
| `_id` | ObjectId | PK | No | Auto | Primary Key | Unique review ID |
| `patientId` | ObjectId | FK | No | None | ref: Patient | Reference to reviewing patient |
| `doctorId` | ObjectId | FK | No | None | ref: Doctor | Reference to reviewed doctor |
| `appointmentId` | ObjectId | FK | No | None | ref: Appointment, UNIQUE | Reference to completed appointment |
| `rating` | Number | — | No | None | `min: 1, max: 5` | Rating score 1 to 5 |
| `comment` | String | — | Yes | None | None | Patient review text |
| `submittedDate` | Date | — | No | `Date.now` | None | Submission timestamp |
| `createdAt` | Date | — | No | `Date.now` | None | Record creation timestamp |
| `updatedAt` | Date | — | No | `Date.now` | None | Last update timestamp |

---

## 2. Essential Indexing Strategy

1. **`users`**:
   - `db.users.createIndex({ email: 1 }, { unique: true })`

2. **`patients`**:
   - `db.patients.createIndex({ userId: 1 }, { unique: true })`

3. **`doctors`**:
   - `db.doctors.createIndex({ userId: 1 }, { unique: true })`
   - `db.doctors.createIndex({ specialization: 1 })`

4. **`weeklyavailabilities`**:
   - `db.weeklyavailabilities.createIndex({ doctorId: 1, dayOfWeek: 1 })`

5. **`scheduleexceptions`**:
   - `db.scheduleexceptions.createIndex({ doctorId: 1, startDate: 1, endDate: 1 })`

6. **`appointments`**:
   - `db.appointments.createIndex({ patientId: 1, appointmentDate: 1 })`
   - `db.appointments.createIndex({ doctorId: 1, appointmentDate: 1, appointmentTime: 1 }, { partialFilterExpression: { status: { $ne: 'Cancelled' } } })`
   - `db.appointments.createIndex({ status: 1, appointmentDate: 1 })`

7. **`prescriptions`**:
   - `db.prescriptions.createIndex({ patientId: 1, issuedDate: -1 })`
   - `db.prescriptions.createIndex({ appointmentId: 1 }, { unique: true })`
   - `db.prescriptions.createIndex({ doctorId: 1, issuedDate: -1 })`

8. **`diagnoses`**:
   - `db.diagnoses.createIndex({ name: 1 }, { unique: true })`
   - `db.diagnoses.createIndex({ icdCode: 1 }, { unique: true })`

9. **`medications`**:
   - `db.medications.createIndex({ name: 1 }, { unique: true })`
   - `db.medications.createIndex({ type: 1 })`

10. **`reviews`**:
    - `db.reviews.createIndex({ appointmentId: 1 }, { unique: true })`
    - `db.reviews.createIndex({ doctorId: 1, submittedDate: -1 })`
    - `db.reviews.createIndex({ patientId: 1 })`
