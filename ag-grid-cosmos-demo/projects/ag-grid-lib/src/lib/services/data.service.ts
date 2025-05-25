import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GridRequest } from '../models/grid-request.model';
import { GridResponse } from '../models/grid-response.model';
import { ExportRequest } from '../models/export-request.model';

@Injectable({
  providedIn: 'root' // This service is provided at the root level, making it available throughout the app/library
})
export class DataService {
  // Base URL for your .NET backend API.
  // IMPORTANT: Ensure this matches the URL your .NET API is running on.
  private apiUrl = 'https://localhost:7003/api/data'; // Or http://localhost:5000/api/data

  constructor(private http: HttpClient) { }

  /**
   * Fetches data for the AG Grid server-side row model.
   * @param request The AG Grid request payload (pagination, sorting, filtering, search).
   * @returns An Observable of GridResponse.
   */
  getGridData(request: GridRequest): Observable<GridResponse> {
    return this.http.post<GridResponse>(`${this.apiUrl}/getGridData`, request);
  }

  /**
   * Exports all records to an Excel file.
   * @returns An Observable of Blob (the Excel file).
   */
  exportAllRecords(): Observable<Blob> {
    // ResponseType 'blob' is crucial for file downloads
    return this.http.get(`${this.apiUrl}/exportAll`, { responseType: 'blob' });
  }

  /**
   * Exports currently visible records to an Excel file.
   * @param request The export request containing records and column keys.
   * @returns An Observable of Blob (the Excel file).
   */
  exportVisibleRecords(request: ExportRequest): Observable<Blob> {
    // ResponseType 'blob' is crucial for file downloads
    return this.http.post(`${this.apiUrl}/exportVisible`, request, { responseType: 'blob' });
  }
}
