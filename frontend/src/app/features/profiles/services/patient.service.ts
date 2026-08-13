import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PatientService {
  // private apiUrl = '/api/patient';
  private apiUrl = `${environment.apiUrl}/api/patient`;

  constructor(private http: HttpClient) {}

  getPatientProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`);
  }

  updatePatientProfile(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, data);
  }
}
