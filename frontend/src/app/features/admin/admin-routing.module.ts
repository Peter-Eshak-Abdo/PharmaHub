import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RoleGuard } from '../../core/guards/role.guard';

import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { DoctorsManagementComponent } from './doctors-management/doctors-management.component';
import { PatientsManagementComponent } from './patients-management/patients-management.component';
import { AppointmentsManagementComponent } from './appointments-management/appointments-management.component';
import { ReviewsManagementComponent } from './reviews-management/reviews-management.component';
import { SpecializationsManagementComponent } from './specializations-management/specializations-management.component';
import { UsersManagementComponent } from './users-management/users-management.component';

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'doctors', component: DoctorsManagementComponent },
      { path: 'patients', component: PatientsManagementComponent },
      { path: 'appointments', component: AppointmentsManagementComponent },
      { path: 'reviews', component: ReviewsManagementComponent },
      { path: 'specializations', component: SpecializationsManagementComponent },
      { path: 'users', component: UsersManagementComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}
