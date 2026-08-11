// features/appointments/appointments-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BookingFormComponent } from './booking-form/booking-form.component';
import { PatientAppointmentsComponent } from './patient-appointments/patient-appointments.component';
import { DoctorAppointmentsComponent } from './doctor-appointments/doctor-appointments.component';
import { AuthGuard } from '../../core/guards/auth.guard'; // Mayada
import { RoleGuard } from '../../core/guards/role.guard';// Mayada

const routes: Routes = [
  {
    path: 'book/:doctorId',
    component: BookingFormComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'patient' },
  },
  {
    path: 'patient',
    component: PatientAppointmentsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'patient' },
  },
  {
    path: 'doctor',
    component: DoctorAppointmentsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'doctor' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AppointmentsRoutingModule {}
