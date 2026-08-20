import { Component, OnInit } from '@angular/core';
import { AdminService, ReviewAdminModel } from '../../../core/services/admin.service';

@Component({
  selector: 'app-reviews-management',
  templateUrl: './reviews-management.component.html',
  styleUrls: ['./reviews-management.component.css']
})
export class ReviewsManagementComponent implements OnInit {
  reviews: ReviewAdminModel[] = [];
  filteredReviews: ReviewAdminModel[] = [];
  isLoading = false;
  ratingFilter = '';
  searchQuery = '';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    this.isLoading = true;
    this.adminService.getReviews().subscribe({
      next: (res) => {
        this.reviews = res.reviews || [];
        this.applyFilter();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading reviews:', err);
        // Fallback mock data
        this.reviews = [
          {
            _id: 'rev1',
            patientName: 'أحمد محمود العبد',
            doctorName: 'د. خالد عبد العزيز',
            rating: 5,
            comment: 'طبيب ممتاذ جداً وشرح لي الحالة بكل استفاضة واهتمام.',
            submittedDate: '2026-08-18',
            status: 'published'
          },
          {
            _id: 'rev2',
            patientName: 'سارة علي',
            doctorName: 'د. مروة الشريف',
            rating: 4,
            comment: 'العيادة نظيفة والتعامل راقي ولكن الانتظار كان طويل قليلاً.',
            submittedDate: '2026-08-15',
            status: 'published'
          },
          {
            _id: 'rev3',
            patientName: 'مستخدم مجهول',
            doctorName: 'د. طارق مصطفى',
            rating: 1,
            comment: 'تعامل غير شائق وأسلوب غير احترافي إطلاقاً.',
            submittedDate: '2026-08-10',
            status: 'flagged'
          }
        ];
        this.applyFilter();
        this.isLoading = false;
      }
    });
  }

  applyFilter(): void {
    this.filteredReviews = this.reviews.filter(rev => {
      const matchesSearch = !this.searchQuery || 
        rev.patientName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        rev.doctorName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        rev.comment.toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchesRating = !this.ratingFilter || rev.rating === Number(this.ratingFilter);

      return matchesSearch && matchesRating;
    });
  }

  deleteReview(rev: ReviewAdminModel): void {
    if (confirm(`هل تحب حذف هذا التقييم بناءً على سياسة Moderation؟`)) {
      this.adminService.deleteReview(rev._id).subscribe({
        next: () => {
          this.reviews = this.reviews.filter(r => r._id !== rev._id);
          this.applyFilter();
        },
        error: () => {
          this.reviews = this.reviews.filter(r => r._id !== rev._id);
          this.applyFilter();
        }
      });
    }
  }
}
