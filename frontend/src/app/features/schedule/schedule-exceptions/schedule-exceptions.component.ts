import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ScheduleService } from '../services/schedule.service';
import { DoctorService } from '../../profiles/services/doctor.service';
import { LanguageService } from 'src/app/core/services/language.servics';

interface ScheduleException {
  _id: string;
  doctorId: string;
  startDate: string;
  endDate: string;
  type: string;
  reason: string;
}

@Component({
  selector: 'app-schedule-exceptions',
  templateUrl: './schedule-exceptions.component.html',
  styleUrls: ['./schedule-exceptions.component.css']
})
export class ScheduleExceptionsComponent implements OnInit {
  exceptions: ScheduleException[] = [];
  doctorId: string = '';

  types = ['Vacation', 'Blocked', 'Emergency'];
  typeKeys: Record<string, string> = {
    Vacation: 'SCHEDULE.TYPES.VACATION',
    Blocked: 'SCHEDULE.TYPES.BLOCKED',
    Emergency: 'SCHEDULE.TYPES.EMERGENCY'
  };

  newException = {
    doctorId: '',
    startDate: '',
    endDate: '',
    type: 'Vacation',
    reason: ''
  };

  editingId: string | null = null;

  isLoading = false;
  isSaving = false;
  errorMessage = '';
  successMessage = '';

  get isRtl(): boolean {
    return this.languageService.isRtl();
  }

  constructor(
    private scheduleService: ScheduleService,
    private doctorService: DoctorService,
    private translate: TranslateService,
    private languageService: LanguageService
  ) {}

  ngOnInit() {
    this.fetchDoctorProfileAndExceptions();
  }

  fetchDoctorProfileAndExceptions() {
    this.isLoading = true;
    this.doctorService.getDoctorProfile().subscribe({
      next: (res: any) => {
        const doc = res.data || res;
        if (doc && (doc._id || doc.id)) {
          this.doctorId = doc._id || doc.id;
          this.loadExceptions();
        } else {
          this.isLoading = false;
          this.errorMessage = 'لم يتم العثور على ملف الطبيب الحالي';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'يرجى استكمال ملف الطبيب أولاً للتمكن من إدارة المواعيد الاستثنائية';
      }
    });
  }

  typeLabel(type: string): string {
    return this.typeKeys[type] || type;
  }

  private clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }

  private t(key: string): string {
    return this.translate.instant(key);
  }

  loadExceptions() {
    this.isLoading = true;
    this.clearMessages();
    this.scheduleService.getExceptionsByDoctor(this.doctorId).subscribe({
      next: (data: any) => {
        this.exceptions = data.data || data || [];
        this.isLoading = false;
      },
      error: (err: Error) => {
        this.errorMessage = err.message || this.t('SCHEDULE.EXCEPTIONS.ERR_LOAD');
        this.isLoading = false;
      }
    });
  }

  private resetForm() {
    this.newException = {
      doctorId: '',
      startDate: '',
      endDate: '',
      type: 'Vacation',
      reason: ''
    };
    this.editingId = null;
  }

  startEdit(exception: ScheduleException) {
    this.clearMessages();
    this.editingId = exception._id;
    this.newException = {
      doctorId: exception.doctorId,
      startDate: exception.startDate?.slice(0, 10),
      endDate: exception.endDate?.slice(0, 10),
      type: exception.type,
      reason: exception.reason || ''
    };
  }

  cancelEdit() {
    this.resetForm();
    this.clearMessages();
  }

  saveException() {
    this.clearMessages();

    if (!this.newException.startDate || !this.newException.endDate || !this.newException.type) {
      this.errorMessage = this.t('SCHEDULE.EXCEPTIONS.ERR_REQUIRED');
      return;
    }

    if (this.newException.endDate < this.newException.startDate) {
      this.errorMessage = this.t('SCHEDULE.EXCEPTIONS.ERR_DATE_ORDER');
      return;
    }

    this.isSaving = true;
    this.newException.doctorId = this.doctorId;

    const request$ = this.editingId
      ? this.scheduleService.updateException(this.editingId, this.newException)
      : this.scheduleService.addException(this.newException);

    request$.subscribe({
      next: () => {
        this.successMessage = this.editingId
          ? this.t('SCHEDULE.EXCEPTIONS.SUCCESS_EDIT')
          : this.t('SCHEDULE.EXCEPTIONS.SUCCESS_ADD');
        this.isSaving = false;
        this.resetForm();
        this.loadExceptions();
      },
      error: (err: Error) => {
        this.errorMessage = err.message || this.t('SCHEDULE.EXCEPTIONS.ERR_SAVE');
        this.isSaving = false;
      }
    });
  }

  deleteException(id: string) {
    if (!confirm(this.t('SCHEDULE.EXCEPTIONS.CONFIRM_DELETE'))) {
      return;
    }

    this.clearMessages();
    this.scheduleService.deleteException(id).subscribe({
      next: () => {
        this.successMessage = this.t('SCHEDULE.EXCEPTIONS.SUCCESS_DELETE');
        if (this.editingId === id) {
          this.resetForm();
        }
        this.loadExceptions();
      },
      error: (err: Error) => {
        this.errorMessage = err.message || this.t('SCHEDULE.EXCEPTIONS.ERR_DELETE');
      }
    });
  }
}
