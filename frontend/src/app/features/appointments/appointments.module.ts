// features/appointments/appointments.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AppointmentsRoutingModule } from './appointments-routing.module';
import { BookingFormComponent } from './booking-form/booking-form.component';
import { PatientAppointmentsComponent } from './patient-appointments/patient-appointments.component';
import { DoctorAppointmentsComponent } from './doctor-appointments/doctor-appointments.component';
import { ReviewFormComponent } from './review-form/review-form.component';

@NgModule({
  declarations: [
    BookingFormComponent,
    PatientAppointmentsComponent,
    DoctorAppointmentsComponent,
    ReviewFormComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    AppointmentsRoutingModule,
  ],
  exports: [ReviewFormComponent],
})
export class AppointmentsModule {}
