import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppointmentService } from '../services/appointment.service';
import {
  Appointment,
  AppointmentStatus,
  STATUS_LABELS,
  STATUS_COLORS,
} from '../models/appointment.model';

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

  STATUS_LABELS = STATUS_LABELS;
  STATUS_COLORS = STATUS_COLORS;

  tabs: { value: AppointmentStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'الكل' },
    { value: 'Pending', label: 'في الانتظار' },
    { value: 'Confirmed', label: 'مؤكد' },
    { value: 'Completed', label: 'مكتمل' },
    { value: 'Cancelled', label: 'ملغي' },
    { value: 'No-Show', label: 'لم يحضر' },
  ];

  constructor(
    private appointmentService: AppointmentService,
    private router: Router,
  ) {}

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
    if (!confirm('هل أنت متأكد من إلغاء هذا الموعد؟')) return;
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
    return typeof a.doctorId === 'object' ? a.doctorId.fullName : 'الطبيب';
  }

  getDoctorSpecialization(a: Appointment): string {
    return typeof a.doctorId === 'object' ? a.doctorId.specialization : '';
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

  goToReview(appointmentId: string): void {
    this.router.navigate(['/appointments/review', appointmentId]);
  }

  isUpcoming(a: Appointment): boolean {
    return (
      new Date(a.appointmentDate) >= new Date() && a.status !== 'Cancelled'
    );
  }
}
