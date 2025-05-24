import { CosmosItem } from './cosmos-item.model';

export interface GridResponse {
  data: CosmosItem[];
  totalRowCount: number;
  lastContinuationToken?: string; // For advanced pagination if needed
}
