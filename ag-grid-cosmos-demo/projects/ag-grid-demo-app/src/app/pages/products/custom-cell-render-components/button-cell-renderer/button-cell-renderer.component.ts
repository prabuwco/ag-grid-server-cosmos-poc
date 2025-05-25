import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { CommonModule } from '@angular/common'; // Required for standalone components

@Component({
  selector: 'app-button-cell-renderer',
  standalone: true, // Mark as standalone
  imports: [CommonModule], // Import CommonModule
  templateUrl: './button-cell-renderer.component.html',
  styleUrls: ['./button-cell-renderer.component.scss']
 
})
export class ButtonCellRendererComponent implements ICellRendererAngularComp {
  private params!: ICellRendererParams;

  // agInit is called by AG Grid to initialize the cell renderer
  agInit(params: ICellRendererParams): void {
    this.params = params;
  }

  // refresh is called by AG Grid if the cell value changes
  refresh(params: ICellRendererParams): boolean {
    this.params = params; // Update params if data changes
    return true; // Indicate that this component can refresh
  }

  // This method is called when the button is clicked
  onClick(): void {
    if (this.params.data) {
      // Use alert to display the JSON string representation of the row data
     // alert('Row Data:\n' + JSON.stringify(this.params.data, null, 2));
      console.log('Clicked row data:', this.params.data); // Also log to console for debugging
    } else {
      alert('No row data found for this row.');
    }
  }
}