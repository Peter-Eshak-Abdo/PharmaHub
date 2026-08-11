import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { WeeklyAvailabilityComponent } from './weekly-availability/weekly-availability.component';
import { ScheduleExceptionsComponent } from './schedule-exceptions/schedule-exceptions.component';

const routes: Routes = [
  { path: 'weekly-availability', component: WeeklyAvailabilityComponent },
  { path: 'schedule-exceptions', component: ScheduleExceptionsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AvailabilityRoutingModule { }