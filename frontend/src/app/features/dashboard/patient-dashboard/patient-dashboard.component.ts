import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { PatientService } from '../../profiles/services/patient.service';
import { AppointmentService } from '../../appointments/services/appointment.service';
import { Appointment } from '../../appointments/models/appointment.model';

@Component({
  selector: 'app-patient-dashboard',
  templateUrl: './patient-dashboard.component.html',
  styleUrls: ['./patient-dashboard.component.css'],
})
export class PatientDashboardComponent implements OnInit {
  patientName = '';
  greetingText = '';
  greetingIcon = '';

  // Stats
  totalAppointments = 0;
  upcomingCount = 0;
  completedCount = 0;
  cancelledCount = 0;

  // Next appointment
  nextAppointment: Appointment | null = null;

  // Recent appointments
  recentAppointments: Appointment[] = [];

  isLoading = true;

  // Quick actions
  quickActions = [
    { icon: 'search', label: 'البحث عن طبيب', route: '/profiles/doctors', color: '#6C63FF' },
    { icon: 'calendar_month', label: 'مواعيدي', route: '/appointments/patient', color: '#00C9A7' },
    { icon: 'person', label: 'ملفي الشخصي', route: '/profiles/patient-profile', color: '#FF6B6B' },
    { icon: 'history', label: 'السجل الطبي', route: '/medical/history', color: '#FFB347' },
  ];

  // Health tips
  healthTips = [
    { icon: 'water_drop', title: 'شرب الماء', desc: 'اشرب ٨ أكواب من الماء يومياً للحفاظ على صحتك' },
    { icon: 'directions_walk', title: 'النشاط البدني', desc: '٣٠ دقيقة مشي يومياً تحسّن صحة القلب' },
    { icon: 'bedtime', title: 'النوم الصحي', desc: 'النوم ٧-٨ ساعات يومياً يعزز المناعة' },
    { icon: 'restaurant', title: 'التغذية السليمة', desc: 'تناول ٥ حصص من الفواكه والخضروات يومياً' },
  ];

  constructor(
    private authService: AuthService,
    private patientService: PatientService,
    private appointmentService: AppointmentService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.setGreeting();
    this.loadPatientData();
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

  private loadPatientData(): void {
    this.patientService.getPatientProfile().subscribe({
      next: (res: any) => {
        const patient = res?.data || res;
        this.patientName = patient?.fullName || 'المريض';
      },
      error: () => {
        this.patientName = 'المريض';
      },
    });
  }

  private loadAppointments(): void {
    this.isLoading = true;

    // Load all appointments for stats
    this.appointmentService.getPatientAppointments(undefined, 1, 100).subscribe({
      next: (res) => {
        const all = res.data || [];
        this.totalAppointments = all.length;
        this.upcomingCount = all.filter((a: Appointment) => a.status === 'Confirmed' || a.status === 'Pending').length;
        this.completedCount = all.filter((a: Appointment) => a.status === 'Completed').length;
        this.cancelledCount = all.filter((a: Appointment) => a.status === 'Cancelled').length;

        // Next appointment (soonest upcoming)
        const upcoming = all
          .filter((a: Appointment) => a.status === 'Confirmed' || a.status === 'Pending')
          .sort((a: Appointment, b: Appointment) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());

        this.nextAppointment = upcoming.length > 0 ? upcoming[0] : null;

        // Recent 3 appointments
        this.recentAppointments = all.slice(0, 4);

        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
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
