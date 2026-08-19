import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { AppointmentService } from '../services/appointment.service';
import { ConsultationType } from '../models/appointment.model';
import { LanguageService } from 'src/app/core/services/language.servics';
import { OfflineStorageService } from 'src/app/core/services/offline-storage.service';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-booking-form',
  templateUrl: './booking-form.component.html',
  styleUrls: ['./booking-form.component.css'],
})
export class BookingFormComponent implements OnInit {
  step = 1; // Step 1: Date/Time, Step 2: Details/Confirm
  isBookedSuccess = false;

  doctorId!: string;
  doctorName!: string;
  doctorSpecialization!: string;
  doctorFee!: number;

  selectedDate = '';
  selectedTime = '';
  availableSlots: string[] = [];
  slotDuration = 30;

  form!: FormGroup;

  isLoadingSlots = false;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  confirmedAppointment: any = null;
  paymentInfo: any = null;

  availableDays: any[] = [];
  hoveredUnavailableDay: any = null;
  currentMonth = new Date().getMonth() + 1;
  currentYear = new Date().getFullYear();

  minDate = new Date().toISOString().split('T')[0];

  get isRtl(): boolean {
    return this.languageService.isRtl();
  }

  get consultationTypes(): { value: ConsultationType; label: string; icon: string }[] {
    return [
      { value: 'In-Clinic', label: this.t('APPOINTMENTS.BOOKING.TYPE_IN_CLINIC'), icon: 'local_hospital' },
      { value: 'Online', label: this.t('APPOINTMENTS.BOOKING.TYPE_ONLINE'), icon: 'videocam' },
    ];
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private fb: FormBuilder,
    private appointmentService: AppointmentService,
    private translate: TranslateService,
    private languageService: LanguageService,
    private offlineStorage: OfflineStorageService,
    private toastService: ToastService,
  ) {}

  private t(key: string): string {
    return this.translate.instant(key);
  }

  ngOnInit(): void {
    this.doctorId =
      this.route.snapshot.queryParamMap.get('doctorId') ||
      this.route.snapshot.paramMap.get('doctorId') ||
      this.route.snapshot.paramMap.get('id') ||
      '';
    this.doctorName =
      this.route.snapshot.queryParamMap.get('doctorName') || this.t('APPOINTMENTS.BOOKING.DEFAULT_DOCTOR_NAME');
    this.doctorSpecialization =
      this.route.snapshot.queryParamMap.get('specialization') || '';
    this.doctorFee = Number(this.route.snapshot.queryParamMap.get('fee') || 0);

    if (!this.doctorId) {
      this.errorMessage = this.t('APPOINTMENTS.BOOKING.ERR_NO_DOCTOR');
      return;
    }

    this.form = this.fb.group({
      consultationType: ['In-Clinic', Validators.required],
      reasonForVisit: ['', [Validators.maxLength(500)]],
    });

    this.loadAvailableDays();
  }

  loadAvailableDays(): void {
    if (!this.doctorId) return;
    this.appointmentService
      .getAvailableDays(this.doctorId, this.currentMonth, this.currentYear)
      .subscribe({
        next: (res) => {
          this.availableDays = res.days || [];
        },
        error: (err) => {
          console.error('Error loading available days:', err);
        }
      });
  }

  prevMonth(): void {
    if (this.currentMonth === 1) {
      this.currentMonth = 12;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.loadAvailableDays();
  }

  nextMonth(): void {
    if (this.currentMonth === 12) {
      this.currentMonth = 1;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.loadAvailableDays();
  }

  getDayInfo(dateStr: string) {
    return this.availableDays.find(d => d.date === dateStr);
  }

  onHoverUnavailable(info: any) {
    if (info && !info.available && info.exception) {
      this.hoveredUnavailableDay = info;
    } else {
      this.hoveredUnavailableDay = null;
    }
  }

  getDayClass(dayInfo: any): string {
    const base = 'relative py-2.5 rounded-xl text-center text-sm font-semibold transition-all ';
    if (dayInfo.isPast) return base + 'text-outline-variant bg-surface-container-low cursor-not-allowed opacity-40';
    if (this.selectedDate === dayInfo.date) return base + 'bg-primary text-on-primary font-bold shadow-md';
    if (dayInfo.exception) return base + 'bg-error-container/60 text-on-error-container hover:bg-error-container cursor-pointer';
    if (!dayInfo.available) return base + 'text-outline-variant bg-surface-container-low cursor-not-allowed';
    return base + 'bg-surface-container hover:bg-primary/15 text-on-surface hover:text-primary cursor-pointer border border-outline-variant/40';
  }

  onDateChange(date: string): void {
    this.selectedDate = date;
    this.selectedTime = '';
    this.availableSlots = [];
    this.errorMessage = '';

    if (!date) return;

    this.isLoadingSlots = true;
    this.appointmentService.getAvailableSlots(this.doctorId, date).subscribe({
      next: (res) => {
        this.availableSlots = res.data || [];
        this.slotDuration = res.slotDuration || 30;
        this.isLoadingSlots = false;
        if (!this.availableSlots || this.availableSlots.length === 0) {
          this.errorMessage = res.message || this.t('APPOINTMENTS.BOOKING.ERR_NO_SLOTS');
        }
      },
      error: (err) => {
        this.errorMessage = err.message || this.t('APPOINTMENTS.BOOKING.ERR_LOAD_SLOTS');
        this.isLoadingSlots = false;
      },
    });
  }

  selectTime(time: string): void {
    this.selectedTime = time;
  }

  goToStep2(): void {
    if (!this.selectedDate || !this.selectedTime) {
      this.errorMessage = this.t('APPOINTMENTS.BOOKING.ERR_SELECT_DATE_TIME');
      return;
    }
    this.errorMessage = '';
    this.step = 2;
  }

  goBack(): void {
    if (this.step === 2) {
      this.step = 1;
    } else if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/profiles/doctor-list']);
    }
  }

  goToAppointments(): void {
    this.router.navigate(['/appointments/patient']);
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  formatTime(time: string): string {
    if (!time) return '';
    const [h, m] = time.split(':').map(Number);
    const period = this.isRtl ? (h < 12 ? 'ص' : 'م') : (h < 12 ? 'AM' : 'PM');
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${h12}:${String(m).padStart(2, '0')} ${period}`;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString(this.isRtl ? 'ar-EG' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  onSubmit(): void {
    if (this.form.invalid || !this.selectedDate || !this.selectedTime) {
      this.form.markAllAsTouched();
      this.errorMessage = this.t('APPOINTMENTS.BOOKING.ERR_FILL_REQUIRED');
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const payload = {
      doctorId: this.doctorId,
      appointmentDate: this.selectedDate,
      appointmentTime: this.selectedTime,
      consultationType: this.form.value.consultationType,
      reasonForVisit: this.form.value.reasonForVisit || undefined,
    };

    // Check if offline
    if (!navigator.onLine) {
      this.offlineStorage.queueAppointment(payload).then(() => {
        this.isSubmitting = false;
        this.isBookedSuccess = true;
        this.confirmedAppointment = {
          doctorName: this.doctorName,
          appointmentDate: this.selectedDate,
          appointmentTime: this.selectedTime,
        };
        this.toastService.warning(
          'أنت غير متصل بالإنترنت حالياً. تم حفظ طلب الحجز في ذاكرة التطبيق، وسيتم إرساله وتأكيده تلقائياً فور عودة الاتصال!',
          'حفظ بدون إنترنت'
        );
      }).catch((err) => {
        this.isSubmitting = false;
        this.errorMessage = 'تعذر حفظ الحجز في وضع عدم الاتصال.';
      });
      return;
    }

    this.appointmentService
      .createAppointment(payload)
      .subscribe({
        next: (res: any) => {
          this.isSubmitting = false;
          this.confirmedAppointment = res.data || res.appointment || {
            doctorName: this.doctorName,
            appointmentDate: this.selectedDate,
            appointmentTime: this.selectedTime,
          };
          this.paymentInfo = res.paymentInfo || null;
          this.isBookedSuccess = true;
        },
        error: (err: any) => {
          this.isSubmitting = false;
          this.errorMessage =
            err.error?.message ||
            err.message ||
            this.t('APPOINTMENTS.BOOKING.ERR_FAILED');
        },
      });
  }
}
