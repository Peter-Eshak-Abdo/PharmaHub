import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CatalogManagementComponent } from './catalog-management/catalog-management.component';
import { PrescriptionFormComponent } from './prescription-form/prescription-form.component';
import { PrescriptionViewComponent } from './prescription-view/prescription-view.component';
import { MedicalHistoryComponent } from './medical-history/medical-history.component';

const routes: Routes = [
  { path: 'catalog', component: CatalogManagementComponent },
  {
    path: 'prescription/create/:appointmentId',
    component: PrescriptionFormComponent,
  },
  {
    path: 'prescription/view/:appointmentId',
    component: PrescriptionViewComponent,
  },
  {
    path: 'history/:patientId',
    component: MedicalHistoryComponent,
  },
  { path: '', redirectTo: 'catalog', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MedicalRoutingModule {}

