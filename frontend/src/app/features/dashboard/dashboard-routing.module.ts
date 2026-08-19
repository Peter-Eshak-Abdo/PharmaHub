import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PatientDashboardComponent } from './patient-dashboard/patient-dashboard.component';
import { DoctorDashboardComponent } from './doctor-dashboard/doctor-dashboard.component';

const routes: Routes = [
  { path: 'patient', component: PatientDashboardComponent },
  { path: 'doctor', component: DoctorDashboardComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}
