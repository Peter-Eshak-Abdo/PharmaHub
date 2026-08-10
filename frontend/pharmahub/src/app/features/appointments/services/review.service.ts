// features/appointments/services/review.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private apiUrl = '/api/reviews';

  constructor(private http: HttpClient) {}

  addReview(appointmentId: string, reviewData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${appointmentId}`, reviewData);
  }

  getDoctorReviews(doctorId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/doctor/${doctorId}`);
  }
}
