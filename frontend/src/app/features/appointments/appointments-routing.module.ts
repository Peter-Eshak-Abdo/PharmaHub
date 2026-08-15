// features/appointments/appointments-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BookingFormComponent } from './booking-form/booking-form.component';
import { PatientAppointmentsComponent } from './patient-appointments/patient-appointments.component';
import { DoctorAppointmentsComponent } from './doctor-appointments/doctor-appointments.component';
import { ReviewFormComponent } from './review-form/review-form.component';
import { AuthGuard } from '../../core/guards/auth.guard'; // Mayada
import { RoleGuard } from '../../core/guards/role.guard';// Mayada

const routes: Routes = [
  {
    path: 'book/:doctorId',
    component: BookingFormComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'patient' },
  },
  { path: 'booking-form', component: BookingFormComponent },
  {
    path: 'patient',
    component: PatientAppointmentsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'patient' },
  },
  { path: 'patient-appointments', component: PatientAppointmentsComponent },
  {
    path: 'doctor',
    component: DoctorAppointmentsComponent,
  },
  { path: 'review-form', component: ReviewFormComponent },
  // {
  //   path: '',
  //   redirectTo: 'patient',
  //   pathMatch: 'full',
  // },
  { path: '', redirectTo: 'patient-appointments', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AppointmentsRoutingModule {}
