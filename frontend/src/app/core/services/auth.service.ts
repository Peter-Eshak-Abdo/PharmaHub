import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  // private apiUrl = '/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(
    this.getUserFromToken(),
  );
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        localStorage.setItem('token', response.token);
        this.currentUserSubject.next(this.getUserFromToken());
      }),
    );
  }

  register(data: any): Observable<any> {
    const payload = {
      email: data.email,
      password_hash: data.password,
      role: data.role,
    };
    return this.http.post<any>(`${this.apiUrl}/register`, payload).pipe(
      tap((response) => {
        if (response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
        }
        this.currentUserSubject.next(this.getUserFromToken());
      }),
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
  private getUserFromToken(): User | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return { _id: payload.userId, email: payload.email, role: payload.role };
    } catch (e) {
      return null;
    }
  }
}
