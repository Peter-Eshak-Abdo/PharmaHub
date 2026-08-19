import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface AdminStats {
  doctors: number;
  patients: number;
  appointments: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  getStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`);
  }

  getDoctors(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/doctors`);
  }

  updateDoctor(id: string, data: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/doctors/${id}`, data);
  }

  deleteDoctor(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/doctors/${id}`);
  }

  getPatients(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/patients`);
  }

  updatePatient(id: string, data: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/patients/${id}`, data);
  }

  deletePatient(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/patients/${id}`);
  }

  getAppointments(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/appointments`);
  }

  cancelAppointment(id: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/appointments/${id}/cancel`, {});
  }
}
