import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AppointmentService } from '../services/appointment.service';
import {
  Appointment,
  AppointmentStatus,
  STATUS_COLORS,
} from '../models/appointment.model';
import { LanguageService } from 'src/app/core/services/language.servics';

const STATUS_KEY: Record<AppointmentStatus, string> = {
  Pending: 'PENDING',
  Confirmed: 'CONFIRMED',
  Completed: 'COMPLETED',
  Cancelled: 'CANCELLED',
  'No-Show': 'NO_SHOW',
};

@Component({
  selector: 'app-patient-appointments',
  templateUrl: './patient-appointments.component.html',
  styleUrls: ['./patient-appointments.component.css'],
})
export class PatientAppointmentsComponent implements OnInit {
  activeTab: string = 'Upcoming';
  appointments: Appointment[] = [];
  nextAppointment: Appointment | null = null;
  regularAppointments: Appointment[] = [];

  isLoading = false;
  errorMessage = '';
  cancellingId: string | null = null;

  pagination = { total: 0, page: 1, pages: 1 };

  STATUS_COLORS = STATUS_COLORS;

  tabs: { value: string; label: string }[] = [
    { value: 'Upcoming', label: 'المواعيد القادمة' },
    { value: 'Completed', label: 'المكتملة والسابقة' },
    { value: 'Cancelled', label: 'الملغاة' },
    { value: 'all', label: 'جميع المواعيد' },
  ];

  constructor(
    private appointmentService: AppointmentService,
    private router: Router,
    private translate: TranslateService,
    private languageService: LanguageService,
  ) {}

  get isRtl(): boolean {
    return this.languageService.isRtl();
  }

  private t(key: string): string {
    return this.translate.instant(key);
  }

  statusLabel(status: AppointmentStatus): string {
    return this.t('APPOINTMENTS.STATUS.' + STATUS_KEY[status]);
  }

  consultationTypeLabel(type: string): string {
    return type === 'Online'
      ? this.t('APPOINTMENTS.PATIENT_VIEW.ONLINE')
      : this.t('APPOINTMENTS.PATIENT_VIEW.IN_CLINIC');
  }

  ngOnInit(): void {
    this.loadAppointments();
  }

  setTab(tabValue: string): void {
    this.activeTab = tabValue;
    this.pagination.page = 1;
    this.loadAppointments();
  }

  loadAppointments(page = 1): void {
    this.isLoading = true;
    this.errorMessage = '';

    let statusParam: AppointmentStatus | undefined;
    if (this.activeTab === 'Completed') {
      statusParam = 'Completed';
    } else if (this.activeTab === 'Cancelled') {
      statusParam = 'Cancelled';
    } else if (this.activeTab === 'Upcoming') {
      // In upcoming we fetch Confirmed/Pending
      statusParam = undefined;
    }

    this.appointmentService.getPatientAppointments(statusParam, page).subscribe({
      next: (res) => {
        let list = res.data || [];

        if (this.activeTab === 'Upcoming') {
          list = list.filter((a: Appointment) => a.status === 'Confirmed' || a.status === 'Pending');
        }

        this.appointments = list;
        this.pagination = res.pagination || { total: list.length, page: 1, pages: 1 };

        if (this.activeTab === 'Upcoming' && this.appointments.length > 0) {
          this.nextAppointment = this.appointments[0];
          this.regularAppointments = this.appointments.slice(1);
        } else {
          this.nextAppointment = null;
          this.regularAppointments = this.appointments;
        }

        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.message || 'حدث خطأ أثناء تحميل المواعيد';
        this.isLoading = false;
      },
    });
  }

  cancelAppointment(id: string): void {
    if (!confirm(this.t('APPOINTMENTS.PATIENT_VIEW.CANCEL_CONFIRM'))) return;
    this.cancellingId = id;

    this.appointmentService.cancelAppointment(id).subscribe({
      next: () => {
        this.cancellingId = null;
        this.loadAppointments(this.pagination.page);
      },
      error: (err) => {
        this.cancellingId = null;
        this.errorMessage = err.message || 'حدث خطأ أثناء إلغاء الموعد';
      },
    });
  }

  canCancel(a: Appointment): boolean {
    return a.status === 'Pending' || a.status === 'Confirmed';
  }

  canReview(a: Appointment): boolean {
    return a.status === 'Completed';
  }

  getDoctorName(a: Appointment): string {
    return typeof a.doctorId === 'object' && a.doctorId ? a.doctorId.fullName : this.t('APPOINTMENTS.PATIENT_VIEW.DOCTOR_DEFAULT');
  }

  getDoctorSpecialization(a: Appointment): string {
    return typeof a.doctorId === 'object' && a.doctorId ? a.doctorId.specialization : this.t('APPOINTMENTS.PATIENT_VIEW.SPECIALIZATION_DEFAULT');
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('ar-EG', {
      weekday: 'long',
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

  goToReview(appointmentId: string): void {
    this.router.navigate(['/appointments/review', appointmentId]);
  }
}

