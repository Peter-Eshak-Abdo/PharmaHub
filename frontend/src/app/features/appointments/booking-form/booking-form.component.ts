// features/appointments/booking-form/booking-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppointmentService } from '../services/appointment.service';

@Component({
  selector: 'app-booking-form',
  templateUrl: './booking-form.component.html',
  // styleUrls: ['./booking-form.component.css'],
})
export class BookingFormComponent implements OnInit {
  bookingForm!: FormGroup;
  doctorId!: string;
  step = 1;
  availableSlots: any[] = [];
  selectedDate: string = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private appointmentService: AppointmentService,
  ) {}

  ngOnInit(): void {
    this.doctorId = this.route.snapshot.paramMap.get('doctorId') || '';
    this.bookingForm = this.fb.group({
      date: ['', Validators.required],
      timeSlot: ['', Validators.required],
      consultationType: ['In-Clinic', Validators.required],
      reasonForVisit: [''],
    });
  }

  onDateChange(event: any): void {
    this.selectedDate = event.target.value;
    this.appointmentService
      .getAvailableSlots(this.doctorId, this.selectedDate)
      .subscribe((res) => {
        this.availableSlots = res.slots || [];
      });
  }

  nextStep(): void {
    if (
      this.bookingForm.get('date')?.valid &&
      this.bookingForm.get('timeSlot')?.valid
    ) {
      this.step = 2;
    }
  }

  submitBooking(): void {
    if (this.bookingForm.valid) {
      const payload = {
        doctorId: this.doctorId,
        ...this.bookingForm.value,
      };
      this.appointmentService.createAppointment(payload).subscribe(() => {
        this.step = 3;
      });
    }
  }

  goToAppointments(): void {
    this.router.navigate(['/appointments/patient']);
  }
}
