import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ScheduleRoutingModule } from './schedule-routing.module';
import { WeeklyAvailabilityComponent } from './weekly-availability/weekly-availability.component';

@NgModule({
  declarations: [WeeklyAvailabilityComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ScheduleRoutingModule,
  ],
  exports: [WeeklyAvailabilityComponent],
})
export class ScheduleModule {}
