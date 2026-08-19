import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    let userRole: string | null = null;
    this.authService.currentUser$.subscribe((user) => {
      if (user) userRole = user.role;
    }).unsubscribe();

    if (!userRole) {
      const storedRole = localStorage.getItem('role');
      if (storedRole) {
        userRole = storedRole;
      }
    }

    if (!this.authService.isLoggedIn() || !userRole) {
      return this.router.createUrlTree(['/auth/login']);
    }

    const requiredRole = route.data['role'];
    const requiredRoles: string[] = route.data['roles'] || (requiredRole ? [requiredRole] : []);

    if (requiredRoles.length === 0 || requiredRoles.includes(userRole)) {
      return true;
    }

    return this.router.createUrlTree(['/unauthorized']);
  }
}