import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AdminDashboardStats {
  totalPatients: number;
  totalDoctors: number;
  totalAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  recentAppointments: any[];
  topSpecializations: { name: string; count: number }[];
}

export interface DoctorAdminModel {
  _id: string;
  userId?: { _id: string; email: string; is_active?: boolean };
  full_name: string;
  specialization: string;
  education: string;
  qualifications: string;
  years_experience: number;
  bio: string;
  rating: number;
  is_active: boolean;
  phone?: string;
  email?: string;
  image?: string;
}

export interface PatientAdminModel {
  _id: string;
  userId?: { _id: string; email: string; is_active?: boolean };
  full_name: string;
  address: string;
  age: number;
  gender: string;
  phone: string;
  occupation?: string;
  company_name?: string;
  is_active: boolean;
  email?: string;
  image?: string;
}

export interface SpecializationModel {
  _id: string;
  name: string;
  nameAr?: string;
  icon?: string;
  description?: string;
  doctorCount?: number;
  isActive: boolean;
}

export interface ReviewAdminModel {
  _id: string;
  appointmentId?: string;
  patientName: string;
  doctorName: string;
  rating: number;
  comment: string;
  submittedDate: string;
  status: 'published' | 'hidden' | 'flagged';
}

export interface UserAdminModel {
  _id: string;
  email: string;
  role: 'admin' | 'doctor' | 'patient';
  is_active: boolean;
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private apiUrl = `${environment.apiUrl || 'http://localhost:5000/api'}/admin`;

  constructor(private http: HttpClient) {}

  // 1. Dashboard Statistics
  getDashboardStats(): Observable<AdminDashboardStats> {
    return this.http.get<AdminDashboardStats>(`${this.apiUrl}/stats`);
  }

  // 2. Doctors Management
  getDoctors(params?: any): Observable<{ doctors: DoctorAdminModel[]; total: number }> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get<{ doctors: DoctorAdminModel[]; total: number }>(`${this.apiUrl}/doctors`, { params: httpParams });
  }

  addDoctor(doctorData: any): Observable<DoctorAdminModel> {
    return this.http.post<DoctorAdminModel>(`${this.apiUrl}/doctors`, doctorData);
  }

  updateDoctor(id: string, doctorData: any): Observable<DoctorAdminModel> {
    return this.http.put<DoctorAdminModel>(`${this.apiUrl}/doctors/${id}`, doctorData);
  }

  toggleDoctorStatus(id: string, is_active: boolean): Observable<any> {
    return this.http.patch(`${this.apiUrl}/doctors/${id}/status`, { is_active });
  }

  deleteDoctor(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/doctors/${id}`);
  }

  // 3. Patients Management
  getPatients(params?: any): Observable<{ patients: PatientAdminModel[]; total: number }> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get<{ patients: PatientAdminModel[]; total: number }>(`${this.apiUrl}/patients`, { params: httpParams });
  }

  togglePatientStatus(id: string, is_active: boolean): Observable<any> {
    return this.http.patch(`${this.apiUrl}/patients/${id}/status`, { is_active });
  }

  // 4. Appointments Management
  getAppointments(params?: any): Observable<{ appointments: any[]; total: number }> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get<{ appointments: any[]; total: number }>(`${this.apiUrl}/appointments`, { params: httpParams });
  }

  updateAppointmentStatus(id: string, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/appointments/${id}/status`, { status });
  }

  // 5. Reviews Management
  getReviews(params?: any): Observable<{ reviews: ReviewAdminModel[]; total: number }> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get<{ reviews: ReviewAdminModel[]; total: number }>(`${this.apiUrl}/reviews`, { params: httpParams });
  }

  deleteReview(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/reviews/${id}`);
  }

  // 6. Specializations Management
  getSpecializations(): Observable<SpecializationModel[]> {
    return this.http.get<SpecializationModel[]>(`${this.apiUrl}/specializations`);
  }

  addSpecialization(specData: any): Observable<SpecializationModel> {
    return this.http.post<SpecializationModel>(`${this.apiUrl}/specializations`, specData);
  }

  updateSpecialization(id: string, specData: any): Observable<SpecializationModel> {
    return this.http.put<SpecializationModel>(`${this.apiUrl}/specializations/${id}`, specData);
  }

  deleteSpecialization(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/specializations/${id}`);
  }

  // 7. User Accounts Management
  getUsers(params?: any): Observable<{ users: UserAdminModel[]; total: number }> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get<{ users: UserAdminModel[]; total: number }>(`${this.apiUrl}/users`, { params: httpParams });
  }

  updateUserRole(id: string, role: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/users/${id}/role`, { role });
  }

  toggleUserStatus(id: string, is_active: boolean): Observable<any> {
    return this.http.patch(`${this.apiUrl}/users/${id}/status`, { is_active });
  }
}
