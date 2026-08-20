import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DoctorService } from '../services/doctor.service';
import { LanguageService } from 'src/app/core/services/language.service';

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

  get isRtl(): boolean {
    return this.languageService.isRtl();
  }

  constructor(
    private doctorService: DoctorService,
    private fb: FormBuilder,
    private languageService: LanguageService,
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
          this.doctorForm.patchValue({
            fullName: doctor.fullName || '',
            specialization: doctor.specialization || '',
            education: doctor.education || '',
            qualifications: doctor.qualifications || '',
            yearsOfExperience: doctor.yearsOfExperience || doctor.yearsExperience || 0,
            bio: doctor.bio || '',
            consultationFeeSnapshot: doctor.consultationFeeSnapshot || doctor.consultationFee || 0,
          });
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

    const val = this.doctorForm.value;
    const payload = {
      ...val,
      yearsExperience: val.yearsOfExperience,
      consultationFee: val.consultationFeeSnapshot
    };

    this.doctorService.updateDoctorProfile(payload).subscribe({
      next: (res: any) => {
        const doctor = res?.data || res?.user || res;
        this.doctorData = { ...this.doctorData, ...doctor };
        this.doctorForm.patchValue(this.doctorData);
        this.isEditMode = false;
        this.hasProfile = true;
        alert('تم حفظ بيانات الملف الشخصي للطبيب بنجاح!');
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
