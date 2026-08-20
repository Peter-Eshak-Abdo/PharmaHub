import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CatalogManagementComponent } from './catalog-management/catalog-management.component';
import { PrescriptionFormComponent } from './prescription-form/prescription-form.component';
import { PrescriptionViewComponent } from './prescription-view/prescription-view.component';
import { MedicalHistoryComponent } from './medical-history/medical-history.component';
import { RoleGuard } from '../../core/guards/role.guard';
import { AuthGuard } from '../../core/guards/auth.guard';

const routes: Routes = [
  { 
    path: 'catalog', 
    component: CatalogManagementComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['doctor', 'admin'] }
  },
  { 
    path: 'catalog-management', 
    redirectTo: 'catalog',
    pathMatch: 'full'
  },
  {
    path: 'prescription/create/:appointmentId',
    component: PrescriptionFormComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['doctor'] }
  },
  { 
    path: 'prescription-form', 
    redirectTo: 'catalog',
    pathMatch: 'full'
  },
  {
    path: 'prescription/view/:appointmentId',
    component: PrescriptionViewComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['doctor', 'patient'] }
  },
  { 
    path: 'prescription-view', 
    redirectTo: 'catalog',
    pathMatch: 'full'
  },
  {
    path: 'history',
    component: MedicalHistoryComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'history/:patientId',
    component: MedicalHistoryComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['doctor', 'patient', 'admin'] }
  },
  { 
    path: 'medical-history', 
    redirectTo: 'history',
    pathMatch: 'full' 
  },
  { path: '', redirectTo: 'history', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MedicalRoutingModule {}
