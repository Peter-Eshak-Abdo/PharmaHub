import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

import { OneSignalService } from './onesignal.service';

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
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
      }),
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.userId || payload.id;
      return { _id: userId, email: payload.email, role: payload.role };
    } catch (e) {
      return null;
    }
  }
}
