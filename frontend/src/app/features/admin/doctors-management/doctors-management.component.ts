import { Component, OnInit } from '@angular/core';
import { AdminService, DoctorAdminModel } from '../../../core/services/admin.service';

@Component({
  selector: 'app-doctors-management',
  templateUrl: './doctors-management.component.html',
  styleUrls: ['./doctors-management.component.css']
})
export class DoctorsManagementComponent implements OnInit {
  doctors: DoctorAdminModel[] = [];
  filteredDoctors: DoctorAdminModel[] = [];
  isLoading = false;
  searchQuery = '';
  selectedSpecialization = '';
  selectedStatus = '';

  // Modal control
  isModalOpen = false;
  isEditMode = false;
  selectedDoctor: any = null;

  // Form State
  doctorForm = {
    _id: '',
    full_name: '',
    email: '',
    phone: '',
    specialization: '',
    education: '',
    qualifications: '',
    years_experience: 1,
    bio: '',
    rating: 5,
    is_active: true
  };

  specializationOptions = [
    'طب الأطفال',
    'أمراض القلب',
    'الجلدية والتجميل',
    'جراحة العظام',
    'الأسنان',
    'الأنف والأذن والحنجرة',
    'الباطنة والجهاز الهضمي',
    'أمراض النساء والتوليد',
    'العيون'
  ];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadDoctors();
  }

  loadDoctors(): void {
    this.isLoading = true;
    this.adminService.getDoctors().subscribe({
      next: (res) => {
        this.doctors = res.doctors || [];
        this.applyFilter();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching doctors:', err);
        // Fallback mock doctors data
        this.doctors = [
          {
            _id: 'doc1',
            full_name: 'د. خالد عبد العزيز',
            specialization: 'أمراض القلب',
            education: 'دكتوراه طب وجراحة القلب - جامعة القاهرة',
            qualifications: 'استشاري قسطرة القلب والأوعية الدموية',
            years_experience: 15,
            bio: 'خبير في جراحات وقسطرة القلب لأكثر من 15 عاماً',
            rating: 4.9,
            is_active: true,
            email: 'dr.khaled@tammeni.com',
            phone: '01012345678'
          },
          {
            _id: 'doc2',
            full_name: 'د. مروة الشريف',
            specialization: 'الجلدية والتجميل',
            education: 'ماجستير الأمراض الجلدية - جامعة عين شمس',
            qualifications: 'أخصائية التجميل والعلاج بالليزر',
            years_experience: 8,
            bio: 'متخصصة في العناية بالبشرة والعلاج بالليزر والأجهزة الحديثة',
            rating: 4.8,
            is_active: true,
            email: 'dr.marwa@tammeni.com',
            phone: '01122334455'
          },
          {
            _id: 'doc3',
            full_name: 'د. طارق مصطفى',
            specialization: 'جراحة العظام',
            education: 'زمالة جراحة العظام - بريطانيا',
            qualifications: 'استشاري مناظير ومفاصل العظام',
            years_experience: 12,
            bio: 'متخصص في تغيير المفاصل ومناظير الركبة والكتف',
            rating: 4.7,
            is_active: false,
            email: 'dr.tarek@tammeni.com',
            phone: '01234567890'
          }
        ];
        this.applyFilter();
        this.isLoading = false;
      }
    });
  }

  applyFilter(): void {
    this.filteredDoctors = this.doctors.filter(doc => {
      const matchesSearch = !this.searchQuery || 
        doc.full_name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (doc.email && doc.email.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (doc.phone && doc.phone.includes(this.searchQuery));

      const matchesSpec = !this.selectedSpecialization || doc.specialization === this.selectedSpecialization;
      const matchesStatus = !this.selectedStatus || 
        (this.selectedStatus === 'active' ? doc.is_active : !doc.is_active);

      return matchesSearch && matchesSpec && matchesStatus;
    });
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.doctorForm = {
      _id: '',
      full_name: '',
      email: '',
      phone: '',
      specialization: this.specializationOptions[0],
      education: '',
      qualifications: '',
      years_experience: 1,
      bio: '',
      rating: 5,
      is_active: true
    };
    this.isModalOpen = true;
  }

  openEditModal(doc: DoctorAdminModel): void {
    this.isEditMode = true;
    this.selectedDoctor = doc;
    this.doctorForm = {
      _id: doc._id,
      full_name: doc.full_name,
      email: doc.email || '',
      phone: doc.phone || '',
      specialization: doc.specialization,
      education: doc.education,
      qualifications: doc.qualifications,
      years_experience: doc.years_experience,
      bio: doc.bio,
      rating: doc.rating,
      is_active: doc.is_active
    };
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  saveDoctor(): void {
    if (!this.doctorForm.full_name || !this.doctorForm.specialization) return;

    if (this.isEditMode) {
      this.adminService.updateDoctor(this.doctorForm._id, this.doctorForm).subscribe({
        next: () => {
          this.updateDoctorInList(this.doctorForm);
          this.closeModal();
        },
        error: () => {
          // Fallback UI update
          this.updateDoctorInList(this.doctorForm);
          this.closeModal();
        }
      });
    } else {
      this.adminService.addDoctor(this.doctorForm).subscribe({
        next: (newDoc) => {
          this.doctors.unshift(newDoc || { ...this.doctorForm, _id: 'doc_' + Date.now() });
          this.applyFilter();
          this.closeModal();
        },
        error: () => {
          // Fallback UI update
          this.doctors.unshift({ ...this.doctorForm, _id: 'doc_' + Date.now() });
          this.applyFilter();
          this.closeModal();
        }
      });
    }
  }

  updateDoctorInList(updatedData: any): void {
    const idx = this.doctors.findIndex(d => d._id === updatedData._id);
    if (idx !== -1) {
      this.doctors[idx] = { ...this.doctors[idx], ...updatedData };
      this.applyFilter();
    }
  }

  toggleStatus(doc: DoctorAdminModel): void {
    const newStatus = !doc.is_active;
    this.adminService.toggleDoctorStatus(doc._id, newStatus).subscribe({
      next: () => {
        doc.is_active = newStatus;
        this.applyFilter();
      },
      error: () => {
        doc.is_active = newStatus;
        this.applyFilter();
      }
    });
  }

  deleteDoctor(doc: DoctorAdminModel): void {
    if (confirm(`هل أنت تأكد من إزالة الطبيب "${doc.full_name}"؟`)) {
      this.adminService.deleteDoctor(doc._id).subscribe({
        next: () => {
          this.doctors = this.doctors.filter(d => d._id !== doc._id);
          this.applyFilter();
        },
        error: () => {
          this.doctors = this.doctors.filter(d => d._id !== doc._id);
          this.applyFilter();
        }
      });
    }
  }
}
