import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridServerSideComponent } from './components/ag-grid-server-side/ag-grid-server-side.component';
import { AgGridAngular } from 'ag-grid-angular'; // AG Grid Angular Component
import { HttpClientModule } from '@angular/common/http'; // For HTTP requests
import { FormsModule } from '@angular/forms'; // For ngModel on search input
import {
  CellSelectionModule,
  ValidationModule,
  ColumnAutoSizeModule,
  DateFilterModule,
  LicenseManager,
  ModuleRegistry,
  NumberFilterModule,
  PaginationModule,
  ServerSideRowModelModule,
  TextFilterModule,
  ClientSideRowModelApiModule,
  ColumnApiModule,
  RowApiModule
} from 'ag-grid-enterprise';
LicenseManager.setLicenseKey('[TRIAL]_this_{AG_Charts_and_AG_Grid}_Enterprise_key_{AG-087410}_is_granted_for_evaluation_only___Use_in_production_is_not_permitted___Please_report_misuse_to_legal@ag-grid.com___For_help_with_purchasing_a_production_key_please_contact_info@ag-grid.com___You_are_granted_a_{Single_Application}_Developer_License_for_one_application_only___All_Front-End_JavaScript_developers_working_on_the_application_would_need_to_be_licensed___This_key_will_deactivate_on_{14 June 2025}____[v3]_[0102]_MTc0OTg1NTYwMDAwMA==d32caadaa45d7052a15febfa3ab0a37e');

ModuleRegistry.registerModules([
  ServerSideRowModelModule,
  PaginationModule,
  CellSelectionModule,
  TextFilterModule,
  ClientSideRowModelApiModule,
  ColumnApiModule,
  RowApiModule,
  DateFilterModule,
  NumberFilterModule,
  ColumnAutoSizeModule,
  ValidationModule]);

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

