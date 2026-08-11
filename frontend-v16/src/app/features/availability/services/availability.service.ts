import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AvailabilityService {
  private apiUrl = 'http://localhost:8080/api/availability';

  constructor(private http: HttpClient) {}

  addAvailability(data: any) {
    return this.http.post(this.apiUrl, data);
  }

  getAvailabilityByDoctor(doctorId: string) {
    return this.http.get(`${this.apiUrl}/${doctorId}`);
  }

  getAvailableSlots(doctorId: string, date: string) {
    return this.http.get(`${this.apiUrl}/${doctorId}/slots?date=${date}`);
  }

  updateAvailability(id: string, data: any) {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteAvailability(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}