# Complete System Data Dictionary

This document serves as the authoritative Data Dictionary for the Doctor Appointment Management System, listing every database table, attribute, data type, key constraint, default value, and descriptive specification.

---

## Table 1: `users`
*Description*: Central authentication table storing login credentials and role assignments.

| Column Name | Data Type | PK | FK | Nullable | Default Value | Constraints | Description |
|---|---|---|---|---|---|---|---|
| `user_id` | UUID | Yes | No | No | `uuid_generate_v4()` | PRIMARY KEY | Unique global user identity key |
| `email` | VARCHAR(255) | No | No | No | None | UNIQUE, Lowercase | User authentication login email |
| `password_hash` | VARCHAR(255) | No | No | No | None | Hashed string | Encrypted credential hash (bcrypt/Argon2) |
| `role` | VARCHAR(20) | No | No | No | None | `IN ('patient', 'doctor', 'admin')` | System access role |
| `created_at` | TIMESTAMP | No | No | No | `CURRENT_TIMESTAMP` | None | User account creation timestamp |
| `updated_at` | TIMESTAMP | No | No | No | `CURRENT_TIMESTAMP` | None | Account last updated timestamp |

---

## Table 2: `patients`
*Description*: Profile attributes for users with role `'patient'`.

| Column Name | Data Type | PK | FK | Nullable | Default Value | Constraints | Description |
|---|---|---|---|---|---|---|---|
| `patient_id` | UUID | Yes | No | No | `uuid_generate_v4()` | PRIMARY KEY | Unique patient profile ID |
| `user_id` | UUID | No | Yes | No | None | FK -> `users(user_id)`, UNIQUE | Reference to parent user identity |
| `full_name` | VARCHAR(150) | No | No | No | None | None | Legal full name of patient |
| `address` | TEXT | No | No | Yes | None | None | Residential street address |
| `age` | INT | No | No | Yes | None | `CHECK (age BETWEEN 0 AND 120)` | Patient age in years |
| `gender` | VARCHAR(20) | No | No | Yes | None | `IN ('Male', 'Female', 'Other', ...)` | Self-reported gender identity |
| `phone` | VARCHAR(30) | No | No | No | None | None | Contact telephone number |
| `occupation` | VARCHAR(100) | No | No | Yes | None | None | Employment title / occupation |
| `company_name` | VARCHAR(150) | No | No | Yes | None | None | Employer / company organization |

---

## Table 3: `doctors`
*Description*: Professional credentials and clinical statistics for doctors.

| Column Name | Data Type | PK | FK | Nullable | Default Value | Constraints | Description |
|---|---|---|---|---|---|---|---|
| `doctor_id` | UUID | Yes | No | No | `uuid_generate_v4()` | PRIMARY KEY | Unique doctor profile ID |
| `user_id` | UUID | No | Yes | No | None | FK -> `users(user_id)`, UNIQUE | Reference to parent user identity |
| `full_name` | VARCHAR(150) | No | No | No | None | None | Doctor's professional title & name |
| `specialization` | VARCHAR(100) | No | No | No | None | None | Medical domain (e.g., Dermatology) |
| `education` | TEXT | No | No | Yes | None | None | Medical school & academic degrees |
| `qualifications` | TEXT | No | No | Yes | None | None | Board certifications & licenses |
| `years_experience` | INT | No | No | Yes | None | `CHECK (years_experience >= 0)` | Years in active practice |
| `bio` | TEXT | No | No | Yes | None | None | Professional biography |
| `rating` | DECIMAL(3,2) | No | No | No | `0.00` | `CHECK (rating BETWEEN 0 AND 5)` | Aggregate average rating score |

---

## Table 4: `clinics`
*Description*: Healthcare clinic facility locations and contact details.

| Column Name | Data Type | PK | FK | Nullable | Default Value | Constraints | Description |
|---|---|---|---|---|---|---|---|
| `clinic_id` | UUID | Yes | No | No | `uuid_generate_v4()` | PRIMARY KEY | Unique clinic facility ID |
| `name` | VARCHAR(150) | No | No | No | None | None | Official clinic name |
| `address` | TEXT | No | No | No | None | None | Physical location street address |
| `city` | VARCHAR(100) | No | No | No | None | None | City name |
| `contact_info` | VARCHAR(100) | No | No | No | None | None | Main contact phone / email |
| `working_hours` | VARCHAR(255) | No | No | Yes | None | None | Summary operating hours string |

---

## Table 5: `doctor_clinic_assignments`
*Description*: Doctor-Clinic mapping carrying clinic-specific consultation rates.

| Column Name | Data Type | PK | FK | Nullable | Default Value | Constraints | Description |
|---|---|---|---|---|---|---|---|
| `assignment_id` | UUID | Yes | No | No | `uuid_generate_v4()` | PRIMARY KEY | Unique assignment record ID |
| `doctor_id` | UUID | No | Yes | No | None | FK -> `doctors(doctor_id)` | Reference to assigned doctor |
| `clinic_id` | UUID | No | Yes | No | None | FK -> `clinics(clinic_id)` | Reference to assigned clinic |
| `consultation_fee` | DECIMAL(10,2) | No | No | No | None | `CHECK (consultation_fee >= 0)` | Rate charged at this clinic |
| `is_active` | BOOLEAN | No | No | No | `TRUE` | None | Active assignment flag |

---

## Table 6: `weekly_availabilities`
*Description*: Recurring weekly operating schedule templates per doctor and clinic.

| Column Name | Data Type | PK | FK | Nullable | Default Value | Constraints | Description |
|---|---|---|---|---|---|---|---|
| `availability_id` | UUID | Yes | No | No | `uuid_generate_v4()` | PRIMARY KEY | Unique schedule template ID |
| `doctor_id` | UUID | No | Yes | No | None | FK -> `doctors(doctor_id)` | Reference to doctor |
| `clinic_id` | UUID | No | Yes | No | None | FK -> `clinics(clinic_id)` | Reference to clinic |
| `day_of_week` | VARCHAR(15) | No | No | No | None | `IN ('Monday', ..., 'Sunday')` | Day of week |
| `start_time` | TIME | No | No | No | None | None | Daily window start time |
| `end_time` | TIME | No | No | No | None | `CHECK (end_time > start_time)` | Daily window end time |
| `slot_duration_minutes` | INT | No | No | No | `30` | `CHECK (slot_duration BETWEEN 10 AND 120)` | Minute length per appointment slot |

---

## Table 7: `schedule_exceptions`
*Description*: Non-recurring leave, vacations, and emergency shifts.

| Column Name | Data Type | PK | FK | Nullable | Default Value | Constraints | Description |
|---|---|---|---|---|---|---|---|
| `exception_id` | UUID | Yes | No | No | `uuid_generate_v4()` | PRIMARY KEY | Unique exception ID |
| `doctor_id` | UUID | No | Yes | No | None | FK -> `doctors(doctor_id)` | Reference to doctor |
| `start_date` | DATE | No | No | No | None | None | Exception window start date |
| `end_date` | DATE | No | No | No | None | `CHECK (end_date >= start_date)` | Exception window end date |
| `type` | VARCHAR(30) | No | No | No | None | `IN ('VACATION', 'BLOCKED', ...)` | Exception type category |

---

## Table 8: `appointments`
*Description*: Booking consultations between patients and doctors at clinics.

| Column Name | Data Type | PK | FK | Nullable | Default Value | Constraints | Description |
|---|---|---|---|---|---|---|---|
| `appointment_id` | UUID | Yes | No | No | `uuid_generate_v4()` | PRIMARY KEY | Unique appointment ID |
| `patient_id` | UUID | No | Yes | No | None | FK -> `patients(patient_id)` | Reference to patient |
| `doctor_id` | UUID | No | Yes | No | None | FK -> `doctors(doctor_id)` | Reference to doctor |
| `clinic_id` | UUID | No | Yes | No | None | FK -> `clinics(clinic_id)` | Reference to clinic location |
| `booking_date` | TIMESTAMP | No | No | No | `CURRENT_TIMESTAMP` | None | Timestamp when booking was made |
| `appointment_date` | DATE | No | No | No | None | None | Calendar date of visit |
| `appointment_time` | TIME | No | No | No | None | None | Start time of visit |
| `consultation_type` | VARCHAR(20) | No | No | No | None | `IN ('in-clinic', 'online')` | Consultation medium |
| `reason` | TEXT | No | No | Yes | None | None | Patient symptom/reason text |
| `duration_minutes` | INT | No | No | No | `30` | None | Visit duration in minutes |
| `status` | VARCHAR(20) | No | No | No | None | `IN ('Pending', 'Confirmed', ...)` | Lifecycle status |
| `consultation_fee_snapshot` | DECIMAL(10,2) | No | No | No | None | `CHECK (snapshot >= 0)` | Price frozen at booking |

---

## Table 9: `payments`
*Description*: Payment gateway logs and transaction audit data.

| Column Name | Data Type | PK | FK | Nullable | Default Value | Constraints | Description |
|---|---|---|---|---|---|---|---|
| `payment_id` | UUID | Yes | No | No | `uuid_generate_v4()` | PRIMARY KEY | Unique payment ID |
| `appointment_id` | UUID | No | Yes | No | None | FK -> `appointments`, UNIQUE | 1:1 Reference to appointment |
| `amount` | DECIMAL(10,2) | No | No | No | None | `CHECK (amount >= 0)` | Charged amount |
| `method` | VARCHAR(30) | No | No | No | None | `IN ('Credit Card', 'Cash', ...)` | Payment method |
| `payment_date` | TIMESTAMP | No | No | No | `CURRENT_TIMESTAMP` | None | Timestamp of charge |
| `status` | VARCHAR(20) | No | No | No | None | `IN ('Pending', 'Completed', ...)` | Payment status |
| `transaction_ref` | VARCHAR(100) | No | No | Yes | None | UNIQUE | Gateway transaction ID |
| `attempt_count` | INT | No | No | No | `1` | `CHECK (attempt_count >= 1)` | Retry counter |

---

## Table 10: `prescriptions`
*Description*: Post-consultation medical prescriptions.

| Column Name | Data Type | PK | FK | Nullable | Default Value | Constraints | Description |
|---|---|---|---|---|---|---|---|
| `prescription_id` | UUID | Yes | No | No | `uuid_generate_v4()` | PRIMARY KEY | Unique prescription ID |
| `appointment_id` | UUID | No | Yes | No | None | FK -> `appointments`, UNIQUE | Reference to completed visit |
| `issued_date` | DATE | No | No | No | `CURRENT_DATE` | None | Date prescription issued |

---

## Table 11: `diagnoses`
*Description*: Catalog of clinical diagnoses and ICD coding standards.

| Column Name | Data Type | PK | FK | Nullable | Default Value | Constraints | Description |
|---|---|---|---|---|---|---|---|
| `diagnosis_id` | UUID | Yes | No | No | `uuid_generate_v4()` | PRIMARY KEY | Unique diagnosis catalog ID |
| `name` | VARCHAR(150) | No | No | No | None | None | Disease / condition name |
| `icd_code` | VARCHAR(20) | No | No | No | None | UNIQUE | ICD-10 / ICD-11 coding string |
| `description` | TEXT | No | No | Yes | None | None | Clinical description |

---

## Table 12: `medications`
*Description*: Catalog of pharmacological drugs and types.

| Column Name | Data Type | PK | FK | Nullable | Default Value | Constraints | Description |
|---|---|---|---|---|---|---|---|
| `medication_id` | UUID | Yes | No | No | `uuid_generate_v4()` | PRIMARY KEY | Unique medication catalog ID |
| `name` | VARCHAR(150) | No | No | No | None | None | Brand / commercial name |
| `generic_name` | VARCHAR(150) | No | No | No | None | None | Generic chemical formulation |
| `type` | VARCHAR(50) | No | No | No | None | None | Form (`Tablet`, `Syrup`, etc.) |

---

## Table 13: `prescribed_medications`
*Description*: Specific dosage and instruction line items per prescription.

| Column Name | Data Type | PK | FK | Nullable | Default Value | Constraints | Description |
|---|---|---|---|---|---|---|---|
| `prescribed_item_id` | UUID | Yes | No | No | `uuid_generate_v4()` | PRIMARY KEY | Unique prescribed item ID |
| `prescription_id` | UUID | No | Yes | No | None | FK -> `prescriptions` | Parent prescription reference |
| `medication_id` | UUID | No | Yes | No | None | FK -> `medications` | Catalog medication reference |
| `dosage` | VARCHAR(50) | No | No | No | None | None | Prescribed dose (e.g. 500mg) |
| `frequency` | VARCHAR(50) | No | No | No | None | None | Schedule (e.g. Every 8 hrs) |
| `duration` | VARCHAR(50) | No | No | No | None | None | Duration (e.g. 7 days) |
| `instructions` | TEXT | No | No | Yes | None | None | Intake instructions |
| `notes` | TEXT | No | No | Yes | None | None | Additional physician notes |

---

## Table 14: `medication_reminders`
*Description*: Automated adherence alerts generated for patients.

| Column Name | Data Type | PK | FK | Nullable | Default Value | Constraints | Description |
|---|---|---|---|---|---|---|---|
| `reminder_id` | UUID | Yes | No | No | `uuid_generate_v4()` | PRIMARY KEY | Unique reminder alert ID |
| `prescribed_item_id` | UUID | No | Yes | No | None | FK -> `prescribed_medications` | Reference to item line |
| `scheduled_time` | TIMESTAMP | No | No | No | None | None | Scheduled notification time |
| `acknowledgment_status` | VARCHAR(20) | No | No | No | `'PENDING'` | `IN ('PENDING', 'ACKNOWLEDGED')` | Alert view status |
| `completion_status` | VARCHAR(20) | No | No | No | `'TAKEN'` | `IN ('TAKEN', 'MISSED', 'SKIPPED')` | Patient intake action |

---

## Table 15: `reviews`
*Description*: Authentic patient ratings and comments for visits.

| Column Name | Data Type | PK | FK | Nullable | Default Value | Constraints | Description |
|---|---|---|---|---|---|---|---|
| `review_id` | UUID | Yes | No | No | `uuid_generate_v4()` | PRIMARY KEY | Unique review record ID |
| `appointment_id` | UUID | No | Yes | No | None | FK -> `appointments`, UNIQUE | 1:1 Link to completed visit |
| `patient_id` | UUID | No | Yes | No | None | FK -> `patients` | Author patient reference |
| `doctor_id` | UUID | No | Yes | No | None | FK -> `doctors` | Target doctor reference |
| `rating` | INT | No | No | No | None | `CHECK (rating BETWEEN 1 AND 5)` | Rating score (1-5) |
| `comment` | TEXT | No | No | Yes | None | None | Review narrative text |
| `submitted_date` | TIMESTAMP | No | No | No | `CURRENT_TIMESTAMP` | None | Submission timestamp |

---

## Table 16: `notifications`
*Description*: Multi-channel user notifications and message box alerts.

| Column Name | Data Type | PK | FK | Nullable | Default Value | Constraints | Description |
|---|---|---|---|---|---|---|---|
| `notification_id` | UUID | Yes | No | No | `uuid_generate_v4()` | PRIMARY KEY | Unique notification ID |
| `recipient_id` | UUID | No | Yes | No | None | FK -> `users(user_id)` | Target user account |
| `message` | TEXT | No | No | No | None | None | Alert content text |
| `trigger_event` | VARCHAR(50) | No | No | No | None | None | Event category code |
| `sent_at` | TIMESTAMP | No | No | No | `CURRENT_TIMESTAMP` | None | Timestamp alert sent |
| `read_status` | VARCHAR(10) | No | No | No | `'UNREAD'` | `IN ('UNREAD', 'READ')` | Read tracking flag |
