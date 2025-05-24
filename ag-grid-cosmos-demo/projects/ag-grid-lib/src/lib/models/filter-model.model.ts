export interface FilterModel {
    filterType: string; // e.g., 'text', 'set'
    type?: string;      // e.g., 'contains', 'equals', 'startsWith' for text filter
    filter?: string;    // The filter value for text filters
    values?: string[];  // The values for set filters
  }
  