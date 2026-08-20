import { Component, OnInit } from '@angular/core';
import { AdminService, SpecializationModel } from '../../../core/services/admin.service';

@Component({
  selector: 'app-specializations-management',
  templateUrl: './specializations-management.component.html',
  styleUrls: ['./specializations-management.component.css']
})
export class SpecializationsManagementComponent implements OnInit {
  specializations: SpecializationModel[] = [];
  isLoading = false;
  
  // Modal State
  isModalOpen = false;
  isEditMode = false;

  specForm: SpecializationModel = {
    _id: '',
    name: '',
    nameAr: '',
    icon: 'medical_services',
    description: '',
    doctorCount: 0,
    isActive: true
  };

  iconOptions = [
    { label: 'سماعة طبيب', icon: 'stethoscope' },
    { label: 'قلب / أوعية', icon: 'favorite' },
    { label: 'بشرة / جلدية', icon: 'face' },
    { label: 'عظام ومفاصل', icon: 'personal_injury' },
    { label: 'أسنان', icon: 'dentistry' },
    { label: 'عيون', icon: 'visibility' },
    { label: 'أطفال', icon: 'child_care' },
    { label: 'مخ وأعصاب', icon: 'psychology' }
  ];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadSpecializations();
  }

  loadSpecializations(): void {
    this.isLoading = true;
    this.adminService.getSpecializations().subscribe({
      next: (res) => {
        this.specializations = res || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading specializations:', err);
        // Fallback mock specializations
        this.specializations = [
          { _id: 'spec1', name: 'Cardiology', nameAr: 'أمراض القلب', icon: 'favorite', description: 'تخصص تشخيص وعلاج أمراض القلب والأوعية الدموية', doctorCount: 8, isActive: true },
          { _id: 'spec2', name: 'Dermatology', nameAr: 'الجلدية والتجميل', icon: 'face', description: 'العناية بالبشرة والأمراض الجلدية والعلاج بالليزر', doctorCount: 12, isActive: true },
          { _id: 'spec3', name: 'Orthopedics', nameAr: 'جراحة العظام', icon: 'personal_injury', description: 'علاج الكسور والمفاصل والعمود الفقري', doctorCount: 6, isActive: true },
          { _id: 'spec4', name: 'Pediatrics', nameAr: 'طب الأطفال', icon: 'child_care', description: 'رعاية صحة الأطفال منذ الولادة حتى سن المراهقة', doctorCount: 10, isActive: true },
          { _id: 'spec5', name: 'Dentistry', nameAr: 'طب الأسنان', icon: 'dentistry', description: 'علاج وتجميل وترميم الأسنان واللثة', doctorCount: 5, isActive: true }
        ];
        this.isLoading = false;
      }
    });
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.specForm = {
      _id: '',
      name: '',
      nameAr: '',
      icon: 'stethoscope',
      description: '',
      doctorCount: 0,
      isActive: true
    };
    this.isModalOpen = true;
  }

  openEditModal(spec: SpecializationModel): void {
    this.isEditMode = true;
    this.specForm = { ...spec };
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  saveSpecialization(): void {
    if (!this.specForm.nameAr) return;

    if (this.isEditMode) {
      this.adminService.updateSpecialization(this.specForm._id, this.specForm).subscribe({
        next: () => {
          this.updateSpecInList(this.specForm);
          this.closeModal();
        },
        error: () => {
          this.updateSpecInList(this.specForm);
          this.closeModal();
        }
      });
    } else {
      this.adminService.addSpecialization(this.specForm).subscribe({
        next: (newSpec) => {
          this.specializations.push(newSpec || { ...this.specForm, _id: 'spec_' + Date.now() });
          this.closeModal();
        },
        error: () => {
          this.specializations.push({ ...this.specForm, _id: 'spec_' + Date.now() });
          this.closeModal();
        }
      });
    }
  }

  updateSpecInList(updated: SpecializationModel): void {
    const idx = this.specializations.findIndex(s => s._id === updated._id);
    if (idx !== -1) {
      this.specializations[idx] = { ...updated };
    }
  }

  deleteSpecialization(spec: SpecializationModel): void {
    if (confirm(`هل تحب حذف التخصص الطبي "${spec.nameAr}"؟`)) {
      this.adminService.deleteSpecialization(spec._id).subscribe({
        next: () => {
          this.specializations = this.specializations.filter(s => s._id !== spec._id);
        },
        error: () => {
          this.specializations = this.specializations.filter(s => s._id !== spec._id);
        }
      });
    }
  }
}
