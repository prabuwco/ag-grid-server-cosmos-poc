import { Component, OnInit } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { CommonModule } from '@angular/common'; // Required for ngIf
import { FormsModule } from '@angular/forms'; // Typically included if using form elements

@Component({
  selector: 'description-cell-renderer',
  standalone: true, // IMPORTANT: Make it a standalone component
  imports: [CommonModule, FormsModule], // Import necessary modules
  templateUrl: './description-cell-renderer.component.html',
  styleUrls: ['./description-cell-renderer.component.scss']
})
export class DescriptionCellRendererComponent implements ICellRendererAngularComp, OnInit {
  private params!: ICellRendererParams;
  public originalDescription: string = '';
  public displayFullDescription: boolean = false;
  private readonly clipLength = 20; // Customize: Number of characters before clipping

  // agInit is called by AG Grid to initialize the cell renderer
  agInit(params: ICellRendererParams): void {
    this.params = params;
    this.originalDescription = params.value; // 'value' is the description string for the cell
  }

  ngOnInit(): void {
    // Optional: any additional initialization logic for the component
  }

  // refresh is called by AG Grid if the cell value changes
  refresh(params: ICellRendererParams): boolean {
    if (params.value !== this.originalDescription) {
      this.originalDescription = params.value;
      this.displayFullDescription = false; // Reset to clipped view on data change
    }
    return true; // Indicate that this component can refresh its view
  }

  // Toggles between showing full description and clipped description
  toggleDescription(): void {
    this.displayFullDescription = !this.displayFullDescription;
    // Notify AG Grid that the row height might need adjustment
    if (this.params.api) {
        this.params.api.resetRowHeights(); // Recalculates all row heights (can be optimized for large grids)
        // Or for a single row: this.params.api.onRowHeightChanged();
    }
  }

  // Getter to provide the text to be displayed in the cell
  get displayedText(): string {
    if (this.displayFullDescription || this.originalDescription.length <= this.clipLength) {
      return this.originalDescription;
    }
    return this.originalDescription.substring(0, this.clipLength) + '...';
  }

  // Getter to determine if the toggle button should be shown
  get showToggleButton(): boolean {
    return this.originalDescription.length > this.clipLength;
  }
}