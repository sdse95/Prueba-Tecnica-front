import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  CreatePatientRequest,
  PagedResponse,
  PatientListQuery,
  PatientResponse,
  UpdatePatientRequest,
} from '../models/patient.models';

@Injectable({
  providedIn: 'root',
})
export class PatientService {
  private readonly resourceUrl = `${environment.apiUrl}/patients`;

  constructor(private readonly http: HttpClient) {}

  getPatients(query: PatientListQuery): Observable<PagedResponse<PatientResponse>> {
    let params = new HttpParams();
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    params = params.set('page', String(page)).set('pageSize', String(pageSize));
    if (query.name?.trim()) {
      params = params.set('name', query.name.trim());
    }
    if (query.documentNumber?.trim()) {
      params = params.set('documentNumber', query.documentNumber.trim());
    }
    return this.http.get<PagedResponse<PatientResponse>>(this.resourceUrl, { params });
  }

  getById(id: number): Observable<PatientResponse> {
    return this.http.get<PatientResponse>(`${this.resourceUrl}/${id}`);
  }

  create(body: CreatePatientRequest): Observable<PatientResponse> {
    return this.http.post<PatientResponse>(this.resourceUrl, body);
  }

  update(id: number, body: UpdatePatientRequest): Observable<PatientResponse> {
    return this.http.put<PatientResponse>(`${this.resourceUrl}/${id}`, body);
  }

  delete(id: number): Observable<void> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' }).pipe(map(() => undefined));
  }

  /**
   * GET /api/patients/created-after?fromDate=...
   * `fromDate` should be ISO 8601 (e.g. from `Date.toISOString()`).
   */
  getCreatedAfter(fromDate: string): Observable<PatientResponse[]> {
    const params = new HttpParams().set('fromDate', fromDate);
    return this.http.get<PatientResponse[]>(`${this.resourceUrl}/created-after`, { params });
  }
}
