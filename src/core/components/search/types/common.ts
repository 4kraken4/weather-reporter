export interface LoadingState {
  searching: boolean;
  paginating: boolean;
  retrying: boolean;
  backgroundRefreshing: boolean;
}

export interface SearchResult {
  id: number;
  name: string;
  countryCode: string;
  state?: string;
}

export interface CountryData {
  name: string;
  flagUrl: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
}

export interface SearchSuggestion {
  query: string;
  frequency?: number;
}

export interface SearchAnalytics {
  totalSearches: number;
  averageResponseTime: number;
}

export interface KeyIcon {
  label: string;
  icon: React.ReactNode;
}

export interface KeyboardCommand {
  commandLabel: string;
  keyCombo: KeyIcon[];
}

// Error related types
export interface SearchError {
  message: string;
  retryable: boolean;
  timestamp?: number;
}
