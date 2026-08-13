import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DoctorService {
  private apiUrl = `${environment.apiUrl}/doctor`;
  // private apiUrl = '/api/doctor';

  constructor(private http: HttpClient) {}

  getDoctors(specialization?: string): Observable<any[]> {
    let params = new HttpParams();
    if (specialization) {
      params = params.set('specialization', specialization);
    }
    return this.http.get<any[]>(this.apiUrl, { params });
  }

  getDoctorById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  getDoctorProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`);
  }

  createDoctorProfile(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/profile`, data);
  }

  updateDoctorProfile(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, data);
  }
}
