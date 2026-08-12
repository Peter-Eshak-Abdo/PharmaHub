import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PrescriptionFormComponent } from './features/medical/prescription-form/prescription-form.component';
import { PrescriptionViewComponent } from './features/medical/prescription-view/prescription-view.component';
import { CatalogManagementComponent } from './features/medical/catalog-management/catalog-management.component';
import { MedicalHistoryComponent } from './features/medical/medical-history/medical-history.component';

const routes: Routes = [
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
  {
    path: 'prescriptions/new/:appointmentId',
    component: PrescriptionFormComponent,
  },
  { path: 'prescriptions/new', component: PrescriptionFormComponent },
  {
    path: 'prescriptions/view/:appointmentId',
    component: PrescriptionViewComponent,
  },
  {
    path: 'prescriptions/:appointmentId',
    component: PrescriptionViewComponent,
  },
  { path: 'catalog-management', component: CatalogManagementComponent },
  { path: 'medical-history/:patientId', component: MedicalHistoryComponent },
  { path: 'medical-history', component: MedicalHistoryComponent },
 {
  path: 'schedule',
  loadChildren: () =>
    import('./features/schedule/schedule.module').then(
      (m) => m.ScheduleModule,
    ),
},
  {
    path: 'appointments',
    loadChildren: () =>
      import('./features/appointments/appointments.module').then(
        (m) => m.AppointmentsModule,
      ),
  },
  // { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  // { path: '**', redirectTo: 'auth/login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
