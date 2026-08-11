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

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      Pending: 'bg-yellow-100 text-yellow-800',
      Confirmed: 'bg-teal-100 text-teal-800',
      Completed: 'bg-green-100 text-green-800',
      Cancelled: 'bg-red-100 text-red-800',
      'No-Show': 'bg-gray-100 text-gray-800',
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  }
}
