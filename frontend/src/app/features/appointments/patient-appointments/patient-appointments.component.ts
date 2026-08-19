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
  activeTab: AppointmentStatus | 'all' = 'all';
  appointments: Appointment[] = [];

  isLoading = false;
  errorMessage = '';
  cancellingId: string | null = null;

  pagination = { total: 0, page: 1, pages: 1 };

  STATUS_COLORS = STATUS_COLORS;

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

  constructor(
    private appointmentService: AppointmentService,
    private router: Router,
    private translate: TranslateService,
    private languageService: LanguageService,
  ) {}

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

  setTab(tab: AppointmentStatus | 'all'): void {
    this.activeTab = tab;
    this.pagination.page = 1;
    this.loadAppointments();
  }

  loadAppointments(page = 1): void {
    this.isLoading = true;
    this.errorMessage = '';

    const status = this.activeTab === 'all' ? undefined : this.activeTab;
    this.appointmentService.getPatientAppointments(status, page).subscribe({
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
        this.errorMessage = err.message;
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
    return typeof a.doctorId === 'object'
      ? a.doctorId.fullName
      : this.t('APPOINTMENTS.PATIENT_VIEW.DOCTOR_DEFAULT');
  }

  getDoctorSpecialization(a: Appointment): string {
    return typeof a.doctorId === 'object' ? a.doctorId.specialization : '';
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString(this.isRtl ? 'ar-EG' : 'en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  formatTime(time: string): string {
    const [h, m] = time.split(':').map(Number);
    const period = this.isRtl ? (h < 12 ? 'ص' : 'م') : (h < 12 ? 'AM' : 'PM');
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${h12}:${String(m).padStart(2, '0')} ${period}`;
  }

  goToReview(appointmentId: string): void {
    this.router.navigate(['/appointments/review', appointmentId]);
  }

  isUpcoming(a: Appointment): boolean {
    return (
      new Date(a.appointmentDate) >= new Date() && a.status !== 'Cancelled'
    );
  }
}
