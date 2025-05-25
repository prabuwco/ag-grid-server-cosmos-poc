import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, retry, tap, throwError } from 'rxjs';
import { GridRequest } from '../models/grid-request.model';
import { GridResponse } from '../models/grid-response.model';
import { ExportRequest } from '../models/export-request.model';
import { CosmosItem } from '../models/cosmos-item.model'; // Import the CosmosItem model

@Injectable({
  providedIn: 'root' // This service is provided at the root level, making it available throughout the app/library
})
export class DataService {
  
  constructor(private http: HttpClient) { }

  /**
   * Fetches data for the AG Grid server-side row model.
   * @param request The AG Grid request payload (pagination, sorting, filtering, search).
   * @returns An Observable of GridResponse.
   */
  getGridData(endpointUrl: string,request: GridRequest): Observable<GridResponse> {
    console.log(`Sending grid request to ${endpointUrl}:`, request);
    return this.http.post<GridResponse>(endpointUrl, request).pipe(
      retry(1), // Retry the request up to 1 time on failure (e.g., network error)
      tap(response => console.log('Received grid data response:', response)), // Log success
      catchError(this.handleError) // Centralized error handling
    );
  }


  /**
   * Exports all records to an Excel file.
   * @returns An Observable of Blob (the Excel file).
   */
  exportAllRecords(endpointUrl:string): Observable<Blob> {
    console.log(`Sending export all request to ${endpointUrl}:`);
    return this.http.get(endpointUrl, { responseType: 'blob' }).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }


  /**
   * Exports currently visible records to an Excel file.
   * @param request The export request containing records and column keys.
   * @returns An Observable of Blob (the Excel file).
   */
  exportVisibleRecords(endpointUrl:string,exportRequest: { records: CosmosItem[], columnKeys: string[] }): Observable<Blob> {
    console.log(`Sending export visible request to ${endpointUrl}:`, exportRequest);
    // ResponseType 'blob' is crucial for file downloads
    return this.http.post(endpointUrl, exportRequest, { responseType: 'blob' }).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side network error
      errorMessage = `Network Error: ${error.error.message}`;
      console.error('Client-side network error:', error.error.message);
    } else {
      // Backend error (API is down, or server returned an error)
      if (error.status === 0) {
        errorMessage = 'Server is unreachable. Please check your network connection or try again later.';
        console.error('API is down or unreachable:', error.statusText);
      } else {
        errorMessage = `Server Error: ${error.status} - ${error.statusText || ''} ${error.error ? JSON.stringify(error.error) : ''}`;
        console.error(`Backend returned code ${error.status}, body was: ${error.error}`);
      }
    }
    // You can also send the error to a remote logging infrastructure
    // console.error(error); // Keep this for development

    // Propagate the error using throwError, which is caught by the subscriber
    return throwError(() => new Error(errorMessage));
  }

}
