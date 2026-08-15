import { Component, OnInit } from '@angular/core';
import { ScheduleService } from '../services/schedule.service';

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
  doctorId: string = '6a7a68e2039344ea7b05c884'; // TODO: replace with real logged-in doctor's ID via AuthService later

  // Week starts on Sunday, matching the backend's slot-engine day mapping.
  days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  dayValues = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  newSlot = {
    doctorId: '',
    dayOfWeek: 'Sunday',
    startTime: '',
    endTime: '',
    slotDurationMinutes: 30
  };

  editingId: string | null = null;

  isLoading = false;
  isSaving = false;
  errorMessage = '';
  successMessage = '';

  constructor(private scheduleService: ScheduleService) {}

  ngOnInit() {
    if (this.doctorId) {
      this.loadSlots();
    }
  }

  dayLabel(value: string): string {
    const idx = this.dayValues.indexOf(value);
    return idx > -1 ? this.days[idx] : value;
  }

  private clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }

  loadSlots() {
    this.isLoading = true;
    this.clearMessages();
    this.scheduleService.getAvailabilityByDoctor(this.doctorId).subscribe({
      next: (data: any) => {
        const raw: WeeklySlot[] = data.data || data || [];
        // Backend sorts dayOfWeek alphabetically (it's a string field), which
        // doesn't match calendar order. Re-sort here so the list always reads
        // Sunday -> Monday -> ... -> Saturday, then by start time within a day.
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
        this.errorMessage = err.message || 'تعذر تحميل مواعيد التوفر.';
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
      this.errorMessage = 'يرجى تعبئة جميع الحقول المطلوبة.';
      return;
    }

    if (this.newSlot.endTime <= this.newSlot.startTime) {
      this.errorMessage = 'وقت النهاية يجب أن يكون بعد وقت البداية.';
      return;
    }

    this.isSaving = true;
    this.newSlot.doctorId = this.doctorId;

    const request$ = this.editingId
      ? this.scheduleService.updateAvailability(this.editingId, this.newSlot)
      : this.scheduleService.addAvailability(this.newSlot);

    request$.subscribe({
      next: () => {
        this.successMessage = this.editingId ? 'تم تحديث الموعد بنجاح.' : 'تمت إضافة الموعد بنجاح.';
        this.isSaving = false;
        this.resetForm();
        this.loadSlots();
      },
      error: (err: Error) => {
        this.errorMessage = err.message || 'حدث خطأ أثناء الحفظ.';
        this.isSaving = false;
      }
    });
  }

  deleteSlot(id: string) {
    if (!confirm('هل أنت متأكد من حذف هذا الموعد؟')) {
      return;
    }

    this.clearMessages();
    this.scheduleService.deleteAvailability(id).subscribe({
      next: () => {
        this.successMessage = 'تم حذف الموعد.';
        if (this.editingId === id) {
          this.resetForm();
        }
        this.loadSlots();
      },
      error: (err: Error) => {
        this.errorMessage = err.message || 'تعذر حذف الموعد.';
      }
    });
  }
}
