import { Component, OnInit } from '@angular/core';
import { ScheduleService } from '../services/schedule.service';

@Component({
  selector: 'app-weekly-availability',
  templateUrl: './weekly-availability.component.html',
  styleUrls: ['./weekly-availability.component.css']
})
export class WeeklyAvailabilityComponent implements OnInit {
  slots: any[] = [];
  doctorId: string = '6a7a68e2039344ea7b05c884'; // TODO: replace with real logged-in doctor's ID via AuthService later

  newSlot = {
    doctorId: '',
    dayOfWeek: 'Monday',
    startTime: '',
    endTime: '',
    slotDurationMinutes: 30
  };

  days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  constructor(private scheduleService: ScheduleService) {}

  ngOnInit() {
    if (this.doctorId) {
      this.loadSlots();
    }
  }

  loadSlots() {
    this.scheduleService.getAvailabilityByDoctor(this.doctorId).subscribe((data: any) => {
      this.slots = data.data || data;
    });
  }

  addSlot() {
    this.newSlot.doctorId = this.doctorId;
    this.scheduleService.addAvailability(this.newSlot).subscribe(() => {
      this.loadSlots();
    });
  }

  deleteSlot(id: string) {
    this.scheduleService.deleteAvailability(id).subscribe(() => {
      this.loadSlots();
    });
  }
}