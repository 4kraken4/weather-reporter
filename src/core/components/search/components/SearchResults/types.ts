import { 
  SearchResult, 
  CountryData, 
  PaginationInfo, 
  LoadingState 
} from '../../types/common';

export interface SearchResultsProps {
  results: SearchResult[];
  countries: Record<string, CountryData>;
  loading: LoadingState;
  pagination: PaginationInfo;
  selectedIndex: number;
  searchTerm: string;
  onResultSelect: (resultId: number) => void;
  onPageChange: (event: { first: number; rows: number }) => void;
}
