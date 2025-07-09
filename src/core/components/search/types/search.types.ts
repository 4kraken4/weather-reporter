import { type ReactNode } from 'react';

// Basic shared types
export type SearchResultItem = {
  id: number;
  name: string;
  countryCode: string;
  state?: string;
};

export type SearchSuggestion = {
  query: string;
  type: 'historical' | 'suggested';
};

export type CountryData = {
  name: string;
  flagUrl: string;
};

export type SearchError = {
  message: string;
  retryable: boolean;
};

export type SearchPagination = {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
};

export type SearchLoadingState = {
  searching: boolean;
  paginating: boolean;
  retrying: boolean;
  backgroundRefreshing: boolean;
};

// Component Props Types
export type SearchModalProps = {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  onClose: () => void;
};

export type SearchHeaderProps = {
  query: string;
  isLoading: SearchLoadingState;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  onClose: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
  formRef: React.RefObject<HTMLFormElement>;
  hover: boolean;
  isFocused: boolean;
  onFocus: () => void;
};

export type SearchInputProps = {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  onFocus: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
  isLoading: SearchLoadingState;
  hover: boolean;
  isFocused: boolean;
};

export type SearchResultsProps = {
  results: SearchResultItem[];
  isLoading: SearchLoadingState;
  error: SearchError | null;
  pagination: SearchPagination;
  onPageChange: (event: { first: number; rows: number }) => void;
  onRetry: () => void;
  selectedIndex: number;
  searchTerm: string;
  countries: Record<string, CountryData>;
  onResultClick: (id: number) => void;
};

export type SearchSuggestionsProps = {
  suggestions: SearchSuggestion[];
  onSelect: (suggestion: string) => void;
};

export type RecentSearchesProps = {
  searches: string[];
  onSelect: (search: string) => void;
  onClear: () => void;
  maxSearches: number;
};

export type SearchFooterProps = {
  analyticsEnabled?: boolean;
  totalSearches?: number;
  averageResponseTime?: number;
};

export type KeyIcon = {
  label: string;
  icon: ReactNode;
};

export type ModalKeyCommand = {
  commandLabel: string;
  keyCombo: KeyIcon[];
};

export type SearchKeyboardCommandsProps = {
  commands: ModalKeyCommand[];
};

// Constants
export const MAX_HISTORICAL_SEARCHES = 3;
export const HISTORICAL_SEARCHES_KEY = 'weather-app-historical-searches';

// Event handlers type definitions
export type SearchSubmitHandler = (event: React.FormEvent<HTMLFormElement>) => void;
export type SearchChangeHandler = (
  event: React.ChangeEvent<HTMLInputElement>
) => void;
export type SearchSelectHandler = (value: string) => void;
export type SearchResultClickHandler = (id: number) => void;
export type SearchPageChangeHandler = (event: {
  first: number;
  rows: number;
}) => void;

// Hook return types
export type UseSearchHistoryReturn = {
  historicalSearches: string[];
  addToHistory: (search: string) => void;
  clearHistory: () => void;
};

export type UseSearchKeyboardReturn = {
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  handleKeyDown: (event: KeyboardEvent) => void;
  activeCommands: ModalKeyCommand[];
};
