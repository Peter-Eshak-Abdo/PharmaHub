import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { DoctorService } from '../../profiles/services/doctor.service';
import { AppointmentService } from '../../appointments/services/appointment.service';
import { Appointment } from '../../appointments/models/appointment.model';

@Component({
  selector: 'app-doctor-dashboard',
  templateUrl: './doctor-dashboard.component.html',
  styleUrls: ['./doctor-dashboard.component.css'],
})
export class DoctorDashboardComponent implements OnInit {
  doctorName = '';
  specialization = '';
  greetingText = '';
  greetingIcon = '';

  // Stats
  totalAppointments = 0;
  todayCount = 0;
  pendingCount = 0;
  completedCount = 0;

  // Today's appointments
  todayAppointments: Appointment[] = [];

  // Pending appointments for quick action
  pendingAppointments: Appointment[] = [];

  isLoading = true;

  // Quick actions for doctor
  quickActions = [
    { icon: 'calendar_month', label: 'مواعيدي', route: '/appointments/doctor', color: '#6C63FF' },
    { icon: 'person', label: 'ملفي الشخصي', route: '/profiles/doctor-profile', color: '#00C9A7' },
    { icon: 'schedule', label: 'جدول العمل', route: '/schedule', color: '#FF6B6B' },
    { icon: 'medical_information', label: 'الروشتات', route: '/medical/prescriptions', color: '#FFB347' },
  ];

  constructor(
    private authService: AuthService,
    private doctorService: DoctorService,
    private appointmentService: AppointmentService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.setGreeting();
    this.loadDoctorData();
    this.loadAppointments();
  }

  private setGreeting(): void {
    const hour = new Date().getHours();
    if (hour < 12) {
      this.greetingText = 'صباح الخير';
      this.greetingIcon = 'wb_sunny';
    } else if (hour < 17) {
      this.greetingText = 'مساء الخير';
      this.greetingIcon = 'wb_twilight';
    } else {
      this.greetingText = 'مساء النور';
      this.greetingIcon = 'dark_mode';
    }
  }

  private loadDoctorData(): void {
    this.doctorService.getDoctorProfile().subscribe({
      next: (res: any) => {
        const doctor = res?.data || res;
        this.doctorName = doctor?.fullName || 'الدكتور';
        this.specialization = doctor?.specialization || 'طبيب';
      },
      error: () => {
        this.doctorName = 'الدكتور';
        this.specialization = 'طبيب';
      },
    });
  }

  private loadAppointments(): void {
    this.isLoading = true;
    const today = new Date().toISOString().split('T')[0];

    this.appointmentService.getDoctorAppointments(undefined, undefined, 1, 200).subscribe({
      next: (res) => {
        const all = res.data || [];
        this.totalAppointments = all.length;

        // Today's appointments
        this.todayAppointments = all.filter((a: Appointment) => {
          const apptDate = new Date(a.appointmentDate).toISOString().split('T')[0];
          return apptDate === today && (a.status === 'Confirmed' || a.status === 'Pending');
        });
        this.todayCount = this.todayAppointments.length;

        // Pending
        this.pendingAppointments = all.filter((a: Appointment) => a.status === 'Pending');
        this.pendingCount = this.pendingAppointments.length;

        // Completed
        this.completedCount = all.filter((a: Appointment) => a.status === 'Completed').length;

        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  confirmAppointment(id: string): void {
    this.appointmentService.updateStatus(id, 'Confirmed').subscribe({
      next: () => {
        this.loadAppointments();
      },
      error: (err) => {
        console.error('Error confirming appointment', err);
      },
    });
  }

  getPatientName(a: Appointment): string {
    return typeof a.patientId === 'object' && a.patientId ? a.patientId.fullName : 'المريض';
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

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      Pending: 'قيد الانتظار',
      Confirmed: 'مؤكد',
      Completed: 'مكتمل',
      Cancelled: 'ملغي',
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
