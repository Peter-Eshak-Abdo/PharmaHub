import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReviewService } from '../services/review.service';
import { AppointmentService } from '../services/appointment.service';
import { Appointment } from '../models/appointment.model';

@Component({
  selector: 'app-review-form',
  templateUrl: './review-form.component.html',
  styleUrls: ['./review-form.component.css'],
})
export class ReviewFormComponent implements OnInit {
  appointmentId!: string;
  appointment: Appointment | null = null;

  form!: FormGroup;
  hoveredStar = 0;

  isLoading = false;
  isLoadingAppt = true;
  errorMessage = '';
  successMessage = '';
  alreadyReviewed = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private reviewService: ReviewService,
    private appointmentService: AppointmentService,
  ) {}

  ngOnInit(): void {
    this.appointmentId =
      this.route.snapshot.paramMap.get('appointmentId') || '';

    this.form = this.fb.group({
      rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: ['', Validators.maxLength(1000)],
    });

    if (this.appointmentId) {
      this.loadAppointment();
      this.checkExistingReview();
    } else {
      this.errorMessage = 'معرف الموعد مفقود';
      this.isLoadingAppt = false;
    }
  }

  loadAppointment(): void {
    this.appointmentService.getAppointmentById(this.appointmentId).subscribe({
      next: (appt) => {
        if (appt.status !== 'Completed') {
          this.errorMessage = 'يمكن تقييم الزيارات المكتملة فقط';
        }
        this.appointment = appt;
        this.isLoadingAppt = false;
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.isLoadingAppt = false;
      },
    });
  }

  checkExistingReview(): void {
    this.reviewService.getReviewByAppointment(this.appointmentId).subscribe({
      next: (review) => {
        if (review) {
          this.alreadyReviewed = true;
          this.errorMessage = 'لقد قمت بتقييم هذا الموعد بالفعل';
        }
      },
    });
  }

  setRating(star: number): void {
    this.form.get('rating')?.setValue(star);
  }

  getDoctorName(): string {
    if (!this.appointment) return '';
    return typeof this.appointment.doctorId === 'object'
      ? this.appointment.doctorId.fullName
      : '';
  }

  getRatingLabel(rating: number): string {
    const labels = ['', 'ضعيف', 'مقبول', 'جيد', 'جيد جداً', 'ممتاز'];
    return labels[rating] || '';
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      if (this.form.get('rating')?.value === 0) {
        this.errorMessage = 'يرجى اختيار تقييم بالنجوم';
      }
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.reviewService
      .createReview({
        appointmentId: this.appointmentId,
        rating: this.form.value.rating,
        comment: this.form.value.comment || undefined,
      })
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          this.successMessage = res.message;
          setTimeout(
            () => this.router.navigate(['/appointments/patient']),
            2500,
          );
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.message;
        },
      });
  }
}
