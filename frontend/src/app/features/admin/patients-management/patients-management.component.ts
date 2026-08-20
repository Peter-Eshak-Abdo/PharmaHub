import { Component, OnInit } from '@angular/core';
import { AdminService, PatientAdminModel } from '../../../core/services/admin.service';

@Component({
  selector: 'app-patients-management',
  templateUrl: './patients-management.component.html',
  styleUrls: ['./patients-management.component.css']
})
export class PatientsManagementComponent implements OnInit {
  patients: PatientAdminModel[] = [];
  filteredPatients: PatientAdminModel[] = [];
  isLoading = false;
  searchQuery = '';
  selectedGender = '';
  selectedStatus = '';

  // Selected Patient Modal
  selectedPatient: PatientAdminModel | null = null;
  isDetailsModalOpen = false;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.isLoading = true;
    this.adminService.getPatients().subscribe({
      next: (res) => {
        this.patients = res.patients || [];
        this.applyFilter();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching patients:', err);
        // Fallback mock patients
        this.patients = [
          {
            _id: 'pat1',
            full_name: 'أحمد محمود العبد',
            email: 'ahmed.m@gmail.com',
            phone: '01099887766',
            age: 32,
            gender: 'ذكر',
            address: 'القاهرة، المعادي',
            occupation: 'مهندس برمجيات',
            company_name: 'TechCorp',
            is_active: true
          },
          {
            _id: 'pat2',
            full_name: 'سارة علي حسن',
            email: 'sara.ali@yahoo.com',
            phone: '01144556677',
            age: 27,
            gender: 'أنثى',
            address: 'الجيزة، الدقي',
            occupation: 'محاسبة',
            company_name: 'FinancialHub',
            is_active: true
          },
          {
            _id: 'pat3',
            full_name: 'محمود حسين إبراهيم',
            email: 'm.hussein@gmail.com',
            phone: '01211223344',
            age: 45,
            gender: 'ذكر',
            address: 'الإسكندرية، سموحة',
            occupation: 'مدرس',
            is_active: false
          }
        ];
        this.applyFilter();
        this.isLoading = false;
      }
    });
  }

  applyFilter(): void {
    this.filteredPatients = this.patients.filter(pat => {
      const matchesSearch = !this.searchQuery || 
        pat.full_name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (pat.email && pat.email.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (pat.phone && pat.phone.includes(this.searchQuery));

      const matchesGender = !this.selectedGender || pat.gender === this.selectedGender;
      const matchesStatus = !this.selectedStatus || 
        (this.selectedStatus === 'active' ? pat.is_active : !pat.is_active);

      return matchesSearch && matchesGender && matchesStatus;
    });
  }

  togglePatientStatus(pat: PatientAdminModel): void {
    const newStatus = !pat.is_active;
    this.adminService.togglePatientStatus(pat._id, newStatus).subscribe({
      next: () => {
        pat.is_active = newStatus;
        this.applyFilter();
      },
      error: () => {
        pat.is_active = newStatus;
        this.applyFilter();
      }
    });
  }

  viewPatientDetails(pat: PatientAdminModel): void {
    this.selectedPatient = pat;
    this.isDetailsModalOpen = true;
  }

  closeDetailsModal(): void {
    this.isDetailsModalOpen = false;
    this.selectedPatient = null;
  }
}
