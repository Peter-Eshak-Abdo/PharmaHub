import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface Doctor {
  _id: string;
  fullName: string;
  specialization: string;
  education?: string;
  qualifications?: string;
  yearsExperience: number;
  consultationFee: number;
  bio?: string;
  rating: number;
  reviewCount?: number;
  avatar?: string;
  city?: string;
  address?: string;
  phone?: string;
  clinicName?: string;
}

export const MOCK_DOCTORS: Doctor[] = [
  {
    _id: 'doc_1',
    fullName: 'د. أحمد عبد الرحمن',
    specialization: 'أمراض القلب',
    education: 'دكتوراه طب القصر العيني - جامعة القاهرة',
    qualifications: 'زميل الكلية الملكية للأطباء بلندن',
    yearsExperience: 16,
    consultationFee: 450,
    rating: 4.9,
    reviewCount: 128,
    city: 'القاهرة',
    clinicName: 'مركز القلب التخصصي',
    address: 'شارع مصطفى النحاس، مدينة نصر، القاهرة',
    phone: '01001234567',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
    bio: 'استشاري أمراض القلب وقسطرة الشرايين، خبرة طويلة في علاج ارتفاع ضغط الدم وقصور الشرايين التاجية.'
  },
  {
    _id: 'doc_2',
    fullName: 'د. مروة الشربيني',
    specialization: 'طب الأطفال',
    education: 'ماجستير طب الأطفال وحديثي الولادة - جامعة عين شمس',
    qualifications: 'عضو الجمعية المصرية لطب الأطفال',
    yearsExperience: 12,
    consultationFee: 350,
    rating: 4.8,
    reviewCount: 95,
    city: 'الجيزة',
    clinicName: 'عيادات الطفولة السعيدة',
    address: 'شارع التحرير، الدقي، الجيزة',
    phone: '01112345678',
    avatar: 'https://images.unsplash.com/photo-1594824813566-88855d0859c2?auto=format&fit=crop&w=400&q=80',
    bio: 'متخصصة في متابعة نمو الأطفال والتطعيمات وأمراض الجهاز التنفسي والأنيميا عند الأطفال.'
  },
  {
    _id: 'doc_3',
    fullName: 'د. خالد السيد علي',
    specialization: 'العظام والمفاصل',
    education: 'دكتوراه جراحة العظام - جامعة الإسكندرية',
    qualifications: 'استشاري جراحة مناظير الركبة والكتف',
    yearsExperience: 18,
    consultationFee: 500,
    rating: 4.9,
    reviewCount: 160,
    city: 'الإسكندرية',
    clinicName: 'مركز الإسكندرية العظام',
    address: 'طريق الجيش، سموحة، الإسكندرية',
    phone: '01223456789',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80',
    bio: 'جراحة وتبديل المفاصل وعلاج إصابات الملاعب ومناظير المفاصل المتقدمة.'
  },
  {
    _id: 'doc_4',
    fullName: 'د. نورهان مجدي',
    specialization: 'الجلدية والتناسلية',
    education: 'ماجستير الأمراض الجلدية والتجميل - جامعة المنصورة',
    qualifications: 'دبلوم التجميل والليزر الكندي',
    yearsExperience: 10,
    consultationFee: 400,
    rating: 4.7,
    reviewCount: 84,
    city: 'القاهرة',
    clinicName: 'عيادة ديرما كير',
    address: 'شارع 9، المعادي، القاهرة',
    phone: '01098765432',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80',
    bio: 'علاج الأمراض الجلدية المزمنة والشعر وإجراءات التجميل والعلاج بالليزر.'
  },
  {
    _id: 'doc_5',
    fullName: 'د. عمر المنسي',
    specialization: 'المخ والأعصاب',
    education: 'دكتوراه أمراض المخ والأعصاب - جامعة القاهرة',
    qualifications: 'استشاري التصلب المتعدد والصرع',
    yearsExperience: 15,
    consultationFee: 550,
    rating: 4.9,
    reviewCount: 110,
    city: 'الجيزة',
    clinicName: 'مركز الأعصاب الحديث',
    address: 'شارع الهرم، الجيزة',
    phone: '01055544433',
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&q=80',
    bio: 'تشخيص وعلاج الجلطات الدماغية، الصداع المزمن، واعتلال الأعصاب الطرفية.'
  },
  {
    _id: 'doc_6',
    fullName: 'د. رانيا نبيل',
    specialization: 'طب وجراحة الأسنان',
    education: 'بكالوريوس طب وجراحة الأسنان - جامعة عين شمس',
    qualifications: 'أخصائية تركيبات وتجميل الأسنان',
    yearsExperience: 9,
    consultationFee: 300,
    rating: 4.8,
    reviewCount: 76,
    city: 'المنصورة',
    clinicName: 'عيادة سمارت دنت',
    address: 'شارع المشاية السفلية، المنصورة',
    phone: '01144433322',
    avatar: 'https://images.unsplash.com/photo-1594824813566-88855d0859c2?auto=format&fit=crop&w=400&q=80',
    bio: 'تبييض الأسنان بالليزر، حشو العصب بدون ألم، وتركيبات الزيركون والتجميل.'
  }
];

@Injectable({
  providedIn: 'root',
})
export class DoctorService {
  private apiUrl = `${environment.apiUrl}/doctor`;

  constructor(private http: HttpClient) {}

  getDoctors(specialization?: string, city?: string): Observable<Doctor[]> {
    let params = new HttpParams();
    if (specialization) params = params.set('specialization', specialization);
    if (city) params = params.set('city', city);

    return this.http.get<Doctor[]>(this.apiUrl, { params }).pipe(
      catchError(() => {
        let docs = MOCK_DOCTORS;
        if (specialization) {
          docs = docs.filter(d => d.specialization.includes(specialization) || specialization.includes(d.specialization));
        }
        if (city) {
          docs = docs.filter(d => d.city === city);
        }
        return of(docs);
      })
    );
  }

  getDoctorById(id: string): Observable<Doctor> {
    return this.http.get<Doctor>(`${this.apiUrl}/${id}`).pipe(
      catchError(() => {
        const found = MOCK_DOCTORS.find(d => d._id === id) || MOCK_DOCTORS[0];
        return of(found);
      })
    );
  }

  getDoctorProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`).pipe(
      catchError(() => {
        const stored = localStorage.getItem('doctor_profile');
        if (stored) {
          try {
            return of({ data: JSON.parse(stored) });
          } catch (e) {
            // ignore
          }
        }
        return of({ data: MOCK_DOCTORS[0] });
      })
    );
  }

  createDoctorProfile(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/profile`, data).pipe(
      catchError(() => {
        const profile = { ...MOCK_DOCTORS[0], ...data };
        localStorage.setItem('doctor_profile', JSON.stringify(profile));
        return of({ success: true, data: profile });
      })
    );
  }

  updateDoctorProfile(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, data).pipe(
      catchError(() => {
        const existing = JSON.parse(localStorage.getItem('doctor_profile') || JSON.stringify(MOCK_DOCTORS[0]));
        const updated = { ...existing, ...data };
        localStorage.setItem('doctor_profile', JSON.stringify(updated));
        return of({ success: true, data: updated });
      })
    );
  }

  getDoctorReviews(doctorId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${doctorId}/reviews`).pipe(
      catchError(() => {
        const key = `doctor_reviews_${doctorId}`;
        const stored = localStorage.getItem(key);
        if (stored) {
          try {
            return of(JSON.parse(stored));
          } catch (e) {}
        }
        const defaultReviews = [
          {
            id: 'rev_1',
            doctorId,
            patientName: 'أحمد فؤاد',
            rating: 5,
            comment: 'دكتور متمكن جداً واستمع للشكوى بكل اهتمام، والعيادة نظيفة ومنظمة للغاية.',
            createdAt: 'منذ 3 أيام'
          },
          {
            id: 'rev_2',
            doctorId,
            patientName: 'منى السيد',
            rating: 5,
            comment: 'التشخيص دقيق والروشتة جابت نتيجة سريعة جداً. شكراً دكتور.',
            createdAt: 'منذ أسبوع'
          }
        ];
        return of(defaultReviews);
      })
    );
  }

  addDoctorReview(reviewData: { doctorId: string; patientName: string; rating: number; comment: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/${reviewData.doctorId}/reviews`, reviewData).pipe(
      catchError(() => {
        const key = `doctor_reviews_${reviewData.doctorId}`;
        const stored = localStorage.getItem(key);
        let list: any[] = [];
        if (stored) {
          try {
            list = JSON.parse(stored);
          } catch (e) {}
        } else {
          list = [
            {
              id: 'rev_1',
              doctorId: reviewData.doctorId,
              patientName: 'أحمد فؤاد',
              rating: 5,
              comment: 'دكتور متمكن جداً واستمع للشكوى بكل اهتمام، والعيادة نظيفة ومنظمة للغاية.',
              createdAt: 'منذ 3 أيام'
            },
            {
              id: 'rev_2',
              doctorId: reviewData.doctorId,
              patientName: 'منى السيد',
              rating: 5,
              comment: 'التشخيص دقيق والروشتة جابت نتيجة سريعة جداً. شكراً دكتور.',
              createdAt: 'منذ أسبوع'
            }
          ];
        }
        const newRev = {
          id: 'rev_' + Date.now(),
          doctorId: reviewData.doctorId,
          patientName: reviewData.patientName || 'مريض منصة طمني',
          rating: Number(reviewData.rating) || 5,
          comment: reviewData.comment,
          createdAt: 'الآن'
        };
        list.unshift(newRev);
        localStorage.setItem(key, JSON.stringify(list));
        return of({ success: true, data: newRev, reviews: list });
      })
    );
  }
}
