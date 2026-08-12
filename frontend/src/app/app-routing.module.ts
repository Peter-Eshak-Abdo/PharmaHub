import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { DoctorListComponent } from './features/profiles/doctor-list/doctor-list.component';
import { PatientProfileComponent } from './features/profiles/patient-profile/patient-profile.component';
// import { PrescriptionFormComponent } from './features/medical/prescription-form/prescription-form.component';
import { PrescriptionViewComponent } from './features/medical/prescription-view/prescription-view.component';
// import { CatalogManagementComponent } from './features/medical/catalog-management/catalog-management.component';
// import { MedicalHistoryComponent } from './features/medical/medical-history/medical-history.component';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'doctors', component: DoctorListComponent, canActivate: [AuthGuard] },
  {
    path: 'patient-profile',
    component: PatientProfileComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'schedule',
    loadChildren: () => import('./features/schedule/schedule.module').then(m => m.ScheduleModule),
    // component: WeeklyAvailabilityComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'appointments',
    loadChildren: () => import('./features/appointments/appointments.module').then(m => m.AppointmentsModule),
    // component: PatientAppointmentsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'prescription/:appointmentId',
    component: PrescriptionViewComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'medical',
    loadChildren: () =>
      import('./features/medical/medical.module').then((m) => m.MedicalModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'profiles',
    loadChildren: () =>
      import('./features/profiles/profiles.module').then(
        (m) => m.ProfilesModule,
      ),
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.module').then((m) => m.AuthModule),
  },
  // {
  //   path: 'prescriptions/new/:appointmentId',
  //   component: PrescriptionFormComponent,
  // },
  // { path: 'prescriptions/new', component: PrescriptionFormComponent },
  // {
  //   path: 'prescriptions/view/:appointmentId',
  //   component: PrescriptionViewComponent,
  // },
  // {
  //   path: 'prescriptions/:appointmentId',
  //   component: PrescriptionViewComponent,
  // },
  // { path: 'catalog-management', component: CatalogManagementComponent },
  // { path: 'medical-history/:patientId', component: MedicalHistoryComponent },
  // { path: 'medical-history', component: MedicalHistoryComponent },
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/auth/login' },
  // { path: '**', redirectTo: 'auth/login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
