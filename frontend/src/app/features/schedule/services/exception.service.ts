import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class ExceptionService {
  // private apiUrl = 'http://localhost:8080/api/exceptions';
  private apiUrl = `${environment.apiUrl}/api/exceptions`;
  constructor(private http: HttpClient) { }

  addException(data: any) {
    return this.http.post(this.apiUrl, data);
  }

  getExceptionsByDoctor(doctorId: string) {
    return this.http.get(`${this.apiUrl}/${doctorId}`);
  }

  deleteException(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}