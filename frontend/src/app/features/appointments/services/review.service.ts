import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Review, CreateReviewDto } from '../models/appointment.model';

export interface ReviewsResponse {
  success: boolean;
  data: Review[];
  avgRating: number;
  pagination: { total: number; page: number; pages: number };
}

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly base = `${environment.apiUrl}/reviews`;

  constructor(private http: HttpClient) {}

  // =============================================
  // Submit review (patient, completed appointment)
  // =============================================
  createReview(
    dto: CreateReviewDto,
  ): Observable<{ success: boolean; data: Review; message: string }> {
    return this.http
      .post<any>(this.base, dto)
      .pipe(
        catchError((err) =>
          throwError(
            () => new Error(err.error?.message || 'خطأ في إرسال التقييم'),
          ),
        ),
      );
  }

  // =============================================
  // Get doctor reviews
  // =============================================
  getDoctorReviews(
    doctorId: string,
    page = 1,
    limit = 10,
  ): Observable<ReviewsResponse> {
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http
      .get<ReviewsResponse>(`${this.base}/doctor/${doctorId}`, { params })
      .pipe(
        catchError((err) =>
          throwError(
            () => new Error(err.error?.message || 'خطأ في جلب التقييمات'),
          ),
        ),
      );
  }

  // =============================================
  // Check if appointment already reviewed
  // =============================================
  getReviewByAppointment(appointmentId: string): Observable<Review | null> {
    return this.http.get<any>(`${this.base}/appointment/${appointmentId}`).pipe(
      map((r) => r.data),
      catchError((err) =>
        throwError(() => new Error(err.error?.message || 'خطأ في التحقق')),
      ),
    );
  }
}
