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
  isEditMode: boolean = false;
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
        if (doctor) {
          this.doctorData = doctor;
          this.doctorForm.patchValue(doctor);
          this.isEditMode = false;
          this.hasProfile = true;
        }
      },
      error: (err) => {
        console.error('Error loading doctor profile:', err);
      },
    });
  }

  onSubmit() {
    if (this.doctorForm.invalid) return;

    this.doctorService.updateDoctorProfile(this.doctorForm.value).subscribe({
      next: (res: any) => {
        const doctor = res?.data || res?.user || res;
        this.doctorData = doctor;
        if (doctor) {
          this.doctorForm.patchValue(doctor);
        }
        this.isEditMode = false;
        this.hasProfile = true;
        alert('تم حفظ التعديلات بنجاح');
      },
      error: (err) => {
        console.error('Error saving profile', err);
        alert('حدث خطأ أثناء حفظ التعديلات');
      },
    });
  }

  toggleEditMode() {
    this.isEditMode = true;
  }
}

