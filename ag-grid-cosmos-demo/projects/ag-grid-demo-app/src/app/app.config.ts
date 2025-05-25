
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http'; // Import provideHttpClient

import { routes } from './app.routes'; // Assuming app.routes.ts for standalone routing
import { AgGridLibModule } from 'ag-grid-lib'; // Import the library module

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient() // Provide HttpClient for the application
  ]
};