import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  private baseUrl = environment.apiUrl.replace(/\/$/, '');
  private availabilityUrl = `${this.baseUrl}/availability`;
  private exceptionUrl = `${this.baseUrl}/exceptions`;

  constructor(private http: HttpClient) {}

  // Centralized error handling: extracts backend's { success:false, message } shape
  // when present, otherwise falls back to a generic message. Re-throws so callers
  // can still show their own UI feedback.
  private handleError(error: HttpErrorResponse) {
    const message =
      error.error?.message ||
      (error.status === 0
        ? 'Unable to reach the server. Check your connection.'
        : `Something went wrong (${error.status}).`);

    return throwError(() => new Error(message));
  }

  // --- Weekly Availability ---
  addAvailability(data: any): Observable<any> {
    return this.http.post(this.availabilityUrl, data).pipe(catchError(this.handleError));
  }

  getAvailabilityByDoctor(doctorId: string): Observable<any> {
    return this.http.get(`${this.availabilityUrl}/${doctorId}`).pipe(catchError(this.handleError));
  }

  getAvailableSlots(doctorId: string, date: string): Observable<any> {
    return this.http
      .get(`${this.availabilityUrl}/${doctorId}/slots?date=${date}`)
      .pipe(catchError(this.handleError));
  }

  updateAvailability(id: string, data: any): Observable<any> {
    return this.http.put(`${this.availabilityUrl}/${id}`, data).pipe(catchError(this.handleError));
  }

  deleteAvailability(id: string): Observable<any> {
    return this.http.delete(`${this.availabilityUrl}/${id}`).pipe(catchError(this.handleError));
  }

  // --- Schedule Exceptions ---
  addException(data: any): Observable<any> {
    return this.http.post(this.exceptionUrl, data).pipe(catchError(this.handleError));
  }

  getExceptionsByDoctor(doctorId: string): Observable<any> {
    return this.http.get(`${this.exceptionUrl}/${doctorId}`).pipe(catchError(this.handleError));
  }

  updateException(id: string, data: any): Observable<any> {
    return this.http.put(`${this.exceptionUrl}/${id}`, data).pipe(catchError(this.handleError));
  }

  deleteException(id: string): Observable<any> {
    return this.http.delete(`${this.exceptionUrl}/${id}`).pipe(catchError(this.handleError));
  }
}
