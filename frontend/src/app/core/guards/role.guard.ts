import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    let userRole: string | null = null;
    this.authService.currentUser$.subscribe(user => {
       if (user) userRole = user.role;
    }).unsubscribe();

    // Route data uses the key 'role' (e.g. data: { role: 'patient' })
    const expectedRole = route.data['role'];

    if (userRole === expectedRole) {
      return true;
    }

    // Redirect based on actual role — never fall through to login for authenticated users
    if (userRole === 'doctor') {
      this.router.navigate(['/appointments/doctor']);
    } else if (userRole === 'patient') {
      this.router.navigate(['/appointments/patient']);
    } else if (userRole === 'admin') {
      this.router.navigate(['/auth/login']);
    } else {
      this.router.navigate(['/auth/login']);
    }

    return false;
  }
}