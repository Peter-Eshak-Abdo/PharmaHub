import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RoleGuard } from '../../core/guards/role.guard';

import { BookingFormComponent } from './booking-form/booking-form.component';
import { PatientAppointmentsComponent } from './patient-appointments/patient-appointments.component';
import { DoctorAppointmentsComponent } from './doctor-appointments/doctor-appointments.component';
import { ReviewFormComponent } from './review-form/review-form.component';

const routes: Routes = [
  {
    path: 'book',
    component: BookingFormComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'patient' },
  },
  {
    path: 'booking-form',
    redirectTo: 'book',
    pathMatch: 'full',
  },
  {
    path: 'patient',
    component: PatientAppointmentsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'patient' },
  },
  {
    path: 'patient-appointments',
    redirectTo: 'patient',
    pathMatch: 'full',
  },
  {
    path: 'doctor',
    component: DoctorAppointmentsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'doctor' },
  },
  {
    path: 'doctor-appointments',
    redirectTo: 'doctor',
    pathMatch: 'full',
  },
  {
    path: 'review/:appointmentId',
    component: ReviewFormComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'patient' },
  },
  {
    path: 'review',
    component: ReviewFormComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'patient' },
  },
  {
    path: 'review-form',
    redirectTo: 'review',
    pathMatch: 'full',
  },
  {
    path: '',
    redirectTo: 'patient',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AppointmentsRoutingModule {}
