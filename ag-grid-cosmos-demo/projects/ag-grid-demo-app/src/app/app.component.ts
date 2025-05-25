import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ColDef, GridApi /* Removed ColumnApi */ } from 'ag-grid-community'; // Removed ColumnApi
import { AgGridServerSideComponent } from 'ag-grid-lib'; // Import the reusable component
import { CosmosItem } from 'ag-grid-lib'; // Import the model

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [RouterOutlet, RouterLink, RouterLinkActive] 
})
export class AppComponent implements AfterViewInit {
  title = 'AG Grid Cosmos DB Demo';

  @ViewChild(AgGridServerSideComponent) agGridComponent!: AgGridServerSideComponent;

  // Define column definitions for the AG Grid
  public columnDefs: ColDef[] = [
    { field: 'id', headerName: 'ID', filter: 'agTextColumnFilter' },
    { field: 'name', headerName: 'Name', filter: 'agTextColumnFilter' },
    { field: 'category', headerName: 'Category', filter: 'agTextColumnFilter' }, // Use text filter for category
    { field: 'value', headerName: 'Value', filter: 'agNumberColumnFilter' },
    { field: 'description', headerName: 'Description', filter: 'agTextColumnFilter' },
    {
      field: 'date',
      headerName: 'Date',
      filter: 'agDateColumnFilter', // Use AG Grid's date filter
      valueFormatter: (params) => { // Directly define formatter here for robustness
            if (params.value) {
              try {
                const date = new Date(params.value);
                return date.toLocaleString('en-US', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: false
                });
              } catch (e) {
                return params.value;
              }
            }
            return '';
          },
      // You can add comparator for date sorting if needed, but backend handles it
    }
  ];

  public defaultColDef: ColDef = {
    flex: 1,
    minWidth: 120,
    resizable: true,
    sortable: true,
    filter: true,
    floatingFilter: true,
  };

  public gridApi!: GridApi;
  // public gridColumnApi!: ColumnApi; // Removed this declaration
  public currentGridData: CosmosItem[] = []; // To store currently displayed data

  ngAfterViewInit(): void {
    // The agGridComponent is available here
    // You can access its methods and properties if needed
  }

  onGridApiChanged(api: GridApi): void {
    this.gridApi = api;
    console.log('Grid API received in app component:', this.gridApi);
  }

  // Removed onGridColumnApiChanged as ColumnApi is deprecated and merged into GridApi
  // onGridColumnApiChanged(api: ColumnApi): void {
  //   this.gridColumnApi = api;
  //   console.log('Grid Column API received in app component:', this.gridColumnApi);
  // }

  onRowDataUpdated(rowData: CosmosItem[]): void {
    this.currentGridData = rowData;
    console.log('Row data updated in app component. Current visible rows:', this.currentGridData.length);
  }

  // Example of how a parent component could trigger a refresh
  triggerGridRefresh(): void {
    if (this.agGridComponent) {
      this.agGridComponent.refreshGrid();
    }
  }

  // Example of how a parent component could trigger exports
  triggerExportAll(): void {
    if (this.agGridComponent) {
      this.agGridComponent.exportAllDataToExcel();
    }
  }

  triggerExportVisible(): void {
    if (this.agGridComponent) {
      this.agGridComponent.exportVisibleDataToExcel();
    }
  }
}
