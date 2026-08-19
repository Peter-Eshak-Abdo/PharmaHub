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
  specializationFilter: string = '';

  get isRtl(): boolean {
    return this.languageService.isRtl();
  }

  constructor(
    private doctorService: DoctorService,
    private languageService: LanguageService
  ) {}

  ngOnInit(): void {
    this.loadDoctors();
  }

  loadDoctors(): void {
    this.doctorService.getDoctors(this.specializationFilter).subscribe({
      next: (res: any) => {
        this.doctors = Array.isArray(res) ? res : (res?.data || []);
      },
      error: () => {
        this.doctors = [];
      },
    });
  }

  onFilterChange(): void {
    this.loadDoctors();
  }
}