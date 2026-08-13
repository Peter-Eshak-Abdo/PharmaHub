import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PatientService } from '../services/patient.service';

@Component({
  selector: 'app-patient-profile',
  templateUrl: './patient-profile.component.html',
  styleUrls: ['./patient-profile.component.css']
})
export class PatientProfileComponent implements OnInit {
  profileForm!: FormGroup;
  patientData: any = null;
  isEditMode: boolean = true;

  constructor(private fb: FormBuilder, private patientService: PatientService) {}

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      fullName: ['', Validators.required],
      address: [''],
      age: ['', [Validators.min(0), Validators.max(120)]],
      gender: [''],
      phoneNumber: [''],
      occupation: [''],
      companyName: ['']
    });

    this.loadProfile();
  }

  loadProfile(): void {
    this.patientService.getPatientProfile().subscribe({
      next: (data: any) => {
        if (data && data.fullName) {
          this.patientData = data;
          this.profileForm.patchValue(data);
          this.isEditMode = false;
        }
      },
      error: (err) => {
        console.error('Error fetching profile', err);
        this.isEditMode = true;
      }
    });
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      this.patientService.updatePatientProfile(this.profileForm.value).subscribe({
        next: (res: any) => {
          this.patientData = res && res.fullName ? res : this.profileForm.value;
          this.isEditMode = false;
          alert('تم التحديث بنجاح');
        },
        error: (err) => console.error(err)
      });
    }
  }

  toggleEditMode(): void {
    this.isEditMode = true;
  }
}
