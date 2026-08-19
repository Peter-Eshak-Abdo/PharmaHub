import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  submitted = false;
  hidePassword = true;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get f() { return this.loginForm.controls; }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';
    
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.loading = false;
        localStorage.setItem('token', response.token);
        localStorage.setItem('role', response.role);
        
        let userRole = response.role || null;
        if (!userRole) {
          this.authService.currentUser$
            .subscribe((u) => (userRole = u?.role))
            .unsubscribe();
        }

        if (userRole === 'doctor') {
          this.router.navigate(['/dashboard/doctor']);
        } else if (userRole === 'patient') {
          this.router.navigate(['/dashboard/patient']);
        } else if (userRole === 'admin') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('LOGIN ERROR:', err);
        this.errorMessage = err.error?.message || 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
      },
    });
  }
}

