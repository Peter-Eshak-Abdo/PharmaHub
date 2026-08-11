import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  email = '';
  password = '';
  role = 'patient';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    this.authService.register({ email: this.email, password: this.password, role: this.role }).subscribe({
      next: () => {
        if (this.role === 'doctor') this.router.navigate(['/doctor-dashboard']);
        else this.router.navigate(['/appointments']);
      },
      error: (err) => console.error(err)
    });
  }
}