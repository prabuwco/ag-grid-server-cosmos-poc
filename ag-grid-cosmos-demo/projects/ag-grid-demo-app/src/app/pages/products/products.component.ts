import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import { AgGridLibModule, CosmosItem } from 'ag-grid-lib'; // Import CosmosItem model

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
  title = 'AG Grid Cosmos DB Demo (Products)';

  // Example: Different column definitions for Page 2
  public columnDefs: ColDef[] = [
    { field: 'name', headerName: 'Product Name', filter: 'agTextColumnFilter' },
    { field: 'category', headerName: 'Product Category', filter: 'agTextColumnFilter' },
    { field: 'value', headerName: 'Price', filter: 'agNumberColumnFilter' },
    { field: 'date', headerName: 'Manufacture Date', filter: 'agDateColumnFilter',
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

  public defaultColDef: ColDef = {
    flex: 1,
    minWidth: 100,
    resizable: true,
    sortable: true,
    filter: true,
    floatingFilter: true,
  };

  // You can still get the grid API if needed
  onGridApiChanged(api: any): void {
    console.log('Page 2 Grid API received:', api);
  }

  onRowDataUpdated(rowData: CosmosItem[]): void {
    console.log('Page 2 Row data updated. Current visible rows:', rowData.length);
  }

  // If you wanted a different API endpoint, you'd modify DataService or create a new one
  // For this example, it uses the same DataService which points to the single backend endpoint.
  // If you had /api/Data/getProducts and /api/Data/getOrders, you'd inject DataService and call the appropriate method.

}
