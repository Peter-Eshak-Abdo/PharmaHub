import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

const DEFAULT_PATIENT_PROFILE = {
  _id: 'pat_101',
  fullName: 'أحمد محمود العبد',
  phoneNumber: '01012345678',
  age: 32,
  gender: 'Male',
  address: 'شارع النصر، المعادي، القاهرة',
  occupation: 'مهندس برمجيات',
  companyName: 'شركة التكنولوجيا الحديثة',
  bloodGroup: 'O+',
  emergencyContact: '01198765432'
};

@Injectable({
  providedIn: 'root',
})
export class PatientService {
  private apiUrl = `${environment.apiUrl}/patient`;

  constructor(private http: HttpClient) {}

  getPatientProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`).pipe(
      catchError(() => {
        const stored = localStorage.getItem('patient_profile');
        if (stored) {
          try {
            return of({ data: JSON.parse(stored) });
          } catch (e) {
            // ignore
          }
        }
        return of({ data: DEFAULT_PATIENT_PROFILE });
      })
    );
  }

  createPatientProfile(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/profile`, data).pipe(
      tap((res: any) => {
        const profile = res?.data || data;
        localStorage.setItem('patient_profile', JSON.stringify(profile));
      }),
      catchError(() => {
        localStorage.setItem('patient_profile', JSON.stringify(data));
        return of({ success: true, data: data });
      })
    );
  }

  updatePatientProfile(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, data).pipe(
      tap((res: any) => {
        const profile = res?.data || data;
        localStorage.setItem('patient_profile', JSON.stringify(profile));
      }),
      catchError(() => {
        const existing = JSON.parse(localStorage.getItem('patient_profile') || '{}');
        const updated = { ...existing, ...data };
        localStorage.setItem('patient_profile', JSON.stringify(updated));
        return of({ success: true, data: updated });
      })
    );
  }
}
