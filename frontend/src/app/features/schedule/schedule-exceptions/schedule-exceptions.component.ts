import { Component, OnInit } from '@angular/core';
import { ScheduleService } from '../services/schedule.service';

@Component({
  selector: 'app-schedule-exceptions',
  templateUrl: './schedule-exceptions.component.html',
  styleUrls: ['./schedule-exceptions.component.css']
})
export class ScheduleExceptionsComponent implements OnInit {
  exceptions: any[] = [];
  doctorId: string = '6a7a68e2039344ea7b05c884'; // TODO: replace with real logged-in doctor's ID via AuthService later

  newException = {
    doctorId: '',
    startDate: '',
    endDate: '',
    type: 'Vacation',
    reason: ''
  };

  types = ['Vacation', 'Blocked', 'Emergency'];

  constructor(private scheduleService: ScheduleService) {}

  ngOnInit() {
    if (this.doctorId) {
      this.loadExceptions();
    }
  }

  loadExceptions() {
    this.scheduleService.getExceptionsByDoctor(this.doctorId).subscribe((data: any) => {
      this.exceptions = data.data || data;
    });
  }

  addException() {
    this.newException.doctorId = this.doctorId;
    this.scheduleService.addException(this.newException).subscribe(() => {
      this.loadExceptions();
    });
  }

  deleteException(id: string) {
    this.scheduleService.deleteException(id).subscribe(() => {
      this.loadExceptions();
    });
  }
}