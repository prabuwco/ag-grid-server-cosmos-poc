export interface GridResponse<T> {
  data: T[]; // Generic data type
  totalRowCount: number;
  lastContinuationToken?: string;
}
