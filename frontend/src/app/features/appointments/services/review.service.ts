// features/appointments/services/review.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private apiUrl = `${environment.apiUrl}/reviews`;
  // private apiUrl = '/api/reviews';

  constructor(private http: HttpClient) {}

  addReview(
    appointmentId: string,
    review: { rating: number; comment: string },
  ): Observable<any> {
    return this.http.post(this.apiUrl, { appointmentId, ...review });
  }
}
