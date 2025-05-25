export interface ExportRequest<T> {
  records: T[]; // Generic data type for records to export
  columnKeys: string[];
}
