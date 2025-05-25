import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import { AgGridLibModule } from 'ag-grid-lib'; // Import CosmosItem model
import { ProductItem } from '../../models/product-item.model';
import { DescriptionCellRendererComponent } from './custom-cell-render-components/description-cell-renderer/description-cell-renderer.component';
import { ButtonCellRendererComponent } from './custom-cell-render-components/button-cell-renderer/button-cell-renderer.component';

@Component({
  selector: 'app-products',
  imports: [
    CommonModule,
    AgGridLibModule // Import the reusable AG Grid component directly
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent {
  title = 'Products';

  gridDataEndpointApiUrl: string = 'https://localhost:7003/api/data/getGridData';
  excelExportAllRecordsApiUrl: string = 'https://localhost:7003/api/data/exportAll';
  excelExportVisibleRecordsApiUrl: string = 'https://localhost:7003/api/data/exportVisible';
  // Example: Different column definitions for Page 2
  public columnDefs: ColDef[] = [
    {
      headerName: 'Actions', // Header for the new column
      cellRenderer: ButtonCellRendererComponent, // Use your custom button renderer
      minWidth: 120, // Give it enough width for the button
      maxWidth: 150, // Optional: Limit max width
      flex: 0, // Prevent it from taking up extra space
      resizable: false, // Make it non-resizable by the user
      sortable: false, // Buttons are not sortable
      filter: false, // Buttons are not filterable
      suppressMovable: true // Optional: Prevent dragging the column to reorder
    },
    { field: 'name', headerName: 'Product Name', filter: 'agTextColumnFilter' },
    { field: 'category', headerName: 'Product Category', filter: 'agTextColumnFilter' },
    { field: 'value', headerName: 'Price', filter: 'agNumberColumnFilter', floatingFilter: false },
    {
      field: 'description',
      headerName: 'Description',
      filter: 'agTextColumnFilter',
      cellRenderer: DescriptionCellRendererComponent, // Use your custom cell renderer here
      autoHeight: true, // IMPORTANT: Allows the row to expand when description expands
      minWidth: 200
    },
    {
      field: 'date', headerName: 'Date', filter: 'agDateColumnFilter',
      valueFormatter: (params) => {
        if (params.value) {
          try {
            const date = new Date(params.value);
            return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
          } catch (e) {
            return params.value;
          }
        }
        return '';
      }
    },
  ];
  // You can still get the grid API if needed
  onGridApiChanged(api: any): void {
    console.log('Products Grid API received:', api);
  }

  onRowDataUpdated(rowData: ProductItem[]): void {
    console.log('Products Row data updated. Current visible rows:', rowData.length);
  }
}
