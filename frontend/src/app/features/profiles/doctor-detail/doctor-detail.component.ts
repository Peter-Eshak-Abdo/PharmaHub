import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DoctorService } from '../services/doctor.service';
import { LanguageService } from 'src/app/core/services/language.service';

@Component({
  selector: 'app-doctor-detail',
  templateUrl: './doctor-detail.component.html',
  styleUrls: ['./doctor-detail.component.css']
})
export class DoctorDetailComponent implements OnInit {
  doctor: any;
  reviews: any[] = [];
  
  newReview = {
    patientName: '',
    rating: 5,
    comment: ''
  };
  isSubmittingReview: boolean = false;
  reviewSuccessMessage: string = '';

  get isRtl(): boolean {
    return this.languageService.isRtl();
  }

  constructor(
    private route: ActivatedRoute,
    private doctorService: DoctorService,
    private languageService: LanguageService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const doctorId = params.get('id');
      if (doctorId) {
        this.loadDoctor(doctorId);
        this.loadReviews(doctorId);
      } else {
        this.loadDoctor('doc_1');
        this.loadReviews('doc_1');
      }
    });
  }

  loadDoctor(id: string): void {
    this.doctorService.getDoctorById(id).subscribe({
      next: (res: any) => {
        this.doctor = res?.data || res;
      },
      error: () => {
        this.doctor = null;
      },
    });
  }

  loadReviews(id: string): void {
    this.doctorService.getDoctorReviews(id).subscribe({
      next: (res: any) => {
        this.reviews = Array.isArray(res) ? res : (res?.reviews || []);
      },
      error: () => {
        this.reviews = [];
      }
    });
  }

  setRating(stars: number): void {
    this.newReview.rating = stars;
  }

  submitReview(): void {
    if (!this.newReview.comment.trim()) return;

    this.isSubmittingReview = true;
    const docId = this.doctor?._id || 'doc_1';

    this.doctorService.addDoctorReview({
      doctorId: docId,
      patientName: this.newReview.patientName || 'مريض منصة طمني',
      rating: this.newReview.rating,
      comment: this.newReview.comment
    }).subscribe({
      next: (res: any) => {
        this.isSubmittingReview = false;
        this.reviewSuccessMessage = 'شكراً لك! تم إضافة تقييمك وملاحظاتك بنجاح.';
        if (res?.reviews) {
          this.reviews = res.reviews;
        } else {
          this.loadReviews(docId);
        }
        this.newReview = { patientName: '', rating: 5, comment: '' };
        setTimeout(() => this.reviewSuccessMessage = '', 4000);
      },
      error: (err) => {
        this.isSubmittingReview = false;
        console.error('Error adding review:', err);
      }
    });
  }
}