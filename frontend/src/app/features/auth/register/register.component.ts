import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { PatientService } from '../../profiles/services/patient.service';
import { DoctorService } from '../../profiles/services/doctor.service';

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
  loading = false;
  step = 1;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private patientService: PatientService,
    private doctorService: DoctorService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['patient', Validators.required],
      fullName: ['', Validators.required],
      // Patient Fields
      phoneNumber: [''],
      age: [''],
      gender: [''],
      address: [''],
      occupation: [''],
      companyName: [''],
      // Doctor Fields
      specialization: [''],
      yearsOfExperience: [0],
      consultationFeeSnapshot: [0],
      education: [''],
      qualifications: [''],
      bio: [''],
    });

    this.updateRoleValidators('patient');
  }

  get f() {
    return this.registerForm.controls;
  }

  setRole(role: string): void {
    this.registerForm.patchValue({ role });
    this.updateRoleValidators(role);
  }

  private updateRoleValidators(role: string): void {
    const phoneControl = this.registerForm.get('phoneNumber');
    const ageControl = this.registerForm.get('age');
    const genderControl = this.registerForm.get('gender');
    const specControl = this.registerForm.get('specialization');

    if (role === 'patient') {
      phoneControl?.setValidators([Validators.required]);
      ageControl?.setValidators([Validators.required, Validators.min(0), Validators.max(120)]);
      genderControl?.setValidators([Validators.required]);
      specControl?.clearValidators();
    } else if (role === 'doctor') {
      phoneControl?.clearValidators();
      ageControl?.clearValidators();
      genderControl?.clearValidators();
      specControl?.setValidators([Validators.required]);
    } else {
      phoneControl?.clearValidators();
      ageControl?.clearValidators();
      genderControl?.clearValidators();
      specControl?.clearValidators();
    }

    phoneControl?.updateValueAndValidity();
    ageControl?.updateValueAndValidity();
    genderControl?.updateValueAndValidity();
    specControl?.updateValueAndValidity();
  }

  nextStep(): void {
    this.submitted = true;
    this.errorMessage = '';

    const emailValid = !this.registerForm.get('email')?.invalid;
    const passwordValid = !this.registerForm.get('password')?.invalid;
    const fullNameValid = !this.registerForm.get('fullName')?.invalid;

    if (!emailValid || !passwordValid || !fullNameValid) {
      return;
    }

    this.submitted = false;
    this.step = 2;
  }

  prevStep(): void {
    this.errorMessage = '';
    this.step = 1;
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';

    if (this.registerForm.invalid) return;

    this.loading = true;
    const formVal = this.registerForm.value;

    this.authService.register({
      email: formVal.email,
      password: formVal.password,
      role: formVal.role,
    }).subscribe({
      next: () => {
        const role = formVal.role;
        if (role === 'patient') {
          const patientPayload = {
            fullName: formVal.fullName,
            phoneNumber: formVal.phoneNumber,
            age: Number(formVal.age),
            gender: formVal.gender,
            address: formVal.address || '',
            occupation: formVal.occupation || '',
            companyName: formVal.companyName || '',
          };

          this.patientService.createPatientProfile(patientPayload).subscribe({
            next: () => {
              this.loading = false;
              this.router.navigate(['/doctors']);
            },
            error: (err) => {
              this.loading = false;
              console.error('Error creating patient profile:', err);
              this.router.navigate(['/doctors']);
            }
          });
        } else if (role === 'doctor') {
          const doctorPayload = {
            fullName: formVal.fullName,
            specialization: formVal.specialization,
            yearsOfExperience: Number(formVal.yearsOfExperience) || 0,
            consultationFeeSnapshot: Number(formVal.consultationFeeSnapshot) || 0,
            education: formVal.education || '',
            qualifications: formVal.qualifications || '',
            bio: formVal.bio || '',
          };

          this.doctorService.createDoctorProfile(doctorPayload).subscribe({
            next: () => {
              this.loading = false;
              this.router.navigate(['/schedule']);
            },
            error: (err) => {
              this.loading = false;
              console.error('Error creating doctor profile:', err);
              this.router.navigate(['/schedule']);
            }
          });
        } else {
          this.loading = false;
          this.router.navigate(['/auth/login']);
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('Registration error:', err);
        this.errorMessage = err.error?.message || 'حدث خطأ أثناء إنشاء الحساب';
      },
    });
  }
}


