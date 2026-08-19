import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { PatientService } from '../../profiles/services/patient.service';
import { DoctorService } from '../../profiles/services/doctor.service';
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
  loading = false;
  step = 1;

  specializations: string[] = [
    'باطنة',
    'أطفال',
    'قلب',
    'جراحة',
    'عيون',
    'نساء وتوليد',
    'عظام',
  ];

  get isRtl(): boolean {
    return this.languageService.isRtl();
  }

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private patientService: PatientService,
    private doctorService: DoctorService,
    private router: Router,
    private languageService: LanguageService,
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d).+$/),
        ],
      ],
      role: ['patient', Validators.required],
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      // Patient Fields
      phoneNumber: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(010|011|012|015)\d{8}$/),
        ],
      ],
      age: ['', [Validators.required, Validators.min(0), Validators.max(120)]],
      gender: ['', Validators.required],
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

  getPhoneError(): string {
    const ctrl = this.registerForm.get('phoneNumber');
    if (ctrl?.errors?.['required']) return 'رقم الهاتف مطلوب';
    if (ctrl?.errors?.['pattern'])
      return 'رقم الهاتف يجب أن يكون 11 رقماً ويبدأ بـ 010/011/012/015';
    return '';
  }

  getPasswordError(): string {
    const ctrl = this.registerForm.get('password');
    if (ctrl?.errors?.['required']) return 'كلمة المرور مطلوبة';
    if (ctrl?.errors?.['minlength'])
      return 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
    if (ctrl?.errors?.['pattern'])
      return 'كلمة المرور يجب أن تحتوي على أحرف وأرقام معاً';
    return '';
  }

  getFullNameError(): string {
    const ctrl = this.registerForm.get('fullName');
    if (ctrl?.errors?.['required']) return 'الاسم الكامل مطلوب';
    if (ctrl?.errors?.['minlength'])
      return 'الاسم يجب ألا يقل عن 3 أحرف';
    return '';
  }

  getAgeError(): string {
    const ctrl = this.registerForm.get('age');
    if (ctrl?.errors?.['required']) return 'العمر مطلوب';
    if (ctrl?.errors?.['min'] || ctrl?.errors?.['max'])
      return 'العمر يجب أن يكون بين 0 و 120 سنة';
    return '';
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
      phoneControl?.setValidators([
        Validators.required,
        Validators.pattern(/^(010|011|012|015)\d{8}$/),
      ]);
      ageControl?.setValidators([
        Validators.required,
        Validators.min(0),
        Validators.max(120),
      ]);
      genderControl?.setValidators([Validators.required]);
      specControl?.clearValidators();
    } else if (role === 'doctor') {
      phoneControl?.clearValidators();
      ageControl?.clearValidators();
      genderControl?.clearValidators();
      specControl?.setValidators([
        Validators.required,
        Validators.pattern(/^(باطنة|أطفال|قلب|جراحة|عيون|نساء وتوليد|عظام)$/),
      ]);
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
              this.router.navigate(['/dashboard/patient']);
            },
            error: (err) => {
              this.loading = false;
              console.error('Error creating patient profile:', err);
              this.router.navigate(['/dashboard/patient']);
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
              this.router.navigate(['/dashboard/doctor']);
            },
            error: (err) => {
              this.loading = false;
              console.error('Error creating doctor profile:', err);
              this.router.navigate(['/dashboard/doctor']);
            }
          });
        } else if (role === 'admin') {
          this.loading = false;
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.loading = false;
          this.router.navigate(['/']);
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


