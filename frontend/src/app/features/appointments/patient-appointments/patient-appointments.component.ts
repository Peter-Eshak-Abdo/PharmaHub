// features/appointments/patient-appointments/patient-appointments.component.ts
import { Component, OnInit } from '@angular/core';
import { AppointmentService } from '../services/appointment.service';

@Component({
  selector: 'app-patient-appointments',
  templateUrl: './patient-appointments.component.html',
  styleUrls: ['./patient-appointments.component.css'],
})
export class PatientAppointmentsComponent implements OnInit {
  appointments: any[] = [];
  activeTab: string = 'Upcoming';

  constructor(private appointmentService: AppointmentService) {}

  ngOnInit(): void {
    this.appointmentService.getPatientAppointments().subscribe((res: any) => {
      this.appointments = res.data || res || [];
    });
  }

  get filteredAppointments() {
    if (this.activeTab === 'Upcoming') {
      return this.appointments.filter(
        (a) => a.status === 'Confirmed' || a.status === 'Pending',
      );
    } else if (this.activeTab === 'Completed') {
      return this.appointments.filter((a) => a.status === 'Completed');
    } else {
      return this.appointments.filter(
        (a) => a.status === 'Cancelled' || a.status === 'No-Show',
      );
    }
  }

  getStatusBadge(status: string): string {
    const statusMap: { [key: string]: string } = {
      Pending: 'bg-amber-100 text-amber-700',
      Confirmed: 'bg-sky-100 text-sky-700',
      Completed: 'bg-emerald-100 text-emerald-700',
      Cancelled: 'bg-red-100 text-red-700',
      'No-Show': 'bg-slate-200 text-slate-700',
    };
    return statusMap[status] || 'bg-slate-100 text-slate-700';
  }
}
