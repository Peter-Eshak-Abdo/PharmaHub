import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DoctorService } from '../services/doctor.service';

@Component({
  selector: 'app-doctor-profile',
  templateUrl: './doctor-profile.component.html',
  styleUrls: ['./doctor-profile.component.css'],
})
export class DoctorProfileComponent implements OnInit {
  doctorForm!: FormGroup;
  doctorData: any = null;
  isEditMode: boolean = true;
  hasProfile: boolean = false;

  constructor(
    private doctorService: DoctorService,
    private fb: FormBuilder,
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.fetchDoctorProfile();
  }

  initForm() {
    this.doctorForm = this.fb.group({
      fullName: ['', Validators.required],
      specialization: ['', Validators.required],
      education: [''],
      qualifications: [''],
      yearsOfExperience: [0, Validators.min(0)],
      bio: [''],
      consultationFeeSnapshot: [0, Validators.min(0)],
    });
  }

  fetchDoctorProfile() {
    this.doctorService.getDoctorProfile().subscribe({
      next: (res: any) => {
        const doctor = res?.data || res;
        if (doctor && doctor.fullName) {
          this.doctorData = doctor;
          this.doctorForm.patchValue(doctor);
          this.isEditMode = false;
          this.hasProfile = true;
        }
      },
      error: (err) => {
        this.hasProfile = false;
        this.isEditMode = true;
      },
    });
  }

  onSubmit() {
    if (this.doctorForm.invalid) return;

    const request$ = this.hasProfile
      ? this.doctorService.updateDoctorProfile(this.doctorForm.value)
      : this.doctorService.createDoctorProfile(this.doctorForm.value);

    request$.subscribe({
      next: (res: any) => {
        const doctor = res?.data || res?.user || res;
        this.doctorData = doctor;
        if (doctor) {
          this.doctorForm.patchValue(doctor);
        }
        this.isEditMode = false;
        this.hasProfile = true;
      },
      error: (err) => console.error('Error saving profile', err),
    });
  }

  toggleEditMode() {
    this.isEditMode = true;
  }
}
