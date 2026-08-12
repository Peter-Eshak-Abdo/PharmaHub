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
      this.isLoading = false;
      this.errorMessage = 'No patient ID provided in the URL.';
      return;
    }

    this.http
      .get<any>(`/api/patient/${this.patientId}/medical-history`)
      .subscribe({
        next: (res) => {
          this.history = res?.data ?? [];
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage =
            err.error?.message || 'Failed to load medical history.';
        }
      });
  }

  // ── Helpers ──────────────────────────────────────────────────────

  formatDate(dateStr: string): { day: string; month: string; year: string } {
    if (!dateStr) return { day: '—', month: '—', year: '—' };
    const d = new Date(dateStr);
    return {
      day: d.toLocaleDateString('en-GB', { day: '2-digit' }),
      month: d.toLocaleDateString('en-GB', { month: 'short' }),
      year: d.toLocaleDateString('en-GB', { year: 'numeric' })
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
