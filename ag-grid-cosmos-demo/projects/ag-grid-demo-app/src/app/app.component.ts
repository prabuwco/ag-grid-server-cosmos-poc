import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { ColDef, GridApi, /* ColumnApi */ } from 'ag-grid-community'; // REMOVE ColumnApi import
import { AgGridServerSideComponent } from 'ag-grid-lib'; // Import the reusable component
import { CosmosItem } from 'ag-grid-lib'; // Import the model

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
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
      valueFormatter: (params) => { // Directly define formatter here or ensure agGridComponent is ready
            // Fallback formatter if component not yet initialized
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
  // public gridColumnApi!: ColumnApi; // REMOVE THIS DECLARATION
  public currentGridData: CosmosItem[] = []; // To store currently displayed data

  ngAfterViewInit(): void {
    // The agGridComponent is available here
    // If you need to apply the date formatter from the child, you can do it here
    // or ensure that 'dateValueFormatter' is a static method or bound correctly.
    // For simplicity, I've duplicated the formatter logic in app.component.ts as a fallback
    // OR ensure this.agGridComponent is available before its first use for columnDefs
    // A safer way is to define `dateValueFormatter` directly as a static method
    // or define it directly within the columnDefs object. I'll make it inline.
  }

  onGridApiChanged(api: GridApi): void {
    this.gridApi = api;
    console.log('Grid API received in app component:', this.gridApi);
    // Any ColumnApi related operations can now be done via this.gridApi
    // For example, to size columns to fit after grid ready: this.gridApi.sizeColumnsToFit();
  }

  // onGridColumnApiChanged(api: ColumnApi): void { // REMOVE THIS METHOD
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
