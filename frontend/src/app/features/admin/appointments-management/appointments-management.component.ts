import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-appointments-management',
  templateUrl: './appointments-management.component.html',
  styleUrls: ['./appointments-management.component.css']
})
export class AppointmentsManagementComponent implements OnInit {
  appointments: any[] = [];
  filteredAppointments: any[] = [];
  isLoading = false;

  // Filters
  doctorFilter = '';
  patientFilter = '';
  statusFilter = '';
  dateFilter = '';

  statusOptions = [
    { label: 'الجميع', value: '' },
    { label: 'معلق (Pending)', value: 'Pending' },
    { label: 'مؤكد (Confirmed)', value: 'Confirmed' },
    { label: 'مكتمل (Completed)', value: 'Completed' },
    { label: 'ملغي (Cancelled)', value: 'Cancelled' }
  ];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.isLoading = true;
    this.adminService.getAppointments().subscribe({
      next: (res) => {
        this.appointments = res.appointments || [];
        this.applyFilter();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading appointments:', err);
        // Mock appointments fallback
        this.appointments = [
          {
            _id: 'app1',
            patientName: 'أحمد محمود العبد',
            doctorName: 'د. خالد عبد العزيز',
            specialization: 'أمراض القلب',
            appointmentDate: '2026-08-22',
            appointmentTime: '10:30 ص',
            consultationType: 'في العيادة',
            consultationFee: 400,
            status: 'Confirmed',
            reason: 'استشارة متابعة ضغط الدم'
          },
          {
            _id: 'app2',
            patientName: 'سارة علي حسن',
            doctorName: 'د. مروة الشريف',
            specialization: 'الجلدية والتجميل',
            appointmentDate: '2026-08-21',
            appointmentTime: '01:00 م',
            consultationType: 'أونلاين',
            consultationFee: 300,
            status: 'Pending',
            reason: 'استشارة جلسات الليزر والعناية بالبشرة'
          },
          {
            _id: 'app3',
            patientName: 'محمود حسين إبراهيم',
            doctorName: 'د. طارق مصطفى',
            specialization: 'جراحة العظام',
            appointmentDate: '2026-08-20',
            appointmentTime: '05:00 م',
            consultationType: 'في العيادة',
            consultationFee: 500,
            status: 'Completed',
            reason: 'آلام حادة بالركبة اليمنى'
          },
          {
            _id: 'app4',
            patientName: 'منى عبد الله',
            doctorName: 'د. خالد عبد العزيز',
            specialization: 'أمراض القلب',
            appointmentDate: '2026-08-18',
            appointmentTime: '11:30 ص',
            consultationType: 'في العيادة',
            consultationFee: 400,
            status: 'Cancelled',
            reason: 'إلغاء بناء على طلب المريض'
          }
        ];
        this.applyFilter();
        this.isLoading = false;
      }
    });
  }

  applyFilter(): void {
    this.filteredAppointments = this.appointments.filter(app => {
      const matchDoc = !this.doctorFilter || app.doctorName.toLowerCase().includes(this.doctorFilter.toLowerCase());
      const matchPat = !this.patientFilter || app.patientName.toLowerCase().includes(this.patientFilter.toLowerCase());
      const matchStatus = !this.statusFilter || app.status === this.statusFilter;
      const matchDate = !this.dateFilter || app.appointmentDate === this.dateFilter;

      return matchDoc && matchPat && matchStatus && matchDate;
    });
  }

  changeStatus(app: any, newStatus: string): void {
    this.adminService.updateAppointmentStatus(app._id, newStatus).subscribe({
      next: () => {
        app.status = newStatus;
        this.applyFilter();
      },
      error: () => {
        app.status = newStatus;
        this.applyFilter();
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Confirmed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Cancelled': return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  }

  getStatusArabic(status: string): string {
    switch (status) {
      case 'Confirmed': return 'مؤكد';
      case 'Pending': return 'معلق';
      case 'Completed': return 'مكتمل';
      case 'Cancelled': return 'ملغي';
      default: return status;
    }
  }
}
