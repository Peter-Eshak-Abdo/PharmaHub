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
  activeTab: string = 'Upcoming';
  appointments: Appointment[] = [];
  nextAppointment: Appointment | null = null;
  regularAppointments: Appointment[] = [];

  isLoading = false;
  errorMessage = '';
  cancellingId: string | null = null;

  pagination = { total: 0, page: 1, pages: 1 };

  STATUS_LABELS = STATUS_LABELS;
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
  ) {}

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
    if (!confirm('هل أنت متأكد من إلغاء هذا الموعد؟')) return;
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
    return typeof a.doctorId === 'object' && a.doctorId ? a.doctorId.fullName : 'الطبيب المعالج';
  }

  getDoctorSpecialization(a: Appointment): string {
    return typeof a.doctorId === 'object' && a.doctorId ? a.doctorId.specialization : 'استشاري';
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
    const period = h < 12 ? 'ص' : 'م';
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${h12}:${String(m).padStart(2, '0')} ${period}`;
  }

  goToReview(appointmentId: string): void {
    this.router.navigate(['/appointments/review', appointmentId]);
  }
}

