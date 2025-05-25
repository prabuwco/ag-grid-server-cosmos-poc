import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Required for ngModel
import { GridApi, PaginationChangedEvent } from 'ag-grid-community';

@Component({
  selector: 'app-jump-to-page',
  standalone: true,
  imports: [CommonModule, FormsModule], // Import FormsModule for ngModel
  template: `
    <div class="jump-to-page-container">
      <label for="pageInput">Go to Page:</label>
      <input
        type="number"
        id="pageInput"
        [(ngModel)]="targetPage"
        (keyup.enter)="goToPage()"
        [min]="1"
        [max]="totalPages"
        placeholder="Page {{currentPage + 1}} of {{totalPages}}"
        class="page-input"
      />
      <button (click)="goToPage()" class="go-button">Go</button>
      <span *ngIf="errorMessage" class="error-message">{{ errorMessage }}</span>
    </div>
  `,
  styles: [`
    .jump-to-page-container {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 10px 0; /* Add some spacing around it */
      padding: 10px;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      background-color: #f9f9f9;
      font-family: Arial, sans-serif;
    }
    label {
      font-weight: bold;
      color: #333;
    }
    .page-input {
      padding: 6px 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
      width: 80px; /* Adjust width as needed */
      text-align: center;
      -moz-appearance: textfield; /* Remove default number input arrows in Firefox */
    }
    .page-input::-webkit-outer-spin-button,
    .page-input::-webkit-inner-spin-button {
      -webkit-appearance: none; /* Remove default number input arrows in Chrome/Safari */
      margin: 0;
    }
    .page-input:focus {
      border-color: #007bff;
      outline: none;
      box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
    }
    .go-button {
      padding: 6px 15px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .go-button:hover {
      background-color: #0056b3;
    }
    .error-message {
      color: red;
      margin-left: 10px;
      font-size: 0.9em;
    }
  `]
})
export class JumpToPageComponent implements OnChanges {
  @Input() gridApi: GridApi | null = null; // Input to receive the GridApi instance
  @Input() currentPage: number = 0; // Current page (0-indexed from AG Grid)
  @Input() totalPages: number = 0; // Total available pages
  @Input() totalRows: number = 0; // Total number of rows

  targetPage: number | null = null; // Value from the input field (1-indexed for user)
  errorMessage: string = '';

  // Listen for changes in input properties (like currentPage)
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentPage'] && this.gridApi) {
        // Update input field to reflect current page (1-indexed for user)
        this.targetPage = this.currentPage + 1;
        this.errorMessage = ''; // Clear error on page change
    }
  }

  goToPage(): void {
    this.errorMessage = ''; // Clear previous errors

    if (!this.gridApi) {
      this.errorMessage = 'Grid API not available.';
      return;
    }

    // Validate input
    if (this.targetPage === null || isNaN(this.targetPage) || this.targetPage < 1) {
      this.errorMessage = 'Please enter a valid page number.';
      return;
    }

    const pageNum = Math.floor(this.targetPage) - 1; // Convert user's 1-based input to AG Grid's 0-based page index

    if (pageNum >= this.totalPages || pageNum < 0) {
      this.errorMessage = `Page number must be between 1 and ${this.totalPages}.`;
      return;
    }

    // Use GridApi to navigate to the specified page
    this.gridApi.paginationGoToPage(pageNum);
    // Optional: you might want to clear or reset `targetPage` here,
    // but `ngOnChanges` will update it when the page actually changes.
  }
}