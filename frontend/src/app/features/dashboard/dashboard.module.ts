import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { PatientDashboardComponent } from './patient-dashboard/patient-dashboard.component';
import { DoctorDashboardComponent } from './doctor-dashboard/doctor-dashboard.component';

@NgModule({
  declarations: [
    PatientDashboardComponent,
    DoctorDashboardComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    DashboardRoutingModule,
  ],
})
export class DashboardModule {}
