// features/appointments/doctor-appointments/doctor-appointments.component.ts
import { Component, OnInit } from '@angular/core';
import { AppointmentService } from '../services/appointment.service';

@Component({
  selector: 'app-doctor-appointments',
  templateUrl: './doctor-appointments.component.html',
  styleUrls: ['./doctor-appointments.component.css'],
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

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      Pending: 'badge-warning',
      Confirmed: 'badge-primary',
      Completed: 'badge-success',
      Cancelled: 'badge-danger',
      'No-Show': 'badge-dark',
    };
    return statusMap[status] || 'badge-secondary';
  }
}
