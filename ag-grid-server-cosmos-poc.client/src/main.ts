import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { LicenseManager } from 'ag-grid-enterprise';

// Set your AG Grid license key
LicenseManager.setLicenseKey('YOUR_LICENSE_KEY_HERE');


bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
