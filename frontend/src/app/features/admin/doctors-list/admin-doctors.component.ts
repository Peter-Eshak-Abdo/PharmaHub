import { Component, OnInit } from '@angular/core';
import { AdminService } from '../services/admin.service';

@Component({
  selector: 'app-admin-doctors',
  templateUrl: './admin-doctors.component.html',
  styleUrls: ['./admin-doctors.component.css']
})
export class AdminDoctorsComponent implements OnInit {
  doctors: any[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  editingDoctor: any = null;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadDoctors();
  }

  loadDoctors(): void {
    this.isLoading = true;
    this.clearMessages();
    this.adminService.getDoctors().subscribe({
      next: (res: any) => {
        this.doctors = res.data || res || [];
        this.isLoading = false;
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'فشل في تحميل قائمة الأطباء';
      }
    });
  }

  startEdit(doc: any): void {
    this.clearMessages();
    this.editingDoctor = { ...doc };
  }

  cancelEdit(): void {
    this.editingDoctor = null;
  }

  saveEdit(): void {
    if (!this.editingDoctor) return;
    this.clearMessages();

    this.adminService.updateDoctor(this.editingDoctor._id, {
      fullName: this.editingDoctor.fullName,
      specialization: this.editingDoctor.specialization,
      yearsOfExperience: this.editingDoctor.yearsOfExperience,
      consultationFeeSnapshot: this.editingDoctor.consultationFeeSnapshot,
      education: this.editingDoctor.education,
      qualifications: this.editingDoctor.qualifications,
      bio: this.editingDoctor.bio
    }).subscribe({
      next: () => {
        this.successMessage = 'تم تعديل بيانات الطبيب بنجاح';
        this.editingDoctor = null;
        this.loadDoctors();
      },
      error: (err: any) => {
        this.errorMessage = err.error?.message || 'فشل في تعديل بيانات الطبيب';
      }
    });
  }

  deleteDoctor(id: string, name: string): void {
    if (!confirm(`هل أنت متأكد من حذف الطبيب "${name}" وجميع بيانات حسابه؟`)) {
      return;
    }
    this.clearMessages();
    this.adminService.deleteDoctor(id).subscribe({
      next: () => {
        this.successMessage = 'تم حذف حساب الطبيب بنجاح';
        this.loadDoctors();
      },
      error: (err: any) => {
        this.errorMessage = err.error?.message || 'فشل في حذف الطبيب';
      }
    });
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}
