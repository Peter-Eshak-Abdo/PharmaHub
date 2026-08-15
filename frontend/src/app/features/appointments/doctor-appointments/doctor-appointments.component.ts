import { Component, OnInit } from '@angular/core';
import { AppointmentService } from '../services/appointment.service';
import {
  Appointment,
  AppointmentStatus,
  STATUS_LABELS,
  STATUS_COLORS,
  STATUS_TRANSITIONS,
} from '../models/appointment.model';

@Component({
  selector: 'app-doctor-appointments',
  templateUrl: './doctor-appointments.component.html',
  styleUrls: ['./doctor-appointments.component.css'],
})
export class DoctorAppointmentsComponent implements OnInit {
  activeTab: AppointmentStatus | 'all' = 'all';
  appointments: Appointment[] = [];
  selectedDate = '';

  isLoading = false;
  errorMessage = '';
  successMessage = '';
  updatingId: string | null = null;

  pagination = { total: 0, page: 1, pages: 1 };

  STATUS_LABELS = STATUS_LABELS;
  STATUS_COLORS = STATUS_COLORS;
  STATUS_TRANSITIONS = STATUS_TRANSITIONS;

  tabs: { value: AppointmentStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'الكل' },
    { value: 'Pending', label: 'في الانتظار' },
    { value: 'Confirmed', label: 'مؤكد' },
    { value: 'Completed', label: 'مكتمل' },
    { value: 'Cancelled', label: 'ملغي' },
    { value: 'No-Show', label: 'لم يحضر' },
  ];

  // Next status options per current state
  statusActions: Partial<
    Record<
      AppointmentStatus,
      { value: AppointmentStatus; label: string; color: string }[]
    >
  > = {
    Pending: [
      {
        value: 'Confirmed',
        label: 'تأكيد',
        color: 'bg-primary text-on-primary',
      },
      {
        value: 'Cancelled',
        label: 'إلغاء',
        color: 'border-2 border-error text-error',
      },
    ],
    Confirmed: [
      {
        value: 'Completed',
        label: 'اكتمل',
        color: 'bg-tertiary text-on-tertiary',
      },
      {
        value: 'No-Show',
        label: 'لم يحضر',
        color: 'border-2 border-outline-variant text-on-surface-variant',
      },
      {
        value: 'Cancelled',
        label: 'إلغاء',
        color: 'border-2 border-error text-error',
      },
    ],
  };

  constructor(private appointmentService: AppointmentService) {}

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
          this.appointments = res.data;
          this.pagination = res.pagination;
          this.isLoading = false;
        },
        error: (err) => {
          this.errorMessage = err.message;
          this.isLoading = false;
        },
      });
  }

  updateStatus(apptId: string, newStatus: AppointmentStatus): void {
    this.updatingId = apptId;
    this.errorMessage = '';
    this.successMessage = '';

    this.appointmentService.updateStatus(apptId, newStatus).subscribe({
      next: (updated) => {
        const idx = this.appointments.findIndex((a) => a._id === apptId);
        if (idx !== -1)
          this.appointments[idx] = {
            ...this.appointments[idx],
            status: updated.status,
          };
        this.successMessage = `تم تحديث حالة الموعد إلى "${STATUS_LABELS[newStatus]}"`;
        this.updatingId = null;
        setTimeout(() => (this.successMessage = ''), 3000);
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.updatingId = null;
      },
    });
  }

  getPatientName(a: Appointment): string {
    return typeof a.patientId === 'object' ? a.patientId.fullName : 'المريض';
  }

  getPatientInfo(a: Appointment): string {
    if (typeof a.patientId !== 'object') return '';
    const parts = [];
    if (a.patientId.age) parts.push(`${a.patientId.age} سنة`);
    if (a.patientId.gender)
      parts.push(a.patientId.gender === 'Male' ? 'ذكر' : 'أنثى');
    return parts.join(' · ');
  }

  getActions(a: Appointment) {
    return this.statusActions[a.status] || [];
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('ar-EG', {
      weekday: 'short',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  formatTime(time: string): string {
    const [h, m] = time.split(':').map(Number);
    const period = h < 12 ? 'ص' : 'م';
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${h12}:${String(m).padStart(2, '0')} ${period}`;
  }
}
