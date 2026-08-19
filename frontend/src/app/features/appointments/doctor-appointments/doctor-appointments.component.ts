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
        label: 'تأكيد الحجز',
        color: 'bg-primary text-on-primary',
      },
      {
        value: 'Cancelled',
        label: 'إلغاء',
        color: 'border border-error text-error',
      },
    ],
    Confirmed: [
      {
        value: 'Completed',
        label: 'إتمام الكشف',
        color: 'bg-tertiary text-on-tertiary',
      },
      {
        value: 'No-Show',
        label: 'لم يحضر',
        color: 'border border-outline-variant text-on-surface-variant',
      },
      {
        value: 'Cancelled',
        label: 'إلغاء',
        color: 'border border-error text-error',
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
        this.successMessage = `تم تحديث حالة الموعد إلى "${STATUS_LABELS[newStatus]}" بنجاح`;
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
    return typeof a.patientId === 'object' && a.patientId ? a.patientId.fullName : 'المريض';
  }

  getPatientInfo(a: Appointment): string {
    if (typeof a.patientId !== 'object' || !a.patientId) return '';
    const parts = [];
    if (a.patientId.age) parts.push(`${a.patientId.age} سنة`);
    if (a.patientId.gender) {
      parts.push(a.patientId.gender.toLowerCase() === 'male' ? 'ذكر' : 'أنثى');
    }
    if (a.patientId.phoneNumber) {
      parts.push(a.patientId.phoneNumber);
    }
    return parts.join(' · ');
  }

  getActions(a: Appointment) {
    return this.statusActions[a.status] || [];
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('ar-EG', {
      weekday: 'short',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  formatTime(time: string): string {
    if (!time) return '';
    const [h, m] = time.split(':').map(Number);
    const period = h < 12 ? 'ص' : 'م';
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${h12}:${String(m).padStart(2, '0')} ${period}`;
  }
}

