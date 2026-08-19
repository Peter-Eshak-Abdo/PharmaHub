import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import {
  Appointment,
  CreateAppointmentDto,
  AppointmentStatus,
  PaginatedResponse,
} from '../models/appointment.model';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private readonly base = `${environment.apiUrl}/appointments`;

  constructor(private http: HttpClient) {}

  // =============================================
  // Create appointment (patient)
  // =============================================
  createAppointment(
    dto: CreateAppointmentDto,
  ): Observable<{ success: boolean; data: Appointment; message: string }> {
    return this.http
      .post<any>(this.base, dto)
      .pipe(
        catchError((err) =>
          throwError(
            () => new Error(err.error?.message || 'خطأ في إنشاء الحجز'),
          ),
        ),
      );
  }

  // =============================================
  // Get patient appointments
  // =============================================
  getPatientAppointments(
    status?: AppointmentStatus,
    page = 1,
    limit = 10,
  ): Observable<PaginatedResponse<Appointment>> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (status) params = params.set('status', status);

    return this.http
      .get<PaginatedResponse<Appointment>>(`${this.base}/patient`, { params })
      .pipe(
        catchError((err) =>
          throwError(
            () => new Error(err.error?.message || 'خطأ في جلب المواعيد'),
          ),
        ),
      );
  }

  // =============================================
  // Get doctor appointments
  // =============================================
  getDoctorAppointments(
    status?: AppointmentStatus,
    date?: string,
    page = 1,
    limit = 10,
  ): Observable<PaginatedResponse<Appointment>> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (status) params = params.set('status', status);
    if (date) params = params.set('date', date);

    return this.http
      .get<PaginatedResponse<Appointment>>(`${this.base}/doctor`, { params })
      .pipe(
        catchError((err) =>
          throwError(
            () => new Error(err.error?.message || 'خطأ في جلب المواعيد'),
          ),
        ),
      );
  }

  // =============================================
  // Get single appointment
  // =============================================
  getAppointmentById(id: string): Observable<Appointment> {
    return this.http.get<any>(`${this.base}/${id}`).pipe(
      map((r) => r.data),
      catchError((err) =>
        throwError(() => new Error(err.error?.message || 'خطأ في جلب الموعد')),
      ),
    );
  }

  // =============================================
  // Update appointment status (doctor/admin)
  // =============================================
  updateStatus(id: string, status: AppointmentStatus): Observable<Appointment> {
    return this.http.patch<any>(`${this.base}/${id}/status`, { status }).pipe(
      map((r) => r.data),
      catchError((err) =>
        throwError(
          () => new Error(err.error?.message || 'خطأ في تحديث الحالة'),
        ),
      ),
    );
  }

  // =============================================
  // Cancel appointment
  // =============================================
  cancelAppointment(
    id: string,
  ): Observable<{ success: boolean; message: string }> {
    return this.http
      .patch<any>(`${this.base}/${id}/cancel`, {})
      .pipe(
        catchError((err) =>
          throwError(
            () => new Error(err.error?.message || 'خطأ في إلغاء الموعد'),
          ),
        ),
      );
  }

  // =============================================
  // Get available slots
  // =============================================
  getAvailableSlots(
    doctorId: string,
    date: string,
  ): Observable<{
    data: string[];
    slotDuration: number;
    message?: string;
    success?: boolean;
  }> {
    const params = new HttpParams().set('doctorId', doctorId).set('date', date);
    return this.http
      .get<any>(`${this.base}/available-slots`, { params })
      .pipe(
        catchError((err) =>
          throwError(
            () =>
              new Error(err.error?.message || 'خطأ في جلب المواعيد المتاحة'),
          ),
        ),
      );
  }

  // =============================================
  // Get available days for calendar
  // =============================================
  getAvailableDays(
    doctorId: string,
    month: number,
    year: number
  ): Observable<{
    success: boolean;
    days: Array<{
      date: string;
      dayName: string;
      available: boolean;
      exception: { type: string; reason?: string } | null;
      isPast: boolean;
    }>;
    availableDayNames: string[];
  }> {
    const params = new HttpParams()
      .set('month', month.toString())
      .set('year', year.toString());
    return this.http.get<any>(`${this.base}/doctors/${doctorId}/available-days`, { params });
  }

  // =============================================
  // Confirm appointment payment (doctor/admin)
  // =============================================
  confirmPayment(id: string): Observable<any> {
    return this.http.patch<any>(`${this.base}/${id}/confirm-payment`, {});
  }
}
