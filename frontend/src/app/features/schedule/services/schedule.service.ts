import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  private baseUrl = environment.apiUrl.replace(/\/$/, '');
  private availabilityUrl = `${this.baseUrl}/availability`;
  private exceptionUrl = `${this.baseUrl}/exceptions`;

  constructor(private http: HttpClient) {}

  // --- Weekly Availability ---
  addAvailability(data: any) {
    return this.http.post(this.availabilityUrl, data);
  }

  getAvailabilityByDoctor(doctorId: string) {
    return this.http.get(`${this.availabilityUrl}/${doctorId}`);
  }

  getAvailableSlots(doctorId: string, date: string) {
    return this.http.get(`${this.availabilityUrl}/${doctorId}/slots?date=${date}`);
  }

  updateAvailability(id: string, data: any) {
    return this.http.put(`${this.availabilityUrl}/${id}`, data);
  }

  deleteAvailability(id: string) {
    return this.http.delete(`${this.availabilityUrl}/${id}`);
  }

  // --- Schedule Exceptions ---
  addException(data: any) {
    return this.http.post(this.exceptionUrl, data);
  }

  getExceptionsByDoctor(doctorId: string) {
    return this.http.get(`${this.exceptionUrl}/${doctorId}`);
  }

  deleteException(id: string) {
    return this.http.delete(`${this.exceptionUrl}/${id}`);
  }
}
