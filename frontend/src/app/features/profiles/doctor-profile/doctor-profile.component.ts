import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-doctor-profile',
  templateUrl: './doctor-profile.component.html',
  styleUrls: ['./doctor-profile.component.css'],
})
export class DoctorProfileComponent implements OnInit {
  doctorData: any = {
    fullName: 'Julian Reed',
    specialization: 'Cardiology Specialist',
    education: 'MD from Harvard Medical School',
    qualifications: 'Board Certified in Cardiovascular Disease',
    yearsOfExperience: 12,
    bio: "Dr. Julian Reed is a board-certified cardiologist with over a decade of experience in diagnosing and treating cardiovascular diseases. He specializes in preventative cardiology and heart failure management. Dr. Reed believes in a patient-centered approach, combining the latest medical advancements with compassionate care to improve his patients' quality of life.",
    rating: 4.9,
    consultationFeeSnapshot: 150,
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // this.fetchDoctorProfile();
  }

  fetchDoctorProfile() {
    this.http.get(`${environment.apiUrl}/doctor/profile`).subscribe({
      next: (res: any) => {
        this.doctorData = res;
      },
      error: (err) => console.error(err),
    });
  }
}
