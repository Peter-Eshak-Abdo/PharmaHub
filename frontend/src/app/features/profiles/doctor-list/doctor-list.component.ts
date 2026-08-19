import { Component, OnInit } from '@angular/core';
import { DoctorService } from '../services/doctor.service';

@Component({
  selector: 'app-doctor-list',
  templateUrl: './doctor-list.component.html',
  styleUrls: ['./doctor-list.component.css']
})
export class DoctorListComponent implements OnInit {
  doctors: any[] = [];
  filteredDoctors: any[] = [];
  searchQuery: string = '';
  selectedSpecialty: string = '';
  sortBy: string = 'recommended';
  loading: boolean = false;

  specialties: string[] = [
    'طب وجراحة العيون',
    'أمراض القلب والأوعية',
    'الجلدية والتناسلية',
    'طب الأطفال',
    'المخ والأعصاب',
    'الباطنة والجهاز الهضمي',
    'العظام والمفاصل'
  ];

  constructor(private doctorService: DoctorService) {}

  ngOnInit(): void {
    this.loadDoctors();
  }

  loadDoctors(): void {
    this.loading = true;
    this.doctorService.getDoctors().subscribe({
      next: (res: any) => {
        this.loading = false;
        this.doctors = Array.isArray(res) ? res : (res?.data || []);
        this.applyLocalFilter();
      },
      error: () => {
        this.loading = false;
        this.doctors = [];
        this.filteredDoctors = [];
      },
    });
  }

  setSpecialty(specialty: string): void {
    this.selectedSpecialty = specialty;
    this.applyLocalFilter();
  }

  onSearchChange(): void {
    this.applyLocalFilter();
  }

  applyLocalFilter(): void {
    let result = [...this.doctors];

    // Filter by Specialty
    if (this.selectedSpecialty) {
      result = result.filter(d => 
        (d.specialization || '').toLowerCase().includes(this.selectedSpecialty.toLowerCase())
      );
    }

    // Filter by Search Query (Name, specialization, bio)
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.trim().toLowerCase();
      result = result.filter(d =>
        (d.fullName || '').toLowerCase().includes(q) ||
        (d.specialization || '').toLowerCase().includes(q) ||
        (d.education || '').toLowerCase().includes(q) ||
        (d.bio || '').toLowerCase().includes(q)
      );
    }

    this.filteredDoctors = result;
  }
}