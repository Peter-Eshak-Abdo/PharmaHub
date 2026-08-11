// features/appointments/services/appointment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  private apiUrl = '/api/appointments';
  private availabilityUrl = '/api/availability';

  constructor(private http: HttpClient) {}

  getAvailableSlots(doctorId: string, date: string): Observable<any> {
    return this.http.get(
      `${this.availabilityUrl}/${doctorId}/slots?date=${date}`,
    );
  }

  createAppointment(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  getPatientAppointments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/patient`);
  }

  getDoctorAppointments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/doctor`);
  }

  updateAppointmentStatus(id: string, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/status`, { status });
  }
}
