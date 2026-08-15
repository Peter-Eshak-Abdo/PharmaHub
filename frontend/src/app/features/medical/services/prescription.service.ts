import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface MedicationItem {
  medicationId: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  notes?: string;
}

export interface PrescriptionPayload {
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  diagnosisIds: string[];
  medications: MedicationItem[];
  notes?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PrescriptionService {
  private apiUrl = `${environment.apiUrl}/prescriptions`;
  // private apiUrl = '/api/prescriptions';

  constructor(private http: HttpClient) {}

  /**
   * Fetch prescription for a specific appointment
   * GET /api/prescriptions/appointment/:appointmentId
   */
  getPrescriptionByAppointmentId(appointmentId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/appointment/${appointmentId}`);
  }

  /**
   * Create a new prescription for an appointment
   * POST /api/prescriptions
   */
  createPrescription(appointmentId: string, payload: any): Observable<any> {
    const body = {
      ...payload,
      appointmentId: appointmentId || payload?.appointmentId,
    };
    return this.http.post<any>(this.apiUrl, body);
  }

  /**
   * Fetch all prescriptions for a patient (medical history)
   * GET /api/prescriptions/patient/:patientId
   */
  getPrescriptionsByPatient(patientId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/patient/${patientId}`);
  }
}

