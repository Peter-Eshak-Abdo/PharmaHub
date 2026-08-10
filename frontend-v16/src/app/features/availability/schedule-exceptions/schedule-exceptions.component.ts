import { Component, OnInit } from '@angular/core';
import { ExceptionService } from '../services/exception.service';

@Component({
  selector: 'app-schedule-exceptions',
  templateUrl: './schedule-exceptions.component.html',
  styleUrls: ['./schedule-exceptions.component.css']
})
export class ScheduleExceptionsComponent implements OnInit {
  exceptions: any[] = [];
  doctorId: string = ''; // TODO: get this from the logged-in user via AuthService later

  newException = {
    doctorId: '',
    startDate: '',
    endDate: '',
    type: 'Vacation',
    reason: ''
  };

  types = ['Vacation', 'Blocked', 'Emergency'];

  constructor(private exceptionService: ExceptionService) {}

  ngOnInit() {
    if (this.doctorId) {
      this.loadExceptions();
    }
  }

  loadExceptions() {
    this.exceptionService.getExceptionsByDoctor(this.doctorId).subscribe((data: any) => {
      this.exceptions = data.data || data;
    });
  }

  addException() {
    this.newException.doctorId = this.doctorId;
    this.exceptionService.addException(this.newException).subscribe(() => {
      this.loadExceptions();
    });
  }

  deleteException(id: string) {
    this.exceptionService.deleteException(id).subscribe(() => {
      this.loadExceptions();
    });
  }
}