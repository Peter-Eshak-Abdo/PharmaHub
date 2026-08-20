import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DoctorService, Doctor } from '../profiles/services/doctor.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit {
  searchQuery = '';
  selectedSpecialty = '';
  selectedCity = '';

  popularDoctors: Doctor[] = [];
  isLoading = false;

  specialties = [
    { name: 'طب الأطفال', icon: 'child_care', count: '120+ طبيب' },
    { name: 'أمراض القلب', icon: 'favorite', count: '85+ طبيب' },
    { name: 'الجلدية والتناسلية', icon: 'spa', count: '150+ طبيب' },
    { name: 'العظام والمفاصل', icon: 'accessible', count: '95+ طبيب' },
    { name: 'المخ والأعصاب', icon: 'psychology', count: '60+ طبيب' },
    { name: 'طب وجراحة الأسنان', icon: 'dentistry', count: '200+ طبيب' },
    { name: 'العيون والجراحة', icon: 'visibility', count: '75+ طبيب' },
    { name: 'الأنف والأذن والحنجرة', icon: 'hearing', count: '90+ طبيب' }
  ];

  stats = [
    { label: 'طبيب معتمد', value: '+1,200', icon: 'verified_user' },
    { label: 'استشارة ناجحة', value: '+50,000', icon: 'event_available' },
    { label: 'مريض راضٍ', value: '98%', icon: 'sentiment_very_satisfied' },
    { label: 'مركز وعيادة شريكة', value: '+350', icon: 'domain' }
  ];

  testimonials = [
    {
      name: 'أحمد محمود',
      role: 'مريض',
      comment: 'تجربة ممتازة وسريعة جداً. قمت بحجز موعد مع طبيب القلب في أقل من دقيقة وتم الكشف في الموعد تماماً بدون أي تأخير.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'
    },
    {
      name: 'سارة خالد',
      role: 'مريضة',
      comment: 'المنصة سهلت عليّ الوصول لأفضل أطباء الأطفال بالمنطقة وتتبع الروشتة والأدوية أونلاين بصورة فائقة السهولة.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80'
    },
    {
      name: 'د. طارق السعيد',
      role: 'استشاري باطنة',
      comment: 'منصة طمّني منظمة جداً وتمكنني كطبيب من تنظيم جدولي الأسبوعي والمواعيد والمراجعات بدقة وحرفية عالية.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=120&q=80'
    }
  ];

  constructor(
    private router: Router,
    private doctorService: DoctorService
  ) {}

  ngOnInit(): void {
    this.loadTopDoctors();
  }

  loadTopDoctors(): void {
    this.isLoading = true;
    this.doctorService.getDoctors().subscribe({
      next: (docs) => {
        this.popularDoctors = docs.slice(0, 4);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    this.router.navigate(['/profiles/doctor-list'], {
      queryParams: {
        search: this.searchQuery || undefined,
        specialty: this.selectedSpecialty || undefined,
        city: this.selectedCity || undefined
      }
    });
  }

  selectSpecialty(specialtyName: string): void {
    this.router.navigate(['/profiles/doctor-list'], {
      queryParams: { specialty: specialtyName }
    });
  }

  goToBooking(doctorId: string): void {
    this.router.navigate(['/appointments/book'], { queryParams: { doctorId } });
  }

  goToDoctorDetail(doctorId: string): void {
    this.router.navigate(['/profiles/doctor', doctorId]);
  }
}
