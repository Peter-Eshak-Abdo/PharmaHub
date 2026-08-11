import { Component, OnInit } from '@angular/core';
import { DoctorService } from '../services/doctor.service';

@Component({
  selector: 'app-doctor-list',
  templateUrl: './doctor-list.component.html',
  styleUrls: ['./doctor-list.component.css']
})
export class DoctorListComponent implements OnInit {
  doctors: any[] = [];
  specializationFilter: string = '';
  

  constructor(private doctorService: DoctorService) {}

  ngOnInit(): void {
    this.loadDoctors();
  }

  loadDoctors(): void {
    this.doctorService.getDoctors(this.specializationFilter).subscribe(data => {
      this.doctors = data;
    });
  }

  onFilterChange(): void {
    this.loadDoctors();
  }
}