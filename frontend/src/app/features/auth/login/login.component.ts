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
    console.log('SUBMIT CLICKED - form valid:', this.loginForm.valid, 'values:', this.loginForm.value);
    this.submitted = true;
    if (this.loginForm.invalid) {
      console.log('FORM INVALID - stopping here');
      return;
    }
    console.log('CALLING authService.login...');
    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        console.log('LOGIN SUCCESS', response);
        // const userRole = response.user.role;
        localStorage.setItem('token', response.token);
        localStorage.setItem('role', response.role);
        
        let userRole = null;
        this.authService.currentUser$
          .subscribe((u) => (userRole = u?.role))
          .unsubscribe();

        if (userRole === 'doctor') {
          console.log("Your are a Doctor")
          this.router.navigate(['/profiles/doctor-profile']);
        }
        else if (userRole === 'patient'){
          console.log("Your are a Patient")
          this.router.navigate(['/profiles/patient-profile']);
        }
        else if (userRole === 'admin'){
          console.log("Your are a Admin")
          this.router.navigate(['/admin-dashboard']);
        }
      },
      error: (err) => {
        console.log('LOGIN ERROR:', err);
      },
    });
  }
}
