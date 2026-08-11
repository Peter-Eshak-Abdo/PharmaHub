import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AvailabilityRoutingModule } from './availability-routing.module';
import { WeeklyAvailabilityComponent } from './weekly-availability/weekly-availability.component';
import { ScheduleExceptionsComponent } from './schedule-exceptions/schedule-exceptions.component';

@NgModule({
  declarations: [
    WeeklyAvailabilityComponent,
    ScheduleExceptionsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    AvailabilityRoutingModule
  ]
})
export class AvailabilityModule { }