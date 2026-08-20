import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DoctorService, Doctor } from '../services/doctor.service';
import { LanguageService } from 'src/app/core/services/language.service';

@Component({
  selector: 'app-doctor-list',
  templateUrl: './doctor-list.component.html',
  styleUrls: ['./doctor-list.component.css']
})
export class DoctorListComponent implements OnInit {
  doctors: Doctor[] = [];
  filteredDoctors: Doctor[] = [];
  searchQuery: string = '';
  selectedSpecialty: string = '';
  selectedCity: string = '';
  sortBy: 'rating' | 'experience' | 'name' | 'fee' = 'rating';
  sortOrder: 'asc' | 'desc' = 'desc';
  loading: boolean = false;

  specialties: string[] = [
    'أمراض القلب',
    'طب الأطفال',
    'الجلدية والتناسلية',
    'العظام والمفاصل',
    'المخ والأعصاب',
    'طب وجراحة الأسنان'
  ];

  cities: string[] = ['القاهرة', 'الجيزة', 'الإسكندرية', 'المنصورة'];

  constructor(
    private doctorService: DoctorService,
    private languageService: LanguageService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['search']) this.searchQuery = params['search'];
      if (params['specialty']) this.selectedSpecialty = params['specialty'];
      if (params['city']) this.selectedCity = params['city'];
      this.loadDoctors();
    });
  }

  loadDoctors(): void {
    this.loading = true;
    this.doctorService.getDoctors(this.selectedSpecialty, this.selectedCity).subscribe({
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
    this.selectedSpecialty = this.selectedSpecialty === specialty ? '' : specialty;
    this.applyFilters();
  }

  setCity(city: string): void {
    this.selectedCity = this.selectedCity === city ? '' : city;
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
        (d.specialization || '').includes(this.selectedSpecialty) ||
        this.selectedSpecialty.includes(d.specialization || '')
      );
    }

    // Filter by City
    if (this.selectedCity) {
      result = result.filter(d => (d.city || '') === this.selectedCity);
    }

    // Filter by Search Query
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
        valA = Number(a.yearsExperience) || 0;
        valB = Number(b.yearsExperience) || 0;
      } else if (this.sortBy === 'fee') {
        valA = Number(a.consultationFee) || 0;
        valB = Number(b.consultationFee) || 0;
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

  goToBooking(doctorId: string): void {
    this.router.navigate(['/appointments/book'], { queryParams: { doctorId } });
  }

  goToDoctorDetail(doctorId: string): void {
    this.router.navigate(['/profiles/doctor', doctorId]);
  }
}
