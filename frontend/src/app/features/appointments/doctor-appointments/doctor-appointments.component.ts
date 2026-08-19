import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AppointmentService } from '../services/appointment.service';
import {
  Appointment,
  AppointmentStatus,
  STATUS_COLORS,
  STATUS_TRANSITIONS,
} from '../models/appointment.model';
import { LanguageService } from 'src/app/core/services/language.servics';

// Maps each status to its translation key suffix under APPOINTMENTS.STATUS
const STATUS_KEY: Record<AppointmentStatus, string> = {
  Pending: 'PENDING',
  Confirmed: 'CONFIRMED',
  Completed: 'COMPLETED',
  Cancelled: 'CANCELLED',
  'No-Show': 'NO_SHOW',
};

@Component({
  selector: 'app-doctor-appointments',
  templateUrl: './doctor-appointments.component.html',
  styleUrls: ['./doctor-appointments.component.css'],
})
export class DoctorAppointmentsComponent implements OnInit {
  activeTab: AppointmentStatus | 'all' = 'all';
  appointments: Appointment[] = [];
  todayAppointments: Appointment[] = [];
  selectedDate = '';

  // Summary Stats
  todayCount = 0;
  upcomingCount = 0;
  totalPatientsCount = 0;

  isLoading = false;
  errorMessage = '';
  successMessage = '';
  updatingId: string | null = null;

  pagination = { total: 0, page: 1, pages: 1 };

  STATUS_COLORS = STATUS_COLORS;
  STATUS_TRANSITIONS = STATUS_TRANSITIONS;

  get isRtl(): boolean {
    return this.languageService.isRtl();
  }

  get tabs(): { value: AppointmentStatus | 'all'; label: string }[] {
    return [
      { value: 'all', label: this.t('APPOINTMENTS.STATUS.ALL') },
      { value: 'Pending', label: this.statusLabel('Pending') },
      { value: 'Confirmed', label: this.statusLabel('Confirmed') },
      { value: 'Completed', label: this.statusLabel('Completed') },
      { value: 'Cancelled', label: this.statusLabel('Cancelled') },
      { value: 'No-Show', label: this.statusLabel('No-Show') },
    ];
  }

  // Next status options per current state
  get statusActions(): Partial<
    Record<
      AppointmentStatus,
      { value: AppointmentStatus; label: string; color: string }[]
    >
  > {
    return {
      Pending: [
        {
          value: 'Confirmed',
          label: this.t('APPOINTMENTS.DOCTOR_VIEW.ACTION_CONFIRM'),
          color: 'bg-primary text-on-primary',
        },
        {
          value: 'Cancelled',
          label: this.t('APPOINTMENTS.DOCTOR_VIEW.ACTION_CANCEL'),
          color: 'border-2 border-error text-error',
        },
      ],
      Confirmed: [
        {
          value: 'Completed',
          label: this.t('APPOINTMENTS.DOCTOR_VIEW.ACTION_COMPLETE'),
          color: 'bg-tertiary text-on-tertiary',
        },
        {
          value: 'No-Show',
          label: this.t('APPOINTMENTS.DOCTOR_VIEW.ACTION_NO_SHOW'),
          color: 'border-2 border-outline-variant text-on-surface-variant',
        },
        {
          value: 'Cancelled',
          label: this.t('APPOINTMENTS.DOCTOR_VIEW.ACTION_CANCEL'),
          color: 'border-2 border-error text-error',
        },
      ],
    };
  }

  constructor(
    private appointmentService: AppointmentService,
    private translate: TranslateService,
    private languageService: LanguageService,
  ) {}

  private t(key: string, params?: any): string {
    return this.translate.instant(key, params);
  }

  statusLabel(status: AppointmentStatus): string {
    return this.t('APPOINTMENTS.STATUS.' + STATUS_KEY[status]);
  }

  consultationTypeLabel(type: string): string {
    return type === 'Online'
      ? this.t('APPOINTMENTS.DOCTOR_VIEW.ONLINE')
      : this.t('APPOINTMENTS.DOCTOR_VIEW.IN_CLINIC');
  }

  ngOnInit(): void {
    this.loadAppointments();
  }

  setTab(tab: AppointmentStatus | 'all'): void {
    this.activeTab = tab;
    this.pagination.page = 1;
    this.loadAppointments();
  }

  loadAppointments(page = 1): void {
    this.isLoading = true;
    this.errorMessage = '';

    const status = this.activeTab === 'all' ? undefined : this.activeTab;
    this.appointmentService
      .getDoctorAppointments(status, this.selectedDate || undefined, page)
      .subscribe({
        next: (res) => {
          this.appointments = res.data || [];
          this.pagination = res.pagination || { total: this.appointments.length, page: 1, pages: 1 };

          this.calculateStats();
          this.isLoading = false;
        },
        error: (err) => {
          this.errorMessage = err.message || 'حدث خطأ أثناء تحميل جدول المواعيد';
          this.isLoading = false;
        },
      });
  }

  private calculateStats(): void {
    const todayStr = new Date().toISOString().split('T')[0];

    // Filter appointments for today
    this.todayAppointments = this.appointments.filter(a => {
      const aDate = new Date(a.appointmentDate).toISOString().split('T')[0];
      return aDate === todayStr;
    });

    this.todayCount = this.todayAppointments.length;
    this.upcomingCount = this.appointments.filter(a => a.status === 'Confirmed' || a.status === 'Pending').length;

    // Unique patients count
    const patientIds = new Set();
    this.appointments.forEach(a => {
      if (typeof a.patientId === 'object' && a.patientId?._id) {
        patientIds.add(a.patientId._id);
      }
    });
    this.totalPatientsCount = patientIds.size || this.appointments.length;
  }

  updateStatus(apptId: string, newStatus: AppointmentStatus): void {
    this.updatingId = apptId;
    this.errorMessage = '';
    this.successMessage = '';

    this.appointmentService.updateStatus(apptId, newStatus).subscribe({
      next: (updated) => {
        const idx = this.appointments.findIndex((a) => a._id === apptId);
        if (idx !== -1) {
          this.appointments[idx] = {
            ...this.appointments[idx],
            status: updated.status,
          };
        }
        this.calculateStats();
        this.successMessage = this.t('APPOINTMENTS.DOCTOR_VIEW.STATUS_UPDATED', {
          status: this.statusLabel(newStatus),
        });
        this.updatingId = null;
        setTimeout(() => (this.successMessage = ''), 3000);
      },
      error: (err) => {
        this.errorMessage = err.message || 'حدث خطأ أثناء تحديث الحالة';
        this.updatingId = null;
      },
    });
  }

  getPatientName(a: Appointment): string {
    return typeof a.patientId === 'object' && a.patientId
      ? a.patientId.fullName
      : this.t('APPOINTMENTS.DOCTOR_VIEW.PATIENT_DEFAULT');
  }

  getPatientInfo(a: Appointment): string {
    if (typeof a.patientId !== 'object' || !a.patientId) return '';
    const parts = [];
    if (a.patientId.phoneNumber) {
      parts.push(a.patientId.phoneNumber);
    }
    if (a.patientId.age) parts.push(`${a.patientId.age} ${this.t('APPOINTMENTS.DOCTOR_VIEW.AGE_SUFFIX')}`);
    if (a.patientId.gender)
      parts.push(
        a.patientId.gender === 'Male'
          ? this.t('APPOINTMENTS.DOCTOR_VIEW.GENDER_MALE')
          : this.t('APPOINTMENTS.DOCTOR_VIEW.GENDER_FEMALE'),
      );
    return parts.join(' · ');
  }

  getActions(a: Appointment) {
    return this.statusActions[a.status] || [];
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString(this.isRtl ? 'ar-EG' : 'en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  formatTime(time: string): string {
    if (!time) return '';
    const [h, m] = time.split(':').map(Number);
    const period = this.isRtl ? (h < 12 ? 'ص' : 'م') : (h < 12 ? 'AM' : 'PM');
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${h12}:${String(m).padStart(2, '0')} ${period}`;
  }

  confirmPayment(apptId: string): void {
    this.updatingId = apptId;
    this.errorMessage = '';
    this.successMessage = '';

    this.appointmentService.confirmPayment(apptId).subscribe({
      next: (res: any) => {
        const idx = this.appointments.findIndex((a) => a._id === apptId);
        if (idx !== -1) {
          this.appointments[idx] = {
            ...this.appointments[idx],
            ...(res.data || res.appointment || {}),
            paymentStatus: 'Paid',
            status: res.data?.status || res.appointment?.status || 'Confirmed',
          };
        }
        this.calculateStats();
        this.successMessage = res.message || 'تم تأكيد الدفع والموعد بنجاح';
        this.updatingId = null;
        setTimeout(() => (this.successMessage = ''), 3000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || err.message || 'حدث خطأ أثناء تأكيد الدفع';
        this.updatingId = null;
      },
    });
  }
}
