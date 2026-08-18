import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ScheduleRoutingModule } from './schedule-routing.module';
import { WeeklyAvailabilityComponent } from './weekly-availability/weekly-availability.component';
import { ScheduleExceptionsComponent } from './schedule-exceptions/schedule-exceptions.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [WeeklyAvailabilityComponent, ScheduleExceptionsComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ScheduleRoutingModule,
    SharedModule,
  ],
  exports: [WeeklyAvailabilityComponent, ScheduleExceptionsComponent],
})
export class ScheduleModule {}