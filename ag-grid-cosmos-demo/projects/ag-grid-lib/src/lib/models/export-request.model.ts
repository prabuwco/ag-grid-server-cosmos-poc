import { CosmosItem } from './cosmos-item.model';
export interface ExportRequest {
    records: CosmosItem[];
    columnKeys: string[];
  }