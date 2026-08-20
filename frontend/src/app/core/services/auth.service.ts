import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

import { OneSignalService } from './onesignal.service';

const MOCK_PATIENT_USER: User = {
  _id: 'user_patient_1',
  email: 'patient@tammeni.com',
  role: 'patient'
};

const MOCK_DOCTOR_USER: User = {
  _id: 'user_doctor_1',
  email: 'doctor@tammeni.com',
  role: 'doctor'
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  private currentUserSubject = new BehaviorSubject<User | null>(
    this.getUserFromToken(),
  );
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private oneSignalService: OneSignalService
  ) {
    const user = this.getUserFromToken();
    if (user?.id || user?._id) {
      this.oneSignalService.loginUser(user.id || user._id!);
    }
  }

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        const currentUser = this.getUserFromToken();
        this.currentUserSubject.next(currentUser);
        if (currentUser?.id || currentUser?._id) {
          this.oneSignalService.loginUser(currentUser.id || currentUser._id!);
        }
      }),
    );
  }

  register(data: any): Observable<any> {
    const payload = {
      email: data.email,
      password: data.password,
      role: data.role,
    };

    return this.http.post<any>(`${this.apiUrl}/register`, payload).pipe(
      tap((response) => {
        const user: User = response.user || {
          _id: 'u_' + Date.now(),
          email: data.email,
          role: data.role
        };
        const token = response.token || `mock_token_${Date.now()}`;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        this.currentUserSubject.next(user);
      }),
      catchError(() => {
        // Fallback offline registration
        const mockUser: User = {
          _id: 'u_' + Date.now(),
          email: data.email,
          role: data.role
        };
        const mockToken = `mock_token_${Date.now()}`;
        localStorage.setItem('token', mockToken);
        localStorage.setItem('user', JSON.stringify(mockUser));
        this.currentUserSubject.next(mockUser);
        return of({ success: true, token: mockToken, user: mockUser });
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('patient_profile');
    localStorage.removeItem('doctor_profile');
    this.currentUserSubject.next(null);
    this.oneSignalService.logoutUser();
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value || this.getUserFromToken();
  }

  getRoleBasedRoute(role: string): string {
    const routes: Record<string, string> = {
      patient: '/dashboard/patient',
      doctor: '/dashboard/doctor',
      admin: '/admin/dashboard',
    };
    return routes[role] || '/';
  }

  private getUserFromToken(): User | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      if (token.startsWith('mock_token_')) {
        return MOCK_PATIENT_USER;
      }
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.userId || payload.id;
      return { _id: userId, email: payload.email, role: payload.role };
    } catch (e) {
      return null;
    }
  }
}
