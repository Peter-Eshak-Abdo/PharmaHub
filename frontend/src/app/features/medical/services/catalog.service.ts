import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Diagnosis {
  _id?: string;
  name: string;
  icdCode: string;
  description?: string;
}

export interface Medication {
  _id?: string;
  name: string;
  genericName: string;
  type: string;
}

@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  private diagnosesUrl = `${environment.apiUrl}/diagnoses`;
  private medicationsUrl = `${environment.apiUrl}/medications`;

  constructor(private http: HttpClient) { }

  /**
   * Fetch all diagnoses in catalog with optional search filter
   * GET /api/diagnoses
   */
  getDiagnoses(search?: string): Observable<any> {
    let params = new HttpParams();
    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }
    return this.http.get<any>(this.diagnosesUrl, { params });
  }

  /**
   * Fetch all medications in catalog with optional search filter
   * GET /api/medications
   */
  getMedications(search?: string): Observable<any> {
    let params = new HttpParams();
    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }
    return this.http.get<any>(this.medicationsUrl, { params });
  }

  /**
   * Add a new diagnosis to the catalog
   * POST /api/diagnoses
   */
  addDiagnosis(payload: any): Observable<any> {
    return this.http.post<any>(this.diagnosesUrl, payload);
  }

  /**
   * Add a new medication to the catalog
   * POST /api/medications
   */
  addMedication(payload: any): Observable<any> {
    return this.http.post<any>(this.medicationsUrl, payload);
  }
}

