import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PatientService } from '../services/patient.service';

@Component({
  selector: 'app-patient-profile',
  templateUrl: './patient-profile.component.html',
  styleUrls: ['./patient-profile.component.css'],
})
export class PatientProfileComponent implements OnInit {
  profileForm!: FormGroup;
  patientData: any = null;
  isEditMode: boolean = true;
  hasProfile: boolean = false;

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
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
        if (patient && patient.fullName) {
          this.patientData = patient;
          this.profileForm.patchValue(patient);
          this.isEditMode = false;
          this.hasProfile = true;
        }
      },
      error: (err) => {
      if (err.status === 404) {
        this.hasProfile = false;
        this.isEditMode = true;
      } else {
        console.error('Error loading profile', err);
      }
      },
    });
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      const request$ = this.hasProfile
        ? this.patientService.updatePatientProfile(this.profileForm.value)
        : this.patientService.createPatientProfile(this.profileForm.value);

      request$.subscribe({
        next: (res: any) => {
          const patient = res?.data || res?.user || res;
          this.patientData = patient;
          if (patient) {
            this.profileForm.patchValue(patient);
          }
          this.isEditMode = false;
          this.hasProfile = true;
          alert('تم الحفظ بنجاح');
        },
        error: (err:any) => console.error(err),
      });
    }
  }

  toggleEditMode(): void {
    this.isEditMode = true;
  }
}
