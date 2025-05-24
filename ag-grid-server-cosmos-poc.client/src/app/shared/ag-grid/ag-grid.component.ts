import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ColDef, GridOptions, GridReadyEvent, IServerSideDatasource, IServerSideGetRowsParams } from 'ag-grid-community';
import { AgGridAngular } from 'ag-grid-angular';
import 'ag-grid-enterprise';
import { GridConfig } from './ag-grid.model';


@Component({
  selector: 'lib-ag-grid', 
  templateUrl: './ag-grid.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgGridComponent implements OnInit {
  @Input() columnDefs: ColDef[] = [];
  @Input() dataFetcher!: (params: any) => Promise<{ rows: any[], total: number }>;

  gridOptions: GridOptions = {
    pagination: true,
    paginationPageSize: 100,
    cacheBlockSize: 100,
    maxBlocksInCache: 10,    
  };

  private gridApi!: GridApi;

  ngOnInit(): void {}

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    const dataSource = {
      getRows: async (params: any) => {
        const response = await this.dataFetcher({
          startRow: params.request.startRow,
          endRow: params.request.endRow,
          sortModel: params.request.sortModel,
          filterModel: params.request.filterModel
        });
        params.success({ rowData: response.rows, rowCount: response.total });
      }
    };
    this.gridApi.setServerSideDatasource(dataSource);
  }

  exportVisible() {
    this.gridApi.exportDataAsExcel({ onlySelected: false });
  }

  exportAll() {
    window.open('/api/export-all');
  }
}
