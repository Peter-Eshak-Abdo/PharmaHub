import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PrescriptionService } from '../services/prescription.service';

@Component({
  selector: 'app-prescription-view',
  templateUrl: './prescription-view.component.html',
  styleUrls: ['./prescription-view.component.css']
})
export class PrescriptionViewComponent implements OnInit {

  appointmentId: string = '';
  prescription: any = null;
  isLoading = true;
  notFound = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private prescriptionService: PrescriptionService
  ) {}

  ngOnInit(): void {
    this.appointmentId =
      this.route.snapshot.paramMap.get('appointmentId') || '';

    if (!this.appointmentId) {
      this.isLoading = false;
      this.notFound = true;
      this.errorMessage = 'No appointment ID provided.';
      return;
    }

    this.prescriptionService
      .getPrescriptionByAppointmentId(this.appointmentId)
      .subscribe({
        next: (res) => {
          this.prescription = res?.data ?? null;
          this.isLoading = false;
          if (!this.prescription) {
            this.notFound = true;
          }
        },
        error: (err) => {
          this.isLoading = false;
          if (err.status === 404) {
            this.notFound = true;
            this.errorMessage = 'No prescription found for this appointment.';
          } else {
            this.errorMessage =
              err.error?.message || 'An error occurred while loading the prescription.';
          }
        }
      });
  }

  /** Return just the doctor's full name safely */
  get doctorName(): string {
    return this.prescription?.doctorId?.fullName ?? '—';
  }

  get doctorSpecialization(): string {
    return this.prescription?.doctorId?.specialization ?? '—';
  }

  get patientName(): string {
    return this.prescription?.patientId?.fullName ?? '—';
  }

  get issuedDate(): string {
    if (!this.prescription?.issuedDate) return '—';
    return new Date(this.prescription.issuedDate).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  get diagnoses(): any[] {
    return this.prescription?.diagnosisIds ?? [];
  }

  get medications(): any[] {
    return this.prescription?.medications ?? [];
  }

  /** Resolve medication name from populated subdoc */
  getMedName(med: any): string {
    return med?.medicationId?.name ?? med?.medicationId ?? '—';
  }

  getMedGeneric(med: any): string {
    return med?.medicationId?.genericName ?? '';
  }

  getMedType(med: any): string {
    return med?.medicationId?.type ?? '';
  }

  print(): void {
    window.print();
  }
}
