export interface CosmosItem {
    id: string;
    name: string;
    category: string;
    value: number;
    description: string;
    date: string; // Using string for date as it comes from JSON, will format in grid
  }
  