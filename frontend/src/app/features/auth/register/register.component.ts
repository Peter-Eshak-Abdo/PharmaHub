import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LanguageService } from 'src/app/core/services/language.servics';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  submitted = false;
  hidePassword = true;
  errorMessage = '';

  get isRtl(): boolean {
    return this.languageService.isRtl();
  }

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private languageService: LanguageService,
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['patient', Validators.required],
    });
  }

  get f() {
    return this.registerForm.controls;
  }

  setRole(role: string): void {
    this.registerForm.patchValue({ role });
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';
    if (this.registerForm.invalid) return;

    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        const role = this.registerForm.value.role;
      if (this.authService.isLoggedIn()) {
          if (role === 'doctor') {
            this.router.navigate(['/schedule']); // توجيه الطبيب لجدول عمله
          } else {
            this.router.navigate(['/doctors']); // توجيه المريض لقائمة الأطباء
          }
      }
        else {
          this.router.navigate(['/auth/login']);
        }
      },
      error: (err) => {
        console.error('Registration error:', err);
        this.errorMessage = err.error?.message || 'حدث خطأ أثناء إنشاء الحساب';
      },
    });
  }
}
