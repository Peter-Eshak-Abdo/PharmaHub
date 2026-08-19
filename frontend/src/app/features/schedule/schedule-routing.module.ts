import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { WeeklyAvailabilityComponent } from './weekly-availability/weekly-availability.component';
import { ScheduleExceptionsComponent } from './schedule-exceptions/schedule-exceptions.component';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RoleGuard } from '../../core/guards/role.guard';

const routes: Routes = [
  {
    path: 'weekly-availability',
    component: WeeklyAvailabilityComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'doctor' }
  },
  {
    path: 'schedule-exceptions',
    component: ScheduleExceptionsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'doctor' }
  },
  { path: '', redirectTo: 'weekly-availability', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ScheduleRoutingModule { }

