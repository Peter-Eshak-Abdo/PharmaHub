// features/appointments/services/appointment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Appointment, TimeSlot } from '../models/appointment.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  private apiUrl = `${environment.apiUrl}/api/appointments`;
  // private apiUrl = '/api/appointments';

  constructor(private http: HttpClient) {}

  getPatientAppointments(patientId?: string): Observable<any> {
    const url = patientId
      ? `${this.apiUrl}/patient/${patientId}`
      : `${this.apiUrl}/patient`;
    return this.http.get<any>(url);
  }

  getDoctorAppointments(doctorId?: string): Observable<any> {
    const url = doctorId
      ? `${this.apiUrl}/doctor/${doctorId}`
      : `${this.apiUrl}/doctor`;
    return this.http.get<any>(url);
  }

  getAvailableSlots(doctorId: string, date: string): Observable<any> {
    return this.http.get<any>(
      `/api/availability/${doctorId}/slots?date=${date}`,
    );
  }

  createAppointment(payload: Partial<Appointment>): Observable<Appointment> {
    return this.http.post<Appointment>(this.apiUrl, payload);
  }

  updateAppointmentStatus(id: string, status: string): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.apiUrl}/${id}/status`, {
      status,
    });
  }
}

