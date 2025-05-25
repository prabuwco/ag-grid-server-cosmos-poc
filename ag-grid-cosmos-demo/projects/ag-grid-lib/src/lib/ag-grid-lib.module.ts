import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridServerSideComponent } from './components/ag-grid-server-side/ag-grid-server-side.component';
import { AgGridAngular } from 'ag-grid-angular'; // AG Grid Angular Component
import { HttpClientModule } from '@angular/common/http'; // For HTTP requests
import { FormsModule } from '@angular/forms'; // For ngModel on search input

// Removed AG Grid Enterprise Module Registration from here
// import { ModuleRegistry } from 'ag-grid-community';
// import { ServerSideRowModelModule } from 'ag-grid-enterprise';
// ModuleRegistry.registerModules([ServerSideRowModelModule]);

@NgModule({
  declarations: [
    AgGridServerSideComponent,
    
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

