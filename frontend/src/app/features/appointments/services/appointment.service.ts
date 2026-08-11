// features/appointments/services/appointment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Appointment, TimeSlot } from '../models/appointment.model';

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  private apiUrl = '/api/appointments';

  constructor(private http: HttpClient) {}

  getPatientAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/patient`);
  }

  getDoctorAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/doctor`);
  }

  getAvailableSlots(
    doctorId: string,
    date: string,
  ): Observable<{ slots: TimeSlot[] }> {
    return this.http.get<{ slots: TimeSlot[] }>(
      `${this.apiUrl}/slots?doctorId=${doctorId}&date=${date}`,
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
