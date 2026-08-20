import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ScheduleService } from '../services/schedule.service';
import { DoctorService } from '../../profiles/services/doctor.service';
import { LanguageService } from 'src/app/core/services/language.service';

interface WeeklySlot {
  _id: string;
  doctorId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
}

@Component({
  selector: 'app-weekly-availability',
  templateUrl: './weekly-availability.component.html',
  styleUrls: ['./weekly-availability.component.css']
})
export class WeeklyAvailabilityComponent implements OnInit {
  slots: WeeklySlot[] = [];
  doctorId: string = '';

  // Week starts on Saturday (Task 12: RTL/Arabic standard schedule order)
  // Values stay in English (DB/API contract); labels are translated for display.
  dayValues = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  dayKeys: Record<string, string> = {
    Saturday: 'SCHEDULE.DAYS.SATURDAY',
    Sunday: 'SCHEDULE.DAYS.SUNDAY',
    Monday: 'SCHEDULE.DAYS.MONDAY',
    Tuesday: 'SCHEDULE.DAYS.TUESDAY',
    Wednesday: 'SCHEDULE.DAYS.WEDNESDAY',
    Thursday: 'SCHEDULE.DAYS.THURSDAY',
    Friday: 'SCHEDULE.DAYS.FRIDAY',
  };

  newSlot = {
    doctorId: '',
    dayOfWeek: 'Saturday',
    startTime: '',
    endTime: '',
    slotDurationMinutes: 30
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
    this.fetchDoctorProfileAndSlots();
  }

  fetchDoctorProfileAndSlots() {
    this.isLoading = true;
    this.doctorService.getDoctorProfile().subscribe({
      next: (res: any) => {
        const doc = res.data || res;
        if (doc && (doc._id || doc.id)) {
          this.doctorId = doc._id || doc.id;
          this.loadSlots();
        } else {
          this.isLoading = false;
          this.errorMessage = 'لم يتم العثور على ملف الطبيب الحالي';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'يرجى استكمال ملف الطبيب أولاً للتمكن من إدارة المواعيد';
      }
    });
  }

  dayLabel(value: string): string {
    return this.dayKeys[value] || value;
  }

  private clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }

  private t(key: string): string {
    return this.translate.instant(key);
  }

  loadSlots() {
    this.isLoading = true;
    this.clearMessages();
    this.scheduleService.getAvailabilityByDoctor(this.doctorId).subscribe({
      next: (data: any) => {
        const raw: WeeklySlot[] = data.data || data || [];
        this.slots = [...raw].sort((a, b) => {
          const dayDiff = this.dayValues.indexOf(a.dayOfWeek) - this.dayValues.indexOf(b.dayOfWeek);
          if (dayDiff !== 0) {
            return dayDiff;
          }
          return a.startTime.localeCompare(b.startTime);
        });
        this.isLoading = false;
      },
      error: (err: Error) => {
        this.errorMessage = err.message || this.t('SCHEDULE.WEEKLY.ERR_LOAD');
        this.isLoading = false;
      }
    });
  }

  private resetForm() {
    this.newSlot = {
      doctorId: '',
      dayOfWeek: 'Sunday',
      startTime: '',
      endTime: '',
      slotDurationMinutes: 30
    };
    this.editingId = null;
  }

  startEdit(slot: WeeklySlot) {
    this.clearMessages();
    this.editingId = slot._id;
    this.newSlot = {
      doctorId: slot.doctorId,
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
      slotDurationMinutes: slot.slotDurationMinutes
    };
  }

  cancelEdit() {
    this.resetForm();
    this.clearMessages();
  }

  saveSlot() {
    this.clearMessages();

    if (!this.newSlot.startTime || !this.newSlot.endTime || !this.newSlot.slotDurationMinutes) {
      this.errorMessage = this.t('SCHEDULE.WEEKLY.ERR_REQUIRED');
      return;
    }

    if (this.newSlot.endTime <= this.newSlot.startTime) {
      this.errorMessage = this.t('SCHEDULE.WEEKLY.ERR_TIME_ORDER');
      return;
    }

    this.isSaving = true;
    this.newSlot.doctorId = this.doctorId;

    const request$ = this.editingId
      ? this.scheduleService.updateAvailability(this.editingId, this.newSlot)
      : this.scheduleService.addAvailability(this.newSlot);

    request$.subscribe({
      next: () => {
        this.successMessage = this.editingId
          ? this.t('SCHEDULE.WEEKLY.SUCCESS_EDIT')
          : this.t('SCHEDULE.WEEKLY.SUCCESS_ADD');
        this.isSaving = false;
        this.resetForm();
        this.loadSlots();
      },
      error: (err: Error) => {
        this.errorMessage = err.message || this.t('SCHEDULE.WEEKLY.ERR_SAVE');
        this.isSaving = false;
      }
    });
  }

  deleteSlot(id: string) {
    if (!confirm(this.t('SCHEDULE.WEEKLY.CONFIRM_DELETE'))) {
      return;
    }

    this.clearMessages();
    this.scheduleService.deleteAvailability(id).subscribe({
      next: () => {
        this.successMessage = this.t('SCHEDULE.WEEKLY.SUCCESS_DELETE');
        if (this.editingId === id) {
          this.resetForm();
        }
        this.loadSlots();
      },
      error: (err: Error) => {
        this.errorMessage = err.message || this.t('SCHEDULE.WEEKLY.ERR_DELETE');
      }
    });
  }
}
