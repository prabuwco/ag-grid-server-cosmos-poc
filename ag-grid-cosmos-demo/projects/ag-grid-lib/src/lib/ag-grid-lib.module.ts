// ag-grid-cosmos-demo/projects/ag-grid-lib/src/lib/ag-grid-lib.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridServerSideComponent } from './components/ag-grid-server-side/ag-grid-server-side.component';
import { AgGridAngular } from 'ag-grid-angular'; // AG Grid Angular Component
import { HttpClientModule } from '@angular/common/http'; // For HTTP requests
import { FormsModule } from '@angular/forms'; // For ngModel on search input

// AG Grid Enterprise Module Registration (moved here for library scope)
import { ModuleRegistry } from 'ag-grid-community';
import { ServerSideRowModelModule } from 'ag-grid-enterprise';

// Register the enterprise module here, so it's available when the library is imported
ModuleRegistry.registerModules([ServerSideRowModelModule]);

@NgModule({
  declarations: [
    AgGridServerSideComponent
  ],
  imports: [
    CommonModule,
    AgGridAngular, // Import AgGridAngular directly
    HttpClientModule,
    FormsModule
  ],
  exports: [
    AgGridServerSideComponent // Export the component so other apps can use it
  ]
})
export class AgGridLibModule { }
