import { Component, OnInit } from '@angular/core';
import { AvailabilityService } from '../services/availability.service';

@Component({
  selector: 'app-weekly-availability',
  templateUrl: './weekly-availability.component.html',
  styleUrls: ['./weekly-availability.component.css']
})
export class WeeklyAvailabilityComponent implements OnInit {
  slots: any[] = [];
  doctorId: string = ''; // TODO: get this from the logged-in user via AuthService later

  newSlot = {
    doctorId: '',
    dayOfWeek: 'Monday',
    startTime: '',
    endTime: '',
    slotDurationMinutes: 30
  };

  days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  constructor(private availabilityService: AvailabilityService) {}

  ngOnInit() {
    if (this.doctorId) {
      this.loadSlots();
    }
  }

  loadSlots() {
    this.availabilityService.getAvailabilityByDoctor(this.doctorId).subscribe((data: any) => {
      this.slots = data.data || data;
    });
  }

  addSlot() {
    this.newSlot.doctorId = this.doctorId;
    this.availabilityService.addAvailability(this.newSlot).subscribe(() => {
      this.loadSlots();
    });
  }

  deleteSlot(id: string) {
    this.availabilityService.deleteAvailability(id).subscribe(() => {
      this.loadSlots();
    });
  }
}