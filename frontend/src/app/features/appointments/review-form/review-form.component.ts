// features/appointments/review-form/review-form.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ReviewService } from '../services/review.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-review-form',
  templateUrl: './review-form.component.html',
  styleUrls: ['./review-form.component.css'],
})
export class ReviewFormComponent {
  @Input() appointmentId!: string;
  @Output() reviewSubmitted = new EventEmitter<void>();
  reviewForm: FormGroup;
  showForm = false;

  constructor(
    private fb: FormBuilder,
    private reviewService: ReviewService,
  ) {
    this.reviewForm = this.fb.group({
      rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: [''],
    });
  }

  submitReview(): void {
    if (this.reviewForm.valid) {
      this.reviewService
        .addReview(this.appointmentId, this.reviewForm.value)
        .subscribe(() => {
          this.showForm = false;
          this.reviewSubmitted.emit();
        });
    }
  }
}
