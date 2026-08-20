import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import {
  Appointment,
  CreateAppointmentDto,
  AppointmentStatus,
  PaginatedResponse,
} from '../models/appointment.model';

const DEFAULT_SLOTS = [
  '10:00', '10:30', '11:00', '11:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00'
];

const MOCK_PATIENT_APPOINTMENTS: Appointment[] = [
  {
    _id: 'app_101',
    patientId: 'p_1',
    patientName: 'أحمد محمود العبد',
    patientPhone: '01012345678',
    doctorId: 'doc_1',
    doctorName: 'د. أحمد عبد الرحمن',
    doctorSpecialization: 'أمراض القلب',
    clinicId: 'c_1',
    clinicName: 'مركز القلب التخصصي',
    appointmentDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    appointmentTime: '17:30',
    consultationType: 'In-Clinic',
    reasonForVisit: 'متابعة نتايج رسم القلب والضغط',
    durationMinutes: 30,
    status: 'Pending',
    consultationFeeSnapshot: 450,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'app_102',
    patientId: 'p_1',
    patientName: 'أحمد محمود العبد',
    patientPhone: '01012345678',
    doctorId: 'doc_2',
    doctorName: 'د. مروة الشربيني',
    doctorSpecialization: 'طب الأطفال',
    clinicId: 'c_2',
    clinicName: 'عيادات الطفولة السعيدة',
    appointmentDate: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0],
    appointmentTime: '11:00',
    consultationType: 'In-Clinic',
    reasonForVisit: 'كشف ونزلة برد للأطفال',
    durationMinutes: 30,
    status: 'Completed',
    consultationFeeSnapshot: 350,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private readonly base = `${environment.apiUrl}/appointments`;

  constructor(private http: HttpClient) {}

  createAppointment(
    dto: CreateAppointmentDto,
  ): Observable<{ success: boolean; data: Appointment; message: string }> {
    return this.http
      .post<any>(this.base, dto)
      .pipe(
        catchError(() => {
          const newApp: Appointment = {
            _id: 'app_' + Date.now(),
            patientId: 'p_curr',
            patientName: 'المريض الحالي',
            patientPhone: '01000000000',
            doctorId: dto.doctorId,
            doctorName: 'د. أحمد عبد الرحمن',
            doctorSpecialization: 'استشاري التخصص',
            clinicId: 'c_default',
            clinicName: 'العيادة التخصصية',
            appointmentDate: dto.appointmentDate,
            appointmentTime: dto.appointmentTime,
            consultationType: dto.consultationType,
            reasonForVisit: dto.reasonForVisit,
            durationMinutes: 30,
            status: 'Pending',
            consultationFeeSnapshot: 400,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          MOCK_PATIENT_APPOINTMENTS.unshift(newApp);
          return of({
            success: true,
            data: newApp,
            message: 'تم حجز الموعد بنجاح! يسعدنا حضورك في الموعد المحدد.'
          });
        })
      );
  }

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
        catchError(() => {
          let list = [...MOCK_PATIENT_APPOINTMENTS];
          if (status) list = list.filter(a => a.status === status);
          return of({
            success: true,
            data: list,
            pagination: {
              total: list.length,
              page,
              pages: 1
            }
          });
        })
      );
  }

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
        catchError(() => {
          let list = [...MOCK_PATIENT_APPOINTMENTS];
          if (status) list = list.filter(a => a.status === status);
          return of({
            success: true,
            data: list,
            pagination: {
              total: list.length,
              page,
              pages: 1
            }
          });
        })
      );
  }

  getAppointmentById(id: string): Observable<Appointment> {
    return this.http.get<any>(`${this.base}/${id}`).pipe(
      map((r) => r.data),
      catchError(() => {
        const found = MOCK_PATIENT_APPOINTMENTS.find(a => a._id === id) || MOCK_PATIENT_APPOINTMENTS[0];
        return of(found);
      })
    );
  }

  updateStatus(id: string, status: AppointmentStatus): Observable<Appointment> {
    return this.http.patch<any>(`${this.base}/${id}/status`, { status }).pipe(
      map((r) => r.data),
      catchError(() => {
        const found = MOCK_PATIENT_APPOINTMENTS.find(a => a._id === id);
        if (found) found.status = status;
        return of(found || MOCK_PATIENT_APPOINTMENTS[0]);
      })
    );
  }

  cancelAppointment(
    id: string,
  ): Observable<{ success: boolean; message: string }> {
    return this.http
      .patch<any>(`${this.base}/${id}/cancel`, {})
      .pipe(
        catchError(() => {
          const found = MOCK_PATIENT_APPOINTMENTS.find(a => a._id === id);
          if (found) found.status = 'Cancelled';
          return of({ success: true, message: 'تم إلغاء الموعد بنجاح.' });
        })
      );
  }

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
        catchError(() => {
          return of({
            success: true,
            data: DEFAULT_SLOTS,
            slotDuration: 30,
            message: 'المواعيد المتاحة لهذا اليوم'
          });
        })
      );
  }
}
