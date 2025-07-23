export type LoadingState = {
  searching: boolean;
  paginating: boolean;
  retrying: boolean;
  backgroundRefreshing: boolean;
};

export type SearchResult = {
  id: number;
  name: string;
  countryCode: string;
  state?: string;
};

export type CountryData = {
  name: string;
  flagUrl: string;
};

export type PaginationInfo = {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
};

export type SearchSuggestion = {
  query: string;
  frequency: number;
  lastUsed: number;
  source: 'history' | 'popular' | 'suggested';
};

export type SearchAnalytics = {
  totalSearches: number;
  averageResponseTime: number;
};

export type ErrorType =
  | 'VALIDATION'
  | 'NETWORK'
  | 'SERVER'
  | 'TIMEOUT'
  | 'RATE_LIMIT'
  | 'ABORT';

export type SearchError = {
  type: ErrorType;
  message: string;
  retryable: boolean;
  code?: string;
  timestamp: number;
  query?: string;
};

export type KeyIcon = {
  label: string;
  icon: React.ReactNode;
};

export type KeyboardCommand = {
  commandLabel: string;
  keyCombo: KeyIcon[];
};
