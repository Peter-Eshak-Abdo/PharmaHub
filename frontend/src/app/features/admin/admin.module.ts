import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminRoutingModule } from './admin-routing.module';

import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { DoctorsManagementComponent } from './doctors-management/doctors-management.component';
import { PatientsManagementComponent } from './patients-management/patients-management.component';
import { AppointmentsManagementComponent } from './appointments-management/appointments-management.component';
import { ReviewsManagementComponent } from './reviews-management/reviews-management.component';
import { SpecializationsManagementComponent } from './specializations-management/specializations-management.component';
import { UsersManagementComponent } from './users-management/users-management.component';

@NgModule({
  declarations: [
    AdminLayoutComponent,
    AdminDashboardComponent,
    DoctorsManagementComponent,
    PatientsManagementComponent,
    AppointmentsManagementComponent,
    ReviewsManagementComponent,
    SpecializationsManagementComponent,
    UsersManagementComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AdminRoutingModule
  ]
})
export class AdminModule {}
