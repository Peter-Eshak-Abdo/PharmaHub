import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { PatientService } from '../services/patient.service';
import { LanguageService } from 'src/app/core/services/language.servics';

@Component({
  selector: 'app-patient-profile',
  templateUrl: './patient-profile.component.html',
  styleUrls: ['./patient-profile.component.css'],
})
export class PatientProfileComponent implements OnInit {
  profileForm!: FormGroup;
  patientData: any = null;
  isEditMode: boolean = false;
  hasProfile: boolean = false;

  get isRtl(): boolean {
    return this.languageService.isRtl();
  }

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private translate: TranslateService,
    private languageService: LanguageService,
  ) {}

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      fullName: ['', Validators.required],
      address: [''],
      age: ['', [Validators.min(0), Validators.max(120)]],
      gender: [''],
      phoneNumber: [''],
      occupation: [''],
      companyName: [''],
    });

    this.loadProfile();
  }

  loadProfile(): void {
    this.patientService.getPatientProfile().subscribe({
      next: (res: any) => {
        const patient = res?.data || res;
        if (patient) {
          this.patientData = patient;
          this.profileForm.patchValue(patient);
          this.isEditMode = false;
          this.hasProfile = true;
        }
      },
      error: (err) => {
        console.error('Error loading profile', err);
      },
    });
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      this.patientService.updatePatientProfile(this.profileForm.value).subscribe({
        next: (res: any) => {
          const patient = res?.data || res?.user || res;
          this.patientData = patient;
          if (patient) {
            this.profileForm.patchValue(patient);
          }
          this.isEditMode = false;
          this.hasProfile = true;
          alert(this.translate.instant('PROFILES.PATIENT_PROFILE.SAVE_SUCCESS'));
        },
        error: (err: any) => {
          console.error('Error updating profile:', err);
          alert('حدث خطأ أثناء حفظ التعديلات');
        },
      });
    }
  }

  toggleEditMode(): void {
    this.isEditMode = true;
  }
}

