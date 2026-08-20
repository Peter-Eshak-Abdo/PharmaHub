import { Component, OnInit } from '@angular/core';
import { AdminService, AdminDashboardStats } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  isLoading = true;
  stats: AdminDashboardStats = {
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
    confirmedAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    recentAppointments: [],
    topSpecializations: []
  };

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.isLoading = true;
    this.adminService.getDashboardStats().subscribe({
      next: (data) => {
        if (data) {
          this.stats = data;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching admin dashboard stats:', err);
        // Provide mock fallback data if backend endpoint isn't fully ready yet
        this.stats = {
          totalPatients: 128,
          totalDoctors: 34,
          totalAppointments: 412,
          pendingAppointments: 18,
          confirmedAppointments: 145,
          completedAppointments: 220,
          cancelledAppointments: 29,
          recentAppointments: [
            {
              id: '1',
              patientName: 'أحمد محمود',
              doctorName: 'د. خالد عبد العزيز',
              specialization: 'أمراض القلب',
              date: '2026-08-20',
              time: '10:30 ص',
              status: 'Pending'
            },
            {
              id: '2',
              patientName: 'سارة علي',
              doctorName: 'د. مروة الشريف',
              specialization: 'جلدية وتجميل',
              date: '2026-08-20',
              time: '11:00 ص',
              status: 'Confirmed'
            },
            {
              id: '3',
              patientName: 'محمد حسن',
              doctorName: 'د. طارق مصطفى',
              specialization: 'طرق العظام',
              date: '2026-08-19',
              time: '04:00 م',
              status: 'Completed'
            }
          ],
          topSpecializations: [
            { name: 'طب الأطفال', count: 142 },
            { name: 'أمراض القلب', count: 98 },
            { name: 'الجلدية والتجميل', count: 85 },
            { name: 'جراحة العظام', count: 64 },
            { name: 'الأسنان', count: 52 }
          ]
        };
        this.isLoading = false;
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Confirmed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Cancelled':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
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
