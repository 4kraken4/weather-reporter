import { useClickOutside, useDebounce, useEventListener } from 'primereact/hooks';
import { ProgressSpinner } from 'primereact/progressspinner';
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';

import { useRegionSearch } from '@/features/weather/hooks/useRegionSearch';

import {
  SearchResults,
  SearchSuggestions,
  SearchHistory,
  SearchModalHeader,
  SearchModalFooter,
  loadHistoricalSearches,
  saveHistoricalSearches,
  clearHistoricalSearches,
  addToHistoricalSearches,
} from './components';
import { type KeyboardCommand } from './types/common';
import './styles/SearchModal.scss';

const Dialog = lazy(() =>
  import('primereact/dialog').then(module => ({
    default: module.Dialog,
  }))
);

type SearchModalProps = {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  onClose: () => void;
};

export const SearchModal = ({ isOpen, setOpen, onClose }: SearchModalProps) => {
  // State and hooks
  const navigate = useNavigate();
  const [searchQuery, debouncedQuery, setSearchQuery] = useDebounce('', 800);
  const [hover, setHover] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [lastDebouncedQuery, setLastDebouncedQuery] = useState('');
  const [historicalSearches, setHistoricalSearches] = useState<string[]>([]);

  const {
    data,
    loading,
    error,
    pagination,
    search,
    goToPage,
    getSuggestions,
    getAnalytics,
    retryLastSearch,
  } = useRegionSearch(5);

  const currentSuggestions = useMemo(
    () => (searchQuery.length >= 2 ? getSuggestions(searchQuery, 5) : []),
    [searchQuery, getSuggestions]
  );

  const elementRef = useRef<HTMLFormElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Event handlers
  const handleMouseEnter = useCallback(() => setHover(true), []);
  const handleMouseLeave = useCallback(() => setHover(false), []);
  const handleClickOutside = useCallback(() => setIsFocused(false), []);

  const handleResultNavigate = useCallback(
    (cityId: number) => {
      void navigate(`/weather/${cityId}`);
    },
    [navigate]
  );

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(event.target.value);
    },
    [setSearchQuery]
  );

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (debouncedQuery) {
        void search(debouncedQuery);
      }
    },
    [debouncedQuery, search]
  );

  const handleInputFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setSelectedIndex(-1);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [setSearchQuery]);

  const handleSuggestionSelect = useCallback(
    (suggestion: string) => {
      setSearchQuery(suggestion);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    },
    [setSearchQuery]
  );

  const handlePageChange = useCallback(
    (event: { first: number; rows: number }) => {
      const newPage = Math.floor(event.first / event.rows) + 1;
      void goToPage(newPage);
    },
    [goToPage]
  );

  const handleClearHistoricalSearches = useCallback(() => {
    setHistoricalSearches([]);
    clearHistoricalSearches();
  }, []);

  // Keyboard commands
  const keyboardCommands: KeyboardCommand[] = useMemo(
    () => [
      {
        commandLabel: 'Navigate Up',
        keyCombo: [{ label: '↑', icon: <span>↑</span> }],
      },
      {
        commandLabel: 'Navigate Down',
        keyCombo: [{ label: '↓', icon: <span>↓</span> }],
      },
      {
        commandLabel: 'Select',
        keyCombo: [{ label: 'Enter', icon: <span>⏎</span> }],
      },
      {
        commandLabel: 'Close',
        keyCombo: [{ label: 'Esc', icon: <span>⎋</span> }],
      },
    ],
    []
  );

  // Event listeners setup
  const [bindMouseEnterListener, unbindMouseEnterListener] = useEventListener({
    target: elementRef,
    type: 'mouseenter',
    listener: handleMouseEnter,
  });

  const [bindMouseLeaveListener, unbindMouseLeaveListener] = useEventListener({
    target: elementRef,
    type: 'mouseleave',
    listener: handleMouseLeave,
  });

  useClickOutside(elementRef, handleClickOutside);

  // Effects
  useEffect(() => {
    bindMouseEnterListener();
    bindMouseLeaveListener();
    return () => {
      unbindMouseEnterListener();
      unbindMouseLeaveListener();
    };
  }, [bindMouseEnterListener, bindMouseLeaveListener, unbindMouseEnterListener, unbindMouseLeaveListener]);

  useEffect(() => {
    try {
      const storedSearches = loadHistoricalSearches();
      if (Array.isArray(storedSearches)) {
        setHistoricalSearches(storedSearches);
      }
    } catch (error) {
      console.warn('Error loading historical searches:', error);
      setHistoricalSearches([]);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    } else {
      setSelectedIndex(-1);
      setSearchQuery('');
      setLastDebouncedQuery('');
      setIsFocused(false);
      setHover(false);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isOpen, setSearchQuery]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      // Don't handle keyboard events if user is typing in an input field (except our search input)
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' && target.id !== 'searchQuery') return;

      const suggestionsLength = data.suggestions.length;

      switch (event.key) {
        case 'ArrowDown':
          if (suggestionsLength > 0) {
            event.preventDefault();
            event.stopPropagation();
            setSelectedIndex(prev => {
              const nextIndex = prev < suggestionsLength - 1 ? prev + 1 : 0;
              return nextIndex;
            });
          }
          break;
        case 'ArrowUp':
          if (suggestionsLength > 0) {
            event.preventDefault();
            event.stopPropagation();
            setSelectedIndex(prev => {
              const nextIndex = prev > 0 ? prev - 1 : suggestionsLength - 1;
              return nextIndex;
            });
          }
          break;
        case 'Enter':
          if (selectedIndex >= 0 && selectedIndex < suggestionsLength) {
            event.preventDefault();
            event.stopPropagation();
            const selectedResult = data.suggestions[selectedIndex];
            if (selectedResult) {
              handleResultNavigate(selectedResult.id);
            }
          } else if (debouncedQuery && target.id === 'searchQuery') {
            event.preventDefault();
            event.stopPropagation();
            void search(debouncedQuery);
          }
          break;
        case 'Escape':
          event.preventDefault();
          event.stopPropagation();
          setOpen(false);
          break;
        case 'Home':
          if (suggestionsLength > 0) {
            event.preventDefault();
            event.stopPropagation();
            setSelectedIndex(0);
          }
          break;
        case 'End':
          if (suggestionsLength > 0) {
            event.preventDefault();
            event.stopPropagation();
            setSelectedIndex(suggestionsLength - 1);
          }
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown, true);
      return () => document.removeEventListener('keydown', handleKeyDown, true);
    }
  }, [
    isOpen,
    data.suggestions,
    selectedIndex,
    setOpen,
    debouncedQuery,
    search,
    handleResultNavigate,
  ]);

  // Handle selected index changes and scrolling
  useEffect(() => {
    if (selectedIndex >= 0 && selectedIndex < data.suggestions.length) {
      const animationFrame = requestAnimationFrame(() => {
        try {
          const selectedElement = document.querySelector(
            `.search-modal [data-result-index="${selectedIndex}"]`
          );
          if (selectedElement) {
            selectedElement.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest',
            });
          }
        } catch (error) {
          console.warn('Failed to scroll element into view:', error);
        }
      });

      return () => cancelAnimationFrame(animationFrame);
    }
  }, [selectedIndex, data.suggestions.length]);

  if (!isOpen) return null;

  return (
    <Suspense
      fallback={
        <div className='fixed top-0 left-0 w-screen h-screen flex justify-content-center align-items-center z-5 bg-black-alpha-50'>
          <ProgressSpinner
            style={{ width: '3rem', height: '3rem' }}
            strokeWidth='5'
          />
        </div>
      }
    >
      <Dialog
        visible={isOpen}
        blockScroll
        dismissableMask
        draggable={false}
        closable={false}
        className='search-modal'
        onHide={() => setOpen(false)}
        header={
          <SearchModalHeader
            query={searchQuery}
            isLoading={loading}
            onSubmit={handleSubmit}
            onChange={handleInputChange}
            onClear={handleClearSearch}
            onClose={onClose}
            inputRef={inputRef}
            formRef={elementRef}
            hover={hover}
            isFocused={isFocused}
            onFocus={handleInputFocus}
            keyboardCommands={keyboardCommands}
          />
        }
        footer={
          <SearchModalFooter
            analyticsEnabled={true}
            analytics={getAnalytics()}
            keyboardCommands={keyboardCommands}
          />
        }
      >
        <div className='p-2' role='main'>
          <SearchResults
            results={data.suggestions}
            countries={data.countries}
            loading={loading}
            pagination={pagination}
            selectedIndex={selectedIndex}
            searchTerm={debouncedQuery}
            onResultSelect={handleResultNavigate}
            onPageChange={handlePageChange}
          />
          <SearchSuggestions
            query={searchQuery}
            suggestions={currentSuggestions}
            loading={loading}
            onSelectSuggestion={handleSuggestionSelect}
          />
          {!loading.searching &&
            !loading.retrying &&
            !debouncedQuery &&
            (!searchQuery || searchQuery.length < 2) && (
              <SearchHistory
                searches={historicalSearches}
                onSearchSelect={handleSuggestionSelect}
                onClearHistory={handleClearHistoricalSearches}
              />
            )}
        </div>
      </Dialog>
    </Suspense>
  );
};

export default SearchModal;
