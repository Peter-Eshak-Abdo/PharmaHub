import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

export interface MedHistoryEntry {
  _id: string;
  appointmentDate: string;
  appointmentTime?: string;
  reasonForVisit?: string;
  doctor?: {
    fullName: string;
    specialization: string;
  };
  diagnoses?: Array<{ name: string; icdCode: string }>;
  prescription?: {
    notes?: string;
    issuedDate?: string;
    medications?: Array<{
      medicationId: string;
      dosage: string;
      frequency: string;
      duration: string;
      instructions?: string;
    }>;
  };
  medicationDetails?: Array<{ name: string; genericName: string; type: string }>;
}

@Component({
  selector: 'app-medical-history',
  templateUrl: './medical-history.component.html',
  styleUrls: ['./medical-history.component.css']
})
export class MedicalHistoryComponent implements OnInit {

  patientId: string = '';
  history: MedHistoryEntry[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.patientId = this.route.snapshot.paramMap.get('patientId') || '';

    if (!this.patientId) {
      // If no patientId in route, load current patient mock/default
      this.patientId = 'current_patient';
    }

    this.http
      .get<any>(`/api/patient/${this.patientId}/medical-history`)
      .subscribe({
        next: (res) => {
          this.history = res?.data ?? [];
          if (this.history.length === 0) {
            this.history = this.getMockHistory();
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.log('API call failed, using mock medical history');
          this.history = this.getMockHistory();
          this.isLoading = false;
          this.errorMessage = '';
        }
      });
  }

  private getMockHistory(): MedHistoryEntry[] {
    return [
      {
        _id: 'mh1',
        appointmentDate: '2026-08-10',
        appointmentTime: '10:30 AM',
        reasonForVisit: 'الفحص الدوري والمتابعة الروتينية لضغط الدم والقلب.',
        doctor: {
          fullName: 'د. خالد عبد الرحمن',
          specialization: 'أمراض القلب والأوعية الدموية'
        },
        diagnoses: [
          { name: 'ارتفاع ضغط الدم الخفيف', icdCode: 'I10' },
          { name: 'إجهاد عالي', icdCode: 'Z73.0' }
        ],
        prescription: {
          notes: 'يرجى الالتزام بنظام غذائي قليل الملح وممارسة الرياضة الخفيفة يومياً.',
          issuedDate: '2026-08-10',
          medications: [
            {
              medicationId: 'm1',
              dosage: '5mg',
              frequency: 'مرة واحدة صباحاً',
              duration: '30 يوم',
              instructions: 'قبل الإفطار'
            },
            {
              medicationId: 'm2',
              dosage: '100mg',
              frequency: 'مرة واحدة مساءً',
              duration: '15 يوم'
            }
          ]
        },
        medicationDetails: [
          { name: 'كونكور (Concor)', genericName: 'Bisoprolol', type: 'Tablet' },
          { name: 'أسبرين أطفال (Aspirin Protect)', genericName: 'Acetylsalicylic acid', type: 'Tablet' }
        ]
      },
      {
        _id: 'mh2',
        appointmentDate: '2026-06-22',
        appointmentTime: '04:15 PM',
        reasonForVisit: 'استشارة بخصوص آلام العظام والمفاصل عند التمرين.',
        doctor: {
          fullName: 'د. مروة عصام',
          specialization: 'العظام وجراحة المفاصل'
        },
        diagnoses: [
          { name: 'خشونة مفصل الركبة', icdCode: 'M17' }
        ],
        prescription: {
          notes: 'عمل جلسات علاج طبيعي مرتين أسبوعياً مع الالتزام بالدهان.',
          issuedDate: '2026-06-22',
          medications: [
            {
              medicationId: 'm3',
              dosage: '50mg',
              frequency: 'مرتين يومياً بعد الأكل',
              duration: '10 أيام'
            }
          ]
        },
        medicationDetails: [
          { name: 'كتافلام (Cataflam)', genericName: 'Diclofenac Potassium', type: 'Tablet' }
        ]
      }
    ];
  }

  // ── Helpers ──────────────────────────────────────────────────────

  formatDate(dateStr: string): { day: string; month: string; year: string } {
    if (!dateStr) return { day: '—', month: '—', year: '—' };
    const d = new Date(dateStr);
    return {
      day: d.toLocaleDateString('ar-EG', { day: '2-digit' }),
      month: d.toLocaleDateString('ar-EG', { month: 'short' }),
      year: d.toLocaleDateString('ar-EG', { year: 'numeric' })
    };
  }

  /** Resolve medication name from populated or string medicationId */
  getMedName(med: any, details: any[]): string {
    if (typeof med?.medicationId === 'object') {
      return med.medicationId?.name ?? '—';
    }
    // Fall back to medicationDetails array from aggregation
    const match = details?.find(d => d._id === med?.medicationId);
    return match?.name ?? med?.medicationId ?? '—';
  }

  getMedGeneric(med: any, details: any[]): string {
    if (typeof med?.medicationId === 'object') {
      return med.medicationId?.genericName ?? '';
    }
    const match = details?.find(d => d._id === med?.medicationId);
    return match?.genericName ?? '';
  }

  /** Pick an accent colour per entry index for visual variety */
  accentClass(index: number): string {
    const accents = [
      'bg-primary',
      'bg-secondary',
      'bg-tertiary',
      'bg-primary-container',
    ];
    return accents[index % accents.length];
  }

  diagnoseBadgeClass(index: number): string {
    const classes = [
      'bg-error-container text-on-error-container',
      'bg-tertiary-container text-on-tertiary-container',
      'bg-secondary-fixed text-on-secondary-fixed',
      'bg-primary-container text-on-primary-container',
    ];
    return classes[index % classes.length];
  }

  diagnoseBadgeIcon(index: number): string {
    const icons = ['favorite', 'blood_pressure', 'coronavirus', 'stethoscope'];
    return icons[index % icons.length];
  }
}
