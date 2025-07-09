export interface SearchHistoryProps {
  searches: string[];
  onSearchSelect: (search: string) => void;
  onClearHistory: () => void;
}
