import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

// AG Grid Enterprise Module Registration
import { ModuleRegistry } from 'ag-grid-community';
import { ServerSideRowModelModule } from 'ag-grid-enterprise';
import { LicenseManager } from 'ag-grid-enterprise'; // Import LicenseManager

// IMPORTANT: Replace 'YOUR_AG_GRID_ENTERPRISE_LICENSE_KEY' with your actual license key.
// If you don't have one, you can use a trial license key provided by AG Grid.
// Without a valid license, Enterprise features will not work and may throw errors.
LicenseManager.setLicenseKey('MTc0OTg1NTYwMDAwMA==d32caadaa45d7052a15febfa3ab0a37e');

// Register the enterprise module here, before bootstrapping the application
ModuleRegistry.registerModules([ServerSideRowModelModule]);


platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));