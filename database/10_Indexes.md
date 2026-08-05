# Performance Optimization & Indexing Strategy

This document specifies the complete indexing strategy for both Relational SQL databases (PostgreSQL B-Tree indexes) and NoSQL Document databases (MongoDB indexes).

---

## 1. Indexing Design Principles

Indexes are deployed selectively to optimize high-frequency read queries, enforce unique constraints, and accelerate background worker polling while minimizing write latency overhead.

* **Unique Indexes**: Enforce business invariants at the database engine level (e.g. 1:1 payment links, single review per visit, unique emails).
* **Compound Indexes**: Optimized for multi-field queries (e.g., searching availability by doctor, date, and status). Field order follows the Equality $\rightarrow$ Sort $\rightarrow$ Range rule.
* **Partial Indexes**: Index only active/relevant records (e.g., indexing active appointments while omitting cancelled ones), reducing index size by up to 70%.
* **TTL (Time-To-Live) Indexes**: Automatically purge stale logs and historical notifications.

---

## 2. MongoDB Indexing Specifications

### Summary Table

| Collection | Index Field(s) | Index Type | Purpose / Query Pattern |
|---|---|---|---|
| `users` | `{ email: 1 }` | Unique | Fast authentication lookup by email |
| `appointments` | `{ doctorId: 1, appointmentDate: 1, appointmentTime: 1 }` | Compound, Partial | Rapid double-booking validation excluding `Cancelled` |
| `appointments` | `{ patientId: 1, appointmentDate: -1 }` | Compound | Patient appointment history view sorted by date |
| `payments` | `{ appointmentId: 1 }` | Unique | Enforce 1:1 appointment-payment relationship |
| `payments` | `{ transactionRef: 1 }` | Unique, Sparse | Fast payment status webhook lookup |
| `doctorClinicAssignments` | `{ doctorId: 1, clinicId: 1 }` | Unique | Prevent duplicate doctor-clinic mappings |
| `weeklyAvailabilities` | `{ doctorId: 1, clinicId: 1, dayOfWeek: 1 }` | Compound | Fast slot computation template lookup |
| `scheduleExceptions` | `{ doctorId: 1, startDate: 1, endDate: 1 }` | Compound | Fast exception checking during slot lookup |
| `reviews` | `{ appointmentId: 1 }` | Unique | Enforce single review per completed visit |
| `reviews` | `{ doctorId: 1, submittedDate: -1 }` | Compound | Doctor profile reviews listing |
| `notifications` | `{ recipientId: 1, readStatus: 1, sentAt: -1 }` | Compound | Fast unread inbox alerts rendering |
| `medicationReminders` | `{ scheduledTime: 1, completionStatus: 1 }` | Compound | Background worker cron polling for due alerts |
| `medicationReminders` | `{ scheduledTime: 1 }` | TTL (`expireAfterSeconds: 2592000`) | Auto-delete reminders after 30 days |

### MongoDB Index Creation Commands (`mongosh`)

```javascript
// 1. Users Collection
db.users.createIndex(
  { email: 1 },
  { name: "idx_users_email_unique", unique: true }
);

// 2. Appointments Collection (Partial Index for Slot Conflicts)
db.appointments.createIndex(
  { doctorId: 1, appointmentDate: 1, appointmentTime: 1 },
  { 
    name: "idx_appointments_doctor_slot_active",
    partialFilterExpression: { status: { $ne: "Cancelled" } }
  }
);

db.appointments.createIndex(
  { patientId: 1, appointmentDate: -1 },
  { name: "idx_appointments_patient_history" }
);

// 3. Payments Collection
db.payments.createIndex(
  { appointmentId: 1 },
  { name: "idx_payments_appointment_unique", unique: true }
);

db.payments.createIndex(
  { transactionRef: 1 },
  { name: "idx_payments_tx_ref_unique", unique: true, sparse: true }
);

// 4. Doctor-Clinic Assignments Collection
db.doctorClinicAssignments.createIndex(
  { doctorId: 1, clinicId: 1 },
  { name: "idx_doctor_clinic_unique", unique: true }
);

// 5. Weekly Availabilities Collection
db.weeklyAvailabilities.createIndex(
  { doctorId: 1, clinicId: 1, dayOfWeek: 1 },
  { name: "idx_availabilities_lookup" }
);

// 6. Schedule Exceptions Collection
db.scheduleExceptions.createIndex(
  { doctorId: 1, startDate: 1, endDate: 1 },
  { name: "idx_exceptions_range" }
);

// 7. Reviews Collection
db.reviews.createIndex(
  { appointmentId: 1 },
  { name: "idx_reviews_appointment_unique", unique: true }
);

db.reviews.createIndex(
  { doctorId: 1, submittedDate: -1 },
  { name: "idx_reviews_doctor_list" }
);

// 8. Notifications Collection
db.notifications.createIndex(
  { recipientId: 1, readStatus: 1, sentAt: -1 },
  { name: "idx_notifications_inbox" }
);

// 9. Medication Reminders Collection (Worker & TTL Index)
db.medicationReminders.createIndex(
  { scheduledTime: 1, completionStatus: 1 },
  { name: "idx_reminders_worker_poll" }
);

db.medicationReminders.createIndex(
  { scheduledTime: 1 },
  { 
    name: "idx_reminders_ttl_30d",
    expireAfterSeconds: 2592000 // 30 days auto-purge
  }
);
```

---

## 3. Relational SQL Indexing Specifications (PostgreSQL)

```sql
-- 1. Authentication
CREATE UNIQUE INDEX idx_sql_users_email ON users(LOWER(email));

-- 2. Anti-Overlapping Appointment Conflict Index (Partial B-Tree Index)
CREATE INDEX idx_sql_appointments_conflict 
ON appointments(doctor_id, appointment_date, appointment_time) 
WHERE status IN ('Pending', 'Confirmed', 'Completed');

-- 3. Patient Appointment Lookup
CREATE INDEX idx_sql_appointments_patient 
ON appointments(patient_id, appointment_date DESC);

-- 4. Payment Uniqueness
CREATE UNIQUE INDEX idx_sql_payments_appointment ON payments(appointment_id);
CREATE UNIQUE INDEX idx_sql_payments_tx_ref ON payments(transaction_ref) WHERE transaction_ref IS NOT NULL;

-- 5. Doctor-Clinic Unique Pairing
CREATE UNIQUE INDEX idx_sql_doctor_clinic ON doctor_clinic_assignments(doctor_id, clinic_id);

-- 6. Schedule & Availability Lookups
CREATE INDEX idx_sql_weekly_avail ON weekly_availabilities(doctor_id, clinic_id, day_of_week);
CREATE INDEX idx_sql_schedule_exceptions ON schedule_exceptions(doctor_id, start_date, end_date);

-- 7. Reviews & Ratings Lookups
CREATE UNIQUE INDEX idx_sql_reviews_appointment ON reviews(appointment_id);
CREATE INDEX idx_sql_reviews_doctor ON reviews(doctor_id, submitted_date DESC);

-- 8. Notifications Inbox
CREATE INDEX idx_sql_notifications_inbox ON notifications(recipient_id, read_status, sent_at DESC);

-- 9. Reminders Worker Index
CREATE INDEX idx_sql_reminders_worker ON medication_reminders(scheduled_time, completion_status);
```
