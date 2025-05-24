import { SortModel } from './sort-model';
import { FilterModel } from './filter-model.model';

export interface GridRequest {
  startRow: number;
  endRow: number;
  sortModel: SortModel[];
  filterModel: { [key: string]: FilterModel };
  searchQuery?: string | null;
}
