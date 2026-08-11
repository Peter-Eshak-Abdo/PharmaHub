// features/appointments/patient-appointments/patient-appointments.component.ts
import { Component, OnInit } from '@angular/core';
import { AppointmentService } from '../services/appointment.service';

@Component({
  selector: 'app-patient-appointments',
  templateUrl: './patient-appointments.component.html',
  // styleUrls: ['./patient-appointments.component.css'],
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
      Pending: 'bg-yellow-100 text-yellow-800',
      Confirmed: 'bg-teal-100 text-teal-800',
      Completed: 'bg-green-100 text-green-800',
      Cancelled: 'bg-red-100 text-red-800',
      'No-Show': 'bg-gray-100 text-gray-800',
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  }
}
