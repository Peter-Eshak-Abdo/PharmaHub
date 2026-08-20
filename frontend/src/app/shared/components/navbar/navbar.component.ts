import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  currentUser: User | null = null;
  currentUrl: string = '';
  isMobileMenuOpen = false;

  constructor(private authService: AuthService, private router: Router) {
    this.currentUrl = this.router.url;
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentUrl = event.urlAfterRedirects || event.url;
        this.isMobileMenuOpen = false;
      });
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  get isDoctor(): boolean {
    const role = this.currentUser?.role || localStorage.getItem('role');
    return role === 'doctor';
  }

  get isPatient(): boolean {
    const role = this.currentUser?.role || localStorage.getItem('role');
    return role === 'patient';
  }

  get isAdmin(): boolean {
    const role = this.currentUser?.role || localStorage.getItem('role');
    return role === 'admin';
  }

  get isAuthPage(): boolean {
    return this.currentUrl.startsWith('/auth');
  }

  logout(): void {
    this.authService.logout(); 
    this.router.navigate(['/auth/login']);
  }
}