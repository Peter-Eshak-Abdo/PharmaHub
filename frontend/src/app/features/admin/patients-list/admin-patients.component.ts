import { Component, OnInit } from '@angular/core';
import { AdminService } from '../services/admin.service';

@Component({
  selector: 'app-admin-patients',
  templateUrl: './admin-patients.component.html',
  styleUrls: ['./admin-patients.component.css']
})
export class AdminPatientsComponent implements OnInit {
  patients: any[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  editingPatient: any = null;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.isLoading = true;
    this.clearMessages();
    this.adminService.getPatients().subscribe({
      next: (res: any) => {
        this.patients = res.data || res || [];
        this.isLoading = false;
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'فشل في تحميل قائمة المرضى';
      }
    });
  }

  startEdit(p: any): void {
    this.clearMessages();
    this.editingPatient = { ...p };
  }

  cancelEdit(): void {
    this.editingPatient = null;
  }

  saveEdit(): void {
    if (!this.editingPatient) return;
    this.clearMessages();

    this.adminService.updatePatient(this.editingPatient._id, {
      fullName: this.editingPatient.fullName,
      phoneNumber: this.editingPatient.phoneNumber,
      age: this.editingPatient.age,
      gender: this.editingPatient.gender,
      address: this.editingPatient.address,
      occupation: this.editingPatient.occupation,
      companyName: this.editingPatient.companyName
    }).subscribe({
      next: () => {
        this.successMessage = 'تم تعديل بيانات المريض بنجاح';
        this.editingPatient = null;
        this.loadPatients();
      },
      error: (err: any) => {
        this.errorMessage = err.error?.message || 'فشل في تعديل بيانات المريض';
      }
    });
  }

  deletePatient(id: string, name: string): void {
    if (!confirm(`هل أنت متأكد من حذف المريض "${name}" وجميع بيانات حسابه؟`)) {
      return;
    }
    this.clearMessages();
    this.adminService.deletePatient(id).subscribe({
      next: () => {
        this.successMessage = 'تم حذف حساب المريض بنجاح';
        this.loadPatients();
      },
      error: (err: any) => {
        this.errorMessage = err.error?.message || 'فشل في حذف المريض';
      }
    });
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}
