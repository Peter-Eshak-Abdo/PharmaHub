import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminDashboardComponent } from './dashboard/admin-dashboard.component';
import { AdminDoctorsComponent } from './doctors-list/admin-doctors.component';
import { AdminPatientsComponent } from './patients-list/admin-patients.component';

@NgModule({
  declarations: [
    AdminDashboardComponent,
    AdminDoctorsComponent,
    AdminPatientsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    AdminRoutingModule
  ]
})
export class AdminModule {}
