import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PrescriptionFormComponent } from './features/medical/prescription-form/prescription-form.component';
import { PrescriptionViewComponent } from './features/medical/prescription-view/prescription-view.component';
import { CatalogManagementComponent } from './features/medical/catalog-management/catalog-management.component';
import { MedicalHistoryComponent } from './features/medical/medical-history/medical-history.component';

const routes: Routes = [
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
    path: 'availability',
    loadChildren: () =>
      import('./features/availability/availability.module').then(
        (m) => m.AvailabilityModule,
      ),
  },
  {
    path: 'appointments',
    loadChildren: () =>
      import('./features/appointments/appointments.module').then(
        (m) => m.AppointmentsModule,
      ),
  },
  {
    path: '',
    redirectTo: 'appointments/patient',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

