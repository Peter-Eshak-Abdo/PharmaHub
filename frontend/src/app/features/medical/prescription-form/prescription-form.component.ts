import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { Subject, of } from 'rxjs';

import { PrescriptionService } from '../services/prescription.service';
import { CatalogService } from '../services/catalog.service';

export interface SelectedDiagnosis {
  _id: string;
  label: string;
}

export interface MedicationSuggestion {
  _id: string;
  name: string;
  genericName: string;
  type: string;
}

@Component({
  selector: 'app-prescription-form',
  templateUrl: './prescription-form.component.html',
  styleUrls: ['./prescription-form.component.css']
})
export class PrescriptionFormComponent implements OnInit {

  // Route params
  appointmentId: string = '';

  // Form
  prescriptionForm!: FormGroup;

  // Diagnosis search
  diagnosisSearchTerm$ = new Subject<string>();
  diagnosisSuggestions: any[] = [];
  selectedDiagnoses: SelectedDiagnosis[] = [];
  showDiagnosisDropdown = false;

  // Medication search suggestions per row
  medicationSuggestions: MedicationSuggestion[][] = [[]];
  showMedicationDropdown: boolean[] = [false];
  medicationSearch: string[] = [''];

  // State
  isSubmitting = false;
  submitSuccess = false;
  submitError = '';
  alreadyExists = false;

  // Frequency & Duration options
  frequencyOptions = [
    'Once daily',
    'Twice daily (BID)',
    'Three times daily (TID)',
    'Every 4 hours',
    'As needed (PRN)'
  ];
  durationOptions = ['3 Days', '5 Days', '7 Days', '10 Days', '14 Days', '30 Days'];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private prescriptionService: PrescriptionService,
    private catalogService: CatalogService
  ) {}

  ngOnInit(): void {
    this.appointmentId = this.route.snapshot.paramMap.get('appointmentId') || '';

    this.prescriptionForm = this.fb.group({
      patientId:   ['', Validators.required],
      doctorId:    ['', Validators.required],
      notes:       [''],
      medications: this.fb.array([this.createMedicationGroup()])
    });

    // Live diagnosis search
    this.diagnosisSearchTerm$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => term.trim().length > 0
        ? this.catalogService.getDiagnoses(term).pipe(catchError(() => of({ data: [] })))
        : of({ data: [] })
      )
    ).subscribe(res => {
      this.diagnosisSuggestions = res?.data ?? [];
      this.showDiagnosisDropdown = this.diagnosisSuggestions.length > 0;
    });
  }

  // ── Medications FormArray ───────────────────────────────────────────────────

  get medications(): FormArray {
    return this.prescriptionForm.get('medications') as FormArray;
  }

  createMedicationGroup(): FormGroup {
    return this.fb.group({
      medicationId: ['', Validators.required],
      medicationName: [''],
      dosage:       ['', Validators.required],
      frequency:    ['Once daily', Validators.required],
      duration:     ['7 Days', Validators.required],
      instructions: [''],
      notes:        ['']
    });
  }

  addMedication(): void {
    this.medications.push(this.createMedicationGroup());
    this.medicationSuggestions.push([]);
    this.showMedicationDropdown.push(false);
    this.medicationSearch.push('');
  }

  removeMedication(index: number): void {
    if (this.medications.length > 1) {
      this.medications.removeAt(index);
      this.medicationSuggestions.splice(index, 1);
      this.showMedicationDropdown.splice(index, 1);
      this.medicationSearch.splice(index, 1);
    }
  }

  // ── Diagnosis Autocomplete ─────────────────────────────────────────────────

  onDiagnosisInput(event: Event): void {
    const term = (event.target as HTMLInputElement).value;
    this.diagnosisSearchTerm$.next(term);
  }

  selectDiagnosis(diag: any): void {
    if (!this.selectedDiagnoses.find(d => d._id === diag._id)) {
      this.selectedDiagnoses.push({
        _id: diag._id,
        label: `${diag.icdCode} - ${diag.name}`
      });
    }
    this.showDiagnosisDropdown = false;
    this.diagnosisSuggestions = [];
    // Clear input
    const input = document.getElementById('diagnosis-input') as HTMLInputElement;
    if (input) input.value = '';
  }

  removeDiagnosis(id: string): void {
    this.selectedDiagnoses = this.selectedDiagnoses.filter(d => d._id !== id);
  }

  hideDiagnosisDropdown(): void {
    setTimeout(() => { this.showDiagnosisDropdown = false; }, 150);
  }

  // ── Medication Autocomplete ────────────────────────────────────────────────

  onMedicationInput(event: Event, index: number): void {
    const term = (event.target as HTMLInputElement).value;
    this.medicationSearch[index] = term;
    if (term.trim().length === 0) {
      this.medicationSuggestions[index] = [];
      this.showMedicationDropdown[index] = false;
      return;
    }
    this.catalogService.getMedications(term).pipe(
      catchError(() => of({ data: [] }))
    ).subscribe(res => {
      this.medicationSuggestions[index] = res?.data ?? [];
      this.showMedicationDropdown[index] = this.medicationSuggestions[index].length > 0;
    });
  }

  selectMedication(med: MedicationSuggestion, index: number): void {
    const group = this.medications.at(index) as FormGroup;
    group.patchValue({ medicationId: med._id, medicationName: med.name });
    this.medicationSearch[index] = med.name;
    this.showMedicationDropdown[index] = false;
    this.medicationSuggestions[index] = [];
  }

  hideMedicationDropdown(index: number): void {
    setTimeout(() => { this.showMedicationDropdown[index] = false; }, 150);
  }

  // ── Submission ─────────────────────────────────────────────────────────────

  onSubmit(): void {
    if (this.prescriptionForm.invalid || this.selectedDiagnoses.length === 0) {
      this.prescriptionForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.submitError = '';

    const formValue = this.prescriptionForm.value;
    const payload = {
      patientId:   formValue.patientId,
      doctorId:    formValue.doctorId,
      diagnosisIds: this.selectedDiagnoses.map(d => d._id),
      medications: formValue.medications.map((m: any) => ({
        medicationId: m.medicationId,
        dosage:       m.dosage,
        frequency:    m.frequency,
        duration:     m.duration,
        instructions: m.instructions,
        notes:        m.notes
      })),
      notes: formValue.notes
    };

    this.prescriptionService.createPrescription(this.appointmentId, payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.submitSuccess = true;
      },
      error: (err) => {
        this.isSubmitting = false;
        if (err.status === 409) {
          this.alreadyExists = true;
          this.submitError = 'A prescription already exists for this appointment.';
        } else if (err.status === 400) {
          this.submitError = err.error?.message || 'Appointment must be Completed before creating a prescription.';
        } else {
          this.submitError = err.error?.message || 'An error occurred. Please try again.';
        }
      }
    });
  }

  isFieldInvalid(groupIndex: number, field: string): boolean {
    const ctrl = (this.medications.at(groupIndex) as FormGroup).get(field);
    return !!(ctrl && ctrl.invalid && ctrl.touched);
  }
}
