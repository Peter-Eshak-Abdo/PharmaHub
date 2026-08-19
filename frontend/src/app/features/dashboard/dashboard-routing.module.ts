import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PatientDashboardComponent } from './patient-dashboard/patient-dashboard.component';
import { DoctorDashboardComponent } from './doctor-dashboard/doctor-dashboard.component';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RoleGuard } from '../../core/guards/role.guard';

const routes: Routes = [
  {
    path: 'patient',
    component: PatientDashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'patient' }
  },
  {
    path: 'doctor',
    component: DoctorDashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'doctor' }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}

