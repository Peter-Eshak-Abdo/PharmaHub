// features/appointments/doctor-appointments/doctor-appointments.component.ts
import { Component, OnInit } from '@angular/core';
import { AppointmentService } from '../services/appointment.service';

@Component({
  selector: 'app-doctor-appointments',
  templateUrl: './doctor-appointments.component.html',
  // styleUrls: ['./doctor-appointments.component.css'],
})
export class DoctorAppointmentsComponent implements OnInit {
  appointments: any[] = [];

  constructor(private appointmentService: AppointmentService) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.appointmentService.getDoctorAppointments().subscribe((res) => {
      this.appointments = res;
    });
  }

  updateStatus(id: string, currentStatus: string, newStatus: string): void {
    const allowedTransitions: { [key: string]: string[] } = {
      Pending: ['Confirmed', 'Cancelled'],
      Confirmed: ['Completed', 'Cancelled', 'No-Show'],
    };

    if (allowedTransitions[currentStatus]?.includes(newStatus)) {
      this.appointmentService
        .updateAppointmentStatus(id, newStatus)
        .subscribe(() => {
          this.loadAppointments();
        });
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
