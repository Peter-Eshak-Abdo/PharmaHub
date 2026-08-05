# Data Integrity & Schema Validation Rules

This document outlines the multi-layered data validation strategy implemented across database engines (MongoDB JSON Schema, SQL CHECK constraints) and application layer middleware (Mongoose validators & pre-save hooks).

---

## 1. MongoDB `$jsonSchema` Collections Validation

MongoDB `$jsonSchema` validation guarantees document integrity at the database storage engine layer.

```javascript
// 1. Appointments Collection JSON Schema Validation
db.createCollection("appointments", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["patientId", "doctorId", "clinicId", "bookingDate", "appointmentDate", "appointmentTime", "consultationType", "status", "consultationFeeSnapshot"],
      properties: {
        patientId: { bsonType: "objectId", description: "Must be a valid ObjectId referencing patients" },
        doctorId: { bsonType: "objectId", description: "Must be a valid ObjectId referencing doctors" },
        clinicId: { bsonType: "objectId", description: "Must be a valid ObjectId referencing clinics" },
        appointmentDate: { bsonType: "date", description: "Appointment date must be a valid ISODate" },
        appointmentTime: { 
          bsonType: "string", 
          pattern: "^([01]?[0-9]|2[0-3]):[0-5][0-9]$",
          description: "Must be a 24-hour time format string (HH:MM)" 
        },
        consultationType: {
          enum: ["in-clinic", "online"],
          description: "Must be either in-clinic or online"
        },
        status: {
          enum: ["Pending", "Confirmed", "Completed", "Cancelled", "No-Show"],
          description: "Must match allowed status state machine values"
        },
        consultationFeeSnapshot: {
          bsonType: ["double", "decimal", "int"],
          minimum: 0.00,
          description: "Consultation fee snapshot must be a non-negative number"
        }
      }
    }
  }
});

// 2. Reviews Collection JSON Schema Validation
db.createCollection("reviews", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["appointmentId", "patientId", "doctorId", "rating", "submittedDate"],
      properties: {
        appointmentId: { bsonType: "objectId" },
        patientId: { bsonType: "objectId" },
        doctorId: { bsonType: "objectId" },
        rating: {
          bsonType: "int",
          minimum: 1,
          maximum: 5,
          description: "Rating must be an integer between 1 and 5"
        }
      }
    }
  }
});
```

---

## 2. Application Layer Mongoose Validation & Pre-Save Hooks

Mongoose middleware enforces business logic before document writes occur.

```typescript
import mongoose, { Schema, Document } from 'mongoose';

// Interface for Appointment Document
export interface IAppointment extends Document {
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  clinicId: mongoose.Types.ObjectId;
  appointmentDate: Date;
  appointmentTime: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' | 'No-Show';
  consultationFeeSnapshot: number;
}

const AppointmentSchema = new Schema<IAppointment>({
  patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
  clinicId: { type: Schema.Types.ObjectId, ref: 'Clinic', required: true },
  appointmentDate: { type: Date, required: true },
  appointmentTime: { 
    type: String, 
    required: true, 
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format HH:MM'] 
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled', 'No-Show'], 
    default: 'Pending' 
  },
  consultationFeeSnapshot: { type: Number, required: true, min: 0 }
}, { timestamps: true });

// Pre-Save Hook: Prevent Double-Booking
AppointmentSchema.pre<IAppointment>('save', async function (next) {
  if (this.isNew || this.isModified('appointmentDate') || this.isModified('appointmentTime')) {
    const existingConflict = await mongoose.model('Appointment').findOne({
      doctorId: this.doctorId,
      appointmentDate: this.appointmentDate,
      appointmentTime: this.appointmentTime,
      status: { $in: ['Pending', 'Confirmed', 'Completed'] },
      _id: { $ne: this._id }
    });

    if (existingConflict) {
      return next(new Error('DOUBLE_BOOKING_ERROR: Doctor already has an active appointment in this time slot.'));
    }
  }
  next();
});

export const AppointmentModel = mongoose.model<IAppointment>('Appointment', AppointmentSchema);
```

---

## 3. Relational SQL Validation Triggers & Check Constraints

```sql
-- 1. SQL Function: Enforce Single Review per Completed Visit
CREATE OR REPLACE FUNCTION fn_validate_review_submission()
RETURNS TRIGGER AS $$
DECLARE
    v_status VARCHAR(20);
BEGIN
    SELECT status INTO v_status 
    FROM appointments 
    WHERE appointment_id = NEW.appointment_id;

    IF v_status IS NULL THEN
        RAISE EXCEPTION 'INVALID_APPOINTMENT: Referenced appointment does not exist.';
    END IF;

    IF v_status <> 'Completed' THEN
        RAISE EXCEPTION 'INVALID_REVIEW_STATE: Reviews can only be submitted for Completed appointments (current state: %).', v_status;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger Binding
CREATE TRIGGER trg_check_review_submission
BEFORE INSERT ON reviews
FOR EACH ROW
EXECUTE FUNCTION fn_validate_review_submission();
```
