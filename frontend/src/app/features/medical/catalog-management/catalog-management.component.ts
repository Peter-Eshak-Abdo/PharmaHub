import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CatalogService } from '../services/catalog.service';

export type ActiveTab = 'diagnoses' | 'medications';

@Component({
  selector: 'app-catalog-management',
  templateUrl: './catalog-management.component.html',
  styleUrls: ['./catalog-management.component.css']
})
export class CatalogManagementComponent implements OnInit {

  // ── Tab state ────────────────────────────────────────────────────
  activeTab: ActiveTab = 'diagnoses';

  // ── Search ───────────────────────────────────────────────────────
  diagnosisSearch$ = new Subject<string>();
  medicationSearch$ = new Subject<string>();
  diagnosisSearchTerm = '';
  medicationSearchTerm = '';

  // ── Data lists ───────────────────────────────────────────────────
  diagnoses: any[] = [];
  medications: any[] = [];

  // ── Loading / error / success ────────────────────────────────────
  diagnosisLoading = false;
  medicationLoading = false;
  diagnosisError = '';
  medicationError = '';
  diagnosisSuccess = '';
  medicationSuccess = '';

  // ── Add Diagnosis form ───────────────────────────────────────────
  diagnosisForm!: FormGroup;
  diagnosisSubmitting = false;

  // ── Add Medication modal ─────────────────────────────────────────
  showMedicationModal = false;
  medicationForm!: FormGroup;
  medicationSubmitting = false;

  medicationTypes = [
    'مضاد حيوي', 'مضاد سكر', 'خافض للضغط', 'مضاد التهاب لا ستيرويدي',
    'ستاتين', 'مضاد اكتئاب', 'موسع قصبات', 'مسكن',
    'مضاد هيستامين', 'مضاد فطريات', 'مضاد فيروسات', 'مدر للبول', 'أخرى'
  ];

  constructor(
    private fb: FormBuilder,
    private catalogService: CatalogService
  ) {}

  ngOnInit(): void {
    this.diagnosisForm = this.fb.group({
      name:        ['', Validators.required],
      icdCode:     ['', Validators.required],
      description: ['']
    });

    this.medicationForm = this.fb.group({
      name:        ['', Validators.required],
      genericName: ['', Validators.required],
      type:        ['', Validators.required]
    });

    // Load both catalogs on init
    this.loadDiagnoses();
    this.loadMedications();

    // Live search — diagnoses
    this.diagnosisSearch$.pipe(debounceTime(350), distinctUntilChanged())
      .subscribe(term => {
        this.diagnosisSearchTerm = term;
        this.loadDiagnoses(term);
      });

    // Live search — medications
    this.medicationSearch$.pipe(debounceTime(350), distinctUntilChanged())
      .subscribe(term => {
        this.medicationSearchTerm = term;
        this.loadMedications(term);
      });
  }

  // ── Tab toggle ───────────────────────────────────────────────────

  setTab(tab: ActiveTab): void {
    this.activeTab = tab;
    this.diagnosisError = '';
    this.medicationError = '';
    this.diagnosisSuccess = '';
    this.medicationSuccess = '';
  }

  // ── Load diagnoses ───────────────────────────────────────────────

  loadDiagnoses(search?: string): void {
    this.diagnosisLoading = true;
    this.diagnosisError = '';
    this.catalogService.getDiagnoses(search).subscribe({
      next: (res: any) => {
        this.diagnoses = res?.data ?? [];
        this.diagnosisLoading = false;
      },
      error: (err: any) => {
        this.diagnosisError = err.error?.message || 'فشل في تحميل التشخيصات.';
        this.diagnosisLoading = false;
      }
    });
  }

  // ── Load medications ─────────────────────────────────────────────

  loadMedications(search?: string): void {
    this.medicationLoading = true;
    this.medicationError = '';
    this.catalogService.getMedications(search).subscribe({
      next: (res: any) => {
        this.medications = res?.data ?? [];
        this.medicationLoading = false;
      },
      error: (err: any) => {
        this.medicationError = err.error?.message || 'فشل في تحميل الأدوية.';
        this.medicationLoading = false;
      }
    });
  }

  // ── Submit new diagnosis ─────────────────────────────────────────

  submitDiagnosis(): void {
    if (this.diagnosisForm.invalid) {
      this.diagnosisForm.markAllAsTouched();
      return;
    }
    this.diagnosisSubmitting = true;
    this.diagnosisSuccess = '';
    this.diagnosisError = '';
    this.catalogService.addDiagnosis(this.diagnosisForm.value).subscribe({
      next: (res: any) => {
        this.diagnosisSubmitting = false;
        this.diagnosisSuccess = `تم إضافة "${res?.data?.name}" بنجاح!`;
        this.diagnosisForm.reset();
        this.loadDiagnoses(this.diagnosisSearchTerm);
      },
      error: (err: any) => {
        this.diagnosisSubmitting = false;
        if (err.status === 409) {
          this.diagnosisError = err.error?.message || 'يوجد تشخيص بهذا الاسم أو الكود مسبقاً.';
        } else {
          this.diagnosisError = err.error?.message || 'فشل في إضافة التشخيص.';
        }
      }
    });
  }

  // ── Submit new medication ────────────────────────────────────────

  openMedicationModal(): void {
    this.medicationForm.reset();
    this.medicationError = '';
    this.medicationSuccess = '';
    this.showMedicationModal = true;
  }

  closeMedicationModal(): void {
    this.showMedicationModal = false;
  }

  submitMedication(): void {
    if (this.medicationForm.invalid) {
      this.medicationForm.markAllAsTouched();
      return;
    }
    this.medicationSubmitting = true;
    this.medicationSuccess = '';
    this.medicationError = '';
    this.catalogService.addMedication(this.medicationForm.value).subscribe({
      next: (res: any) => {
        this.medicationSubmitting = false;
        this.medicationSuccess = `تم إضافة "${res?.data?.name}" بنجاح!`;
        this.medicationForm.reset();
        this.showMedicationModal = false;
        this.loadMedications(this.medicationSearchTerm);
      },
      error: (err: any) => {
        this.medicationSubmitting = false;
        if (err.status === 409) {
          this.medicationError = 'يوجد دواء بهذا الاسم مسبقاً.';
        } else {
          this.medicationError = err.error?.message || 'فشل في إضافة الدواء.';
        }
      }
    });
  }

  // ── Helpers ──────────────────────────────────────────────────────

  isInvalid(form: FormGroup, field: string): boolean {
    const ctrl = form.get(field);
    return !!(ctrl && ctrl.invalid && ctrl.touched);
  }

  /** Cycle through badge colours for medication type badges */
  medTypeBadgeClass(type: string): string {
    const map: Record<string, string> = {
      'مضاد حيوي':       'bg-secondary-container text-on-secondary-container',
      'مضاد سكر':     'bg-tertiary-container text-on-tertiary-container',
      'خافض للضغط': 'bg-surface-variant text-on-surface-variant',
      'مضاد التهاب لا ستيرويدي':            'bg-error-container text-on-error-container',
      'ستاتين':           'bg-primary-container text-on-primary-container',
      'مضاد اكتئاب':   'bg-secondary-fixed text-on-secondary-fixed',
    };
    return map[type] ?? 'bg-surface-container text-on-surface-variant';
  }
}
