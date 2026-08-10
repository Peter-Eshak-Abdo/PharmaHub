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

  constructor(private appointmentService: AppointmentService) {}

  ngOnInit(): void {
    this.appointmentService.getPatientAppointments().subscribe((res) => {
      this.appointments = res;
    });
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
