import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    let userRole = null;
    this.authService.currentUser$.subscribe(user => {
       if(user) userRole = user.role;
    }).unsubscribe();
    
    const expectedRole = route.data['expectedRole'];
    if (userRole === expectedRole) {
      return true;
    }
    
  
    if (userRole === 'doctor') this.router.navigate(['/doctor-dashboard']);
    else if (userRole === 'patient') this.router.navigate(['/appointments']);
    else if (userRole === 'admin') this.router.navigate(['/admin/dashboard']);
    else this.router.navigate(['/auth/login']);
    this.router.navigate(['/auth/login']);
    return false;
  }
}