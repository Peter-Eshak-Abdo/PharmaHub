import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        let userRole = null;
        this.authService.currentUser$.subscribe(u => userRole = u?.role).unsubscribe();
        
        if (userRole === 'doctor') this.router.navigate(['/doctor-dashboard']);
        else if (userRole === 'patient') this.router.navigate(['/appointments']);
        else if (userRole === 'admin') this.router.navigate(['/admin/dashboard']);
      },
      error: (err) => console.error(err)
    });
  }
}