import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppointmentService } from '../services/appointment.service';
import { ConsultationType } from '../models/appointment.model';

@Component({
  selector: 'app-booking-form',
  templateUrl: './booking-form.component.html',
  styleUrls: ['./booking-form.component.css'],
})
export class BookingFormComponent implements OnInit {
  step = 1; // Step 1: Date/Time, Step 2: Details/Confirm
  isBookedSuccess = false;

  doctorId!: string;
  doctorName!: string;
  doctorSpecialization!: string;
  doctorFee!: number;

  selectedDate = '';
  selectedTime = '';
  availableSlots: string[] = [];
  slotDuration = 30;

  form!: FormGroup;

  isLoadingSlots = false;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  confirmedAppointment: any = null;

  minDate = new Date().toISOString().split('T')[0];

  consultationTypes: {
    value: ConsultationType;
    label: string;
    icon: string;
  }[] = [
    { value: 'In-Clinic', label: 'زيارة العيادة', icon: 'local_hospital' },
    { value: 'Online', label: 'استشارة أونلاين', icon: 'videocam' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private fb: FormBuilder,
    private appointmentService: AppointmentService,
  ) {}

  ngOnInit(): void {
    this.doctorId =
      this.route.snapshot.queryParamMap.get('doctorId') ||
      this.route.snapshot.paramMap.get('doctorId') ||
      this.route.snapshot.paramMap.get('id') ||
      '';
    this.doctorName =
      this.route.snapshot.queryParamMap.get('doctorName') || 'الطبيب';
    this.doctorSpecialization =
      this.route.snapshot.queryParamMap.get('specialization') || '';
    this.doctorFee = Number(this.route.snapshot.queryParamMap.get('fee') || 0);

    if (!this.doctorId) {
      this.errorMessage = 'معرف الطبيب مفقود، يرجى العودة واختيار طبيب من قائمة الأطباء';
      return;
    }

    this.form = this.fb.group({
      consultationType: ['In-Clinic', Validators.required],
      reasonForVisit: ['', [Validators.maxLength(500)]],
    });
  }

  onDateChange(date: string): void {
    this.selectedDate = date;
    this.selectedTime = '';
    this.availableSlots = [];
    this.errorMessage = '';

    if (!date) return;

    this.isLoadingSlots = true;
    this.appointmentService.getAvailableSlots(this.doctorId, date).subscribe({
      next: (res) => {
        this.availableSlots = res.data || [];
        this.slotDuration = res.slotDuration || 30;
        this.isLoadingSlots = false;
        if (!this.availableSlots || this.availableSlots.length === 0) {
          this.errorMessage = res.message || 'لا توجد مواعيد متاحة في هذا اليوم لهذا الطبيب';
        }
      },
      error: (err) => {
        this.errorMessage = err.message || 'لا توجد مواعيد متاحة في هذا اليوم';
        this.isLoadingSlots = false;
      },
    });
  }

  selectTime(time: string): void {
    this.selectedTime = time;
  }

  goToStep2(): void {
    if (!this.selectedDate || !this.selectedTime) {
      this.errorMessage = 'يرجى اختيار التاريخ والوقت';
      return;
    }
    this.errorMessage = '';
    this.step = 2;
  }

  goBack(): void {
    if (this.step === 2) {
      this.step = 1;
    } else if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/profiles/doctor-list']);
    }
  }

  goToAppointments(): void {
    this.router.navigate(['/appointments/patient']);
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  formatTime(time: string): string {
    if (!time) return '';
    const [h, m] = time.split(':').map(Number);
    const period = h < 12 ? 'ص' : 'م';
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${h12}:${String(m).padStart(2, '0')} ${period}`;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('ar-EG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  onSubmit(): void {
    if (this.form.invalid || !this.selectedDate || !this.selectedTime) {
      this.form.markAllAsTouched();
      this.errorMessage = 'يرجى إكمال جميع الحقول المطلوبة';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.appointmentService
      .createAppointment({
        doctorId: this.doctorId,
        appointmentDate: this.selectedDate,
        appointmentTime: this.selectedTime,
        consultationType: this.form.value.consultationType,
        reasonForVisit: this.form.value.reasonForVisit || undefined,
      })
      .subscribe({
        next: (res) => {
          this.isSubmitting = false;
          this.confirmedAppointment = res.data || {
            doctorName: this.doctorName,
            appointmentDate: this.selectedDate,
            appointmentTime: this.selectedTime,
          };
          this.isBookedSuccess = true;
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorMessage = err.message || 'حدث خطأ أثناء حجز الموعد';
        },
      });
  }
}

