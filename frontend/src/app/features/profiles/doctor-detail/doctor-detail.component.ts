import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DoctorService } from '../services/doctor.service';
import { LanguageService } from 'src/app/core/services/language.servics';

@Component({
  selector: 'app-doctor-detail',
  templateUrl: './doctor-detail.component.html',
  styleUrls: ['./doctor-detail.component.css']
})
export class DoctorDetailComponent implements OnInit {
  doctor: any;

  get isRtl(): boolean {
    return this.languageService.isRtl();
  }

  constructor(
    private route: ActivatedRoute,
    private doctorService: DoctorService,
    private languageService: LanguageService
  ) {}

  ngOnInit(): void {
    const doctorId = this.route.snapshot.paramMap.get('id');
    if (doctorId) {
      this.doctorService.getDoctorById(doctorId).subscribe({
        next: (res: any) => {
          this.doctor = res?.data || res;
        },
        error: () => {
          this.doctor = null;
        },
      });
    }
  }
}