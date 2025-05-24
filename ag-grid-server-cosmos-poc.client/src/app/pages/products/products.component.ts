import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

@Component({
  selector: 'app-products',
  imports: [],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent {
  columnDefs = [
    { field: 'id', sortable: true, filter: true },
    { field: 'name', sortable: true, filter: true },
    { field: 'category', sortable: true, filter: true }
  ];

  constructor(private http: HttpClient) {}

  fetchData = async ({ startRow, endRow, sortModel, filterModel }: any) => {
    const response = await this.http.post<any>('/api/items/query', {
      startRow,
      endRow,
      sortModel,
      filterModel
    }).toPromise();
    return response;
  }
}
