export type AppointmentStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Completed'
  | 'Cancelled'
  | 'No-Show';
export type ConsultationType = 'In-Clinic' | 'Online';

export interface Appointment {
  _id: string;
  patientId: PatientRef | string;
  patientName?: string;
  patientPhone?: string;
  doctorId: DoctorRef | string;
  doctorName?: string;
  doctorSpecialization?: string;
  clinicId?: string;
  clinicName?: string;
  appointmentDate: string;
  appointmentTime: string;
  consultationType: ConsultationType;
  reasonForVisit?: string;
  estimatedDurationMinutes?: number;
  durationMinutes?: number;
  status: AppointmentStatus;
  consultationFeeSnapshot?: number;
  paymentStatus?: 'Unpaid' | 'Pending_Confirmation' | 'Paid' | 'Refunded';
  paymentMethod?: 'Instapay' | 'Vodafone_Cash' | 'Cash_At_Clinic' | null;
  paymentDeadline?: string | null;
  paymentConfirmedAt?: string | null;
  paymentConfirmedBy?: any;
  bookingDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PatientRef {
  _id: string;
  fullName: string;
  age?: number;
  gender?: string;
  phoneNumber?: string;
}

export interface DoctorRef {
  _id: string;
  fullName: string;
  specialization: string;
  consultationFee?: number;
}

export interface Review {
  _id: string;
  patientId: PatientRef | string;
  doctorId: string;
  appointmentId: string;
  rating: number;
  comment?: string;
  submittedDate: string;
}

export interface CreateAppointmentDto {
  doctorId: string;
  appointmentDate: string;
  appointmentTime: string;
  consultationType: ConsultationType;
  reasonForVisit?: string;
}

export interface CreateReviewDto {
  appointmentId: string;
  rating: number;
  comment?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
}

// State machine map — matches backend BR-APP-003
export const STATUS_TRANSITIONS: Record<
  AppointmentStatus,
  AppointmentStatus[]
> = {
  Pending: ['Confirmed', 'Cancelled'],
  Confirmed: ['Completed', 'Cancelled', 'No-Show'],
  Completed: [],
  Cancelled: [],
  'No-Show': [],
};

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  Pending: 'في الانتظار',
  Confirmed: 'مؤكد',
  Completed: 'مكتمل',
  Cancelled: 'ملغي',
  'No-Show': 'لم يحضر',
};

export const STATUS_COLORS: Record<AppointmentStatus, string> = {
  Pending: 'bg-amber-100 text-amber-700',
  Confirmed: 'bg-sky-100 text-sky-700',
  Completed: 'bg-emerald-100 text-emerald-700',
  Cancelled: 'bg-red-100 text-red-700',
  'No-Show': 'bg-slate-100 text-slate-700',
};
