import type {
  CountryData,
  KeyboardCommand,
  KeyIcon,
  LoadingState,
  PaginationInfo,
  SearchAnalytics,
  SearchError,
  SearchResult,
  SearchSuggestion,
} from './common';

// Basic shared types
export type SearchResultItem = {
  id: number;
  name: string;
  countryCode: string;
  state?: string;
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

export type SearchInputProps = {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  onFocus: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  isLoading: SearchLoadingState;
  hover: boolean;
  isFocused: boolean;
};

export type SearchResultsProps = {
  results: SearchResult[];
  countries: Record<string, CountryData>;
  loading: LoadingState;
  pagination: PaginationInfo;
  selectedIndex: number;
  searchTerm: string;
  onResultSelect: (resultId: number) => void;
  onPageChange: (event: { first: number; rows: number }) => void;
};

export type SearchSuggestionsProps = {
  query: string;
  suggestions: SearchSuggestion[];
  loading: LoadingState;
  onSelectSuggestion: (suggestion: string) => void;
};

export type SearchResultProps = {
  headIcon?: React.ReactNode;
  headIconAlt?: string;
  title?: string;
  description?: string;
  location?: string;
  tailIcon?: React.ReactNode;
  searchTerm?: string;
  isSelected?: boolean;
  showAdditionalInfo?: boolean;
  countryCode?: string;
  state?: string;
  onClick?: () => void;
};

export type SearchModalHeaderProps = {
  query: string;
  isLoading: {
    searching: boolean;
    paginating: boolean;
    retrying: boolean;
    backgroundRefreshing: boolean;
  };
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  onClose: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  formRef: React.RefObject<HTMLFormElement | null>;
  hover: boolean;
  isFocused: boolean;
  onFocus: () => void;
  keyboardCommands?: KeyboardCommand[];
};

export type SearchModalFooterProps = {
  analyticsEnabled?: boolean;
  analytics?: SearchAnalytics;
  keyboardCommands?: KeyboardCommand[];
};

export type SearchHistoryProps = {
  searches: string[];
  onSearchSelect: (search: string) => void;
  onClearHistory: () => void;
};

export type ModalKeyCommand = {
  commandLabel: string;
  keyCombo: KeyIcon[];
};

export type SearchKeyboardCommandsProps = {
  commands: ModalKeyCommand[];
};

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

export type SearchRetryProps = {
  error: SearchError | null;
  handleRetrySearch: () => void;
  loading: {
    retrying: boolean;
  };
};

export type NotFoundProps = {
  query: string;
};

// Constants
export const MAX_HISTORICAL_SEARCHES = 3;
export const HISTORICAL_SEARCHES_KEY = 'weather-app-historical-searches';
