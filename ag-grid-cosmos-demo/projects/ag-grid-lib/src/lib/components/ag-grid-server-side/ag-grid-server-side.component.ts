import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import {
  GridApi,
  GridReadyEvent,
  ColDef,
  IServerSideDatasource,
  IServerSideGetRowsParams,
  ValueFormatterParams,
  GetRowIdParams,
  LoadSuccessParams // Import LoadSuccessParams for the new success callback
} from 'ag-grid-community';
import { DataService } from '../../services/data.service';
import { GridRequest } from '../../models/grid-request.model';
import { GridResponse } from '../../models/grid-response.model';
import { CosmosItem } from '../../models/cosmos-item.model';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'ag-grid-server-side',
  templateUrl: './ag-grid-server-side.component.html',
  styleUrls: ['./ag-grid-server-side.component.scss'],
  standalone: false // This component is not standalone, it will be used in a module
})
export class AgGridServerSideComponent implements OnInit, OnDestroy {
  @ViewChild('agGrid') agGrid!: AgGridAngular;

  // Inputs for reusability
  @Input() columnDefs: ColDef[] = [];
  @Input() defaultColDef: ColDef = {
    flex: 1,
    minWidth: 100,
    resizable: true,
    sortable: true,
    filter: true, // Enable all column filters by default
    floatingFilter: true // Show filter input boxes below headers
  };
  @Input() rowModelType: 'serverSide' | 'clientSide' = 'serverSide';
  @Input() pagination: boolean = true;
  @Input() paginationPageSize: number = 20;
  @Input() cacheBlockSize: number = 100; // How many rows to fetch in one go
  @Input() maxBlocksInCache: number = 10; // Max number of blocks to keep in cache
  @Input() enableBrowserTooltips: boolean = true;
  @Input() tooltipShowDelay: number = 500;
  @Input() rowBuffer: number = 0; // No row buffer needed for server-side
  @Input() suppressScrollOnNewData: boolean = true; // Prevents scroll reset on new data
  @Input() animateRows: boolean = true;
  @Input() enableRangeSelection: boolean = true;
  @Input() getRowId: ((params: GetRowIdParams) => string) | undefined; // Function to get unique row ID

  // Outputs for parent component to react to grid events or get API instances
  @Output() gridReady = new EventEmitter<GridReadyEvent>();
  @Output() gridApiChanged = new EventEmitter<GridApi>();
  @Output() rowDataUpdated = new EventEmitter<CosmosItem[]>();

  public gridApi!: GridApi;
  public serverSideDatasource!: IServerSideDatasource;
  public globalSearchText: string = '';

  private globalSearchSubject = new Subject<string>();
  private globalSearchSubscription!: Subscription;

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    // Set a default getRowId if not provided, assuming 'id' is always present and unique
    if (!this.getRowId) {
      this.getRowId = (params: GetRowIdParams) => params.data.id;
    }

    this.setupGlobalSearchDebounce();
  }

  ngOnDestroy(): void {
    if (this.globalSearchSubscription) {
      this.globalSearchSubscription.unsubscribe();
    }
  }

  /**
   * Sets up debouncing for the global search input.
   * This prevents excessive API calls as the user types.
   */
  private setupGlobalSearchDebounce(): void {
    this.globalSearchSubscription = this.globalSearchSubject.pipe(
      debounceTime(500), // Wait for 500ms after the last keystroke
      distinctUntilChanged() // Only emit if the value has changed
    ).subscribe(searchText => {
      this.onGlobalSearch(searchText);
    });
  }

  /**
   * Handles the gridReady event from AG Grid.
   * Initializes the GridApi and sets up the server-side datasource.
   * @param params GridReadyEvent
   */
  onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;

    this.gridApiChanged.emit(this.gridApi);
    this.gridReady.emit(params);

    this.serverSideDatasource = this.createServerSideDatasource(this.dataService);

    // Corrected: Use setGridOption for setting serverSideDatasource
    this.gridApi.setGridOption('serverSideDatasource', this.serverSideDatasource);
  }

  /**
   * Creates the IServerSideDatasource object for AG Grid.
   * This object tells AG Grid how to fetch data from the backend.
   * @param dataService The service to call the backend API.
   * @returns IServerSideDatasource
   */
  private createServerSideDatasource(dataService: DataService): IServerSideDatasource {
    return {
      getRows: (params: IServerSideGetRowsParams) => {
        console.log('AG Grid requesting rows:', params.request);

        const request: GridRequest = {
          startRow: params.request.startRow || 0,
          endRow: params.request.endRow || 0,
          sortModel: params.request.sortModel as any, // Cast to match backend model
          filterModel: params.request.filterModel as any, // Cast to match backend model
          searchQuery: this.globalSearchText // Include global search text
        };

        dataService.getGridData(request).subscribe({
          next: (response: GridResponse) => {
            console.log('Backend response:', response);
            if (response.data) {
              // Corrected: Use the newer 'success' callback
              const loadSuccessParams: LoadSuccessParams = {
                rowData: response.data,
                rowCount: response.totalRowCount
              };
              params.success(loadSuccessParams);
              this.rowDataUpdated.emit(response.data); // Emit updated row data
            } else {
              console.error('Backend response missing data array:', response);
              // Corrected: Use the newer 'fail' callback
              params.fail();
            }
          },
          error: (error) => {
            console.error('Error fetching data from backend:', error);
            // Corrected: Use the newer 'fail' callback
            params.fail();
            // Optionally, show a user-friendly error message
          }
        });
      }
    };
  }

  /**
   * Refreshes the AG Grid data.
   * This method can be called by the parent component to force a data reload.
   */
  refreshGrid(): void {
    if (this.gridApi) {
      // Refreshing the server-side cache can be done via refreshServerSide()
      // or by re-setting the datasource
      this.gridApi.setGridOption('serverSideDatasource', this.serverSideDatasource);
    }
  }

  /**
   * Handles global search input changes.
   * Uses a Subject and debounceTime to avoid calling the API on every keystroke.
   * @param event The input event.
   */
  onGlobalSearchInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.globalSearchSubject.next(inputElement.value);
  }

  /**
   * Triggers a grid refresh with the current global search text.
   * This is called by the debounced subject.
   * @param searchText The global search text.
   */
  private onGlobalSearch(searchText: string): void {
    this.globalSearchText = searchText;
    this.refreshGrid();
  }

  /**
   * Exports all records from the backend to an Excel file.
   */
  exportAllDataToExcel(): void {
    console.log('Exporting all data to Excel...');
    this.dataService.exportAllRecords().subscribe({
      next: (blob: Blob) => {
        this.downloadFile(blob, 'AllRecords.xlsx');
        console.log('All data exported successfully.');
      },
      error: (error) => {
        console.error('Error exporting all data:', error);
        // Optionally, show a user-friendly error message
      }
    });
  }

  /**
   * Exports currently visible records in the grid to an Excel file.
   */
  exportVisibleDataToExcel(): void {
    if (!this.gridApi) {
      console.warn('Grid API not ready for export visible.');
      return;
    }

    console.log('Exporting visible data to Excel...');

    // Get all visible rows in the grid
    const visibleRows: CosmosItem[] = [];
    this.gridApi.forEachNodeAfterFilterAndSort((node) => {
      if (node.data) {
        visibleRows.push(node.data);
      }
    });

    // Get all visible column keys - now accessed via gridApi.getDisplayedColumns()
    const visibleColumnKeys: string[] = this.gridApi.getAllDisplayedColumns() // Correct usage for GridApi
      .map(col => col.getColId())
      .filter(colId => colId !== 'ag-Grid-AutoColumn'); // Exclude internal AG Grid columns

    const exportRequest = {
      records: visibleRows,
      columnKeys: visibleColumnKeys
    };

    this.dataService.exportVisibleRecords(exportRequest).subscribe({
      next: (blob: Blob) => {
        this.downloadFile(blob, 'VisibleRecords.xlsx');
        console.log('Visible data exported successfully.');
      },
      error: (error) => {
        console.error('Error exporting visible data:', error);
        // Optionally, show a user-friendly error message
      }
    });
  }

  /**
   * Helper function to trigger file download in the browser.
   * @param blob The Blob object containing the file data.
   * @param fileName The desired name for the downloaded file.
   */
  private downloadFile(blob: Blob, fileName: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Value formatter for the Date column to display it in a readable format.
   * @param params ValueFormatterParams
   * @returns Formatted date string or original value.
   */
  dateValueFormatter(params: ValueFormatterParams): string {
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
        console.error('Error formatting date:', params.value, e);
        return params.value;
      }
    }
    return '';
  }
}
