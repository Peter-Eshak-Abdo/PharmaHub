import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-doctor-profile',
  templateUrl: './doctor-profile.component.html',
  styleUrls: ['./doctor-profile.component.css']
})
export class DoctorProfileComponent implements OnInit {
  doctorForm!: FormGroup;
  doctorData: any = null;
  isEditMode: boolean = true;

  constructor(private http: HttpClient, private fb: FormBuilder) {
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
      consultationFeeSnapshot: [0, Validators.min(0)]
    });
  }

  fetchDoctorProfile() {
    this.http.get(`${environment.apiUrl}/doctor/profile`).subscribe({
      next: (res: any) => {
        if (res && res.fullName) {
          this.doctorData = res;
          this.doctorForm.patchValue(res);
          this.isEditMode = false;
        }
      },
      error: (err) => {
        console.error('No profile found or error fetching profile', err);
        this.isEditMode = true;
      }
    });
  }

  onSubmit() {
    if (this.doctorForm.invalid) return;

    this.http.put(`${environment.apiUrl}/doctor/profile`, this.doctorForm.value).subscribe({
      next: (res: any) => {
        this.doctorData = res;
        this.isEditMode = false;
      },
      error: (err) => console.error('Error saving profile', err)
    });
  }

  toggleEditMode() {
    this.isEditMode = true;
  }
}
