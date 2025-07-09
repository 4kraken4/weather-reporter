import { SearchSuggestion, LoadingState } from '../../types/common';

export interface SearchSuggestionsProps {
  query: string;
  suggestions: SearchSuggestion[];
  loading: LoadingState;
  onSelectSuggestion: (suggestion: string) => void;
}
