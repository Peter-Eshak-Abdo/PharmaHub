import { Component, OnInit } from '@angular/core';
import { DoctorService } from '../services/doctor.service';
import { LanguageService } from 'src/app/core/services/language.servics';

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
  sortBy: 'rating' | 'experience' | 'name' | 'fee' = 'rating';
  sortOrder: 'asc' | 'desc' = 'desc';
  loading: boolean = false;

  specialties: string[] = [
    'باطنة',
    'أطفال',
    'قلب',
    'جراحة',
    'عيون',
    'نساء وتوليد',
    'عظام'
  ];

  constructor(
    private doctorService: DoctorService,
    private languageService: LanguageService
  ) {}

  ngOnInit(): void {
    this.loadDoctors();
  }

  loadDoctors(): void {
    this.loading = true;
    this.doctorService.getDoctors().subscribe({
      next: (res: any) => {
        this.loading = false;
        this.doctors = Array.isArray(res) ? res : (res?.data || []);
        this.applyFilters();
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
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onSortChange(field: 'rating' | 'experience' | 'name' | 'fee'): void {
    if (this.sortBy === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortOrder = field === 'name' ? 'asc' : 'desc';
    }
    this.applyFilters();
  }

  applyFilters(): void {
    let result = [...this.doctors];

    // Filter by Specialty
    if (this.selectedSpecialty) {
      result = result.filter(d =>
        (d.specialization || '').trim() === this.selectedSpecialty.trim()
      );
    }

    // Filter by Search Query (Name, specialization, education, bio)
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.trim().toLowerCase();
      result = result.filter(d =>
        (d.fullName || '').toLowerCase().includes(q) ||
        (d.specialization || '').toLowerCase().includes(q) ||
        (d.education || '').toLowerCase().includes(q) ||
        (d.bio || '').toLowerCase().includes(q)
      );
    }

    // Sorting
    result.sort((a, b) => {
      let valA: any = 0;
      let valB: any = 0;

      if (this.sortBy === 'rating') {
        valA = Number(a.rating) || 0;
        valB = Number(b.rating) || 0;
      } else if (this.sortBy === 'experience') {
        valA = Number(a.yearsOfExperience) || 0;
        valB = Number(b.yearsOfExperience) || 0;
      } else if (this.sortBy === 'fee') {
        valA = Number(a.consultationFeeSnapshot) || 0;
        valB = Number(b.consultationFeeSnapshot) || 0;
      } else if (this.sortBy === 'name') {
        valA = a.fullName || '';
        valB = b.fullName || '';
        return this.sortOrder === 'asc'
          ? valA.localeCompare(valB, 'ar')
          : valB.localeCompare(valA, 'ar');
      }

      const dir = this.sortOrder === 'asc' ? 1 : -1;
      return valA > valB ? dir : valA < valB ? -dir : 0;
    });

    this.filteredDoctors = result;
  }
}

