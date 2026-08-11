// features/appointments/models/appointment.model.ts
export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  patientId: string;
  patientName: string;
  date: string;
  timeSlot: string;
  consultationType: 'In-Clinic' | 'Online';
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' | 'No-Show';
  reasonForVisit?: string;
  hasReview?: boolean;
}

export interface TimeSlot {
  time: string;
  isAvailable: boolean;
}
