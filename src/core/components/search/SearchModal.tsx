import { OrbitSpinner, RadarSpinner } from '@core/components/spinner';
import { useClickOutside, useDebounce, useEventListener } from 'primereact/hooks';
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

import { SearchModalFooter, SearchModalHeader } from './components';
import { type KeyboardCommand } from './types/common';
import type { SearchModalProps } from './types/search.types';
import {
  addToHistoricalSearches,
  clearHistoricalSearches,
  loadHistoricalSearches,
  saveHistoricalSearches,
} from './utils/searchHistoryHelpers';

import { useRegionSearch } from '@/features/weather/hooks/useRegionSearch';

import './styles/SearchModal.scss';

const Dialog = lazy(() =>
  import('primereact/dialog').then(module => ({
    default: module.Dialog,
  }))
);

const SearchResults = lazy(() =>
  import('./components').then(module => ({
    default: module.SearchResults,
  }))
);

const SearchRetry = lazy(() =>
  import('./components').then(module => ({
    default: module.SearchRetry,
  }))
);

const SearchHistory = lazy(() =>
  import('./components').then(module => ({
    default: module.SearchHistory,
  }))
);

const NotFoundSection = lazy(() =>
  import('./components').then(module => ({
    default: module.NotFoundSection,
  }))
);

export const SearchModal = ({ isOpen, setOpen, onClose }: SearchModalProps) => {
  // State and hooks
  const navigate = useNavigate();
  const [searchQuery, debouncedQuery, setSearchQuery] = useDebounce('', 800);
  const [hover, setHover] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  // We use this to track previous search queries
  const [lastDebouncedQuery, setLastDebouncedQuery] = useState('');
  const [historicalSearches, setHistoricalSearches] = useState<string[]>([]);

  const {
    data,
    loading,
    error,
    pagination,
    search,
    goToPage,
    getAnalytics,
    // Keep retryLastSearch for error recovery
    retryLastSearch,
  } = useRegionSearch(5, { autoRetry: false });

  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Store search function in a ref to avoid dependency issues
  const searchRef = useRef(search);
  const isOpenRef = useRef(isOpen);

  // Event handlers
  const handleMouseEnter = useCallback(() => setHover(true), []);
  const handleMouseLeave = useCallback(() => setHover(false), []);
  const handleClickOutside = useCallback(() => setIsFocused(false), []);

  const handleResultNavigate = useCallback(
    (cityId: number) => {
      void navigate(`/weather/${cityId}`);
      setOpen(false);
    },
    [navigate, setOpen]
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

  const handleRetrySearch = useCallback(() => {
    if (isOpenRef.current) {
      void retryLastSearch();
    }
  }, [retryLastSearch]);

  const handleClearHistoricalSearches = useCallback(() => {
    setHistoricalSearches([]);
    (clearHistoricalSearches as () => void)();
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

  // Type for event listener hooks
  type EventListenerHook = [() => void, () => void];

  // Event listeners setup
  const mouseEnterListener = useEventListener({
    target: formRef,
    type: 'mouseenter',
    listener: handleMouseEnter,
  });
  const mouseLeaveListener = useEventListener({
    target: formRef,
    type: 'mouseleave',
    listener: handleMouseLeave,
  });
  const [bindMouseEnterListener, unbindMouseEnterListener] = (mouseEnterListener ?? [
    () => {},
    () => {},
  ]) as EventListenerHook;
  const [bindMouseLeaveListener, unbindMouseLeaveListener] = (mouseLeaveListener ?? [
    () => {},
    () => {},
  ]) as EventListenerHook;

  useClickOutside(formRef as React.RefObject<Element>, handleClickOutside);

  // Effects
  useEffect(() => {
    bindMouseEnterListener();
    bindMouseLeaveListener();
    return () => {
      unbindMouseEnterListener();
      unbindMouseLeaveListener();
    };
  }, [
    bindMouseEnterListener,
    bindMouseLeaveListener,
    unbindMouseEnterListener,
    unbindMouseLeaveListener,
  ]);

  useEffect(() => {
    searchRef.current = search;
    isOpenRef.current = isOpen;
  }, [search, isOpen]);

  // Debounced search with race condition prevention
  useEffect(() => {
    if (debouncedQuery && isOpenRef.current) {
      // Only search if modal is still open (prevent race conditions)
      void searchRef.current(debouncedQuery);
    }

    // Reset selected index only when the actual query content changes
    if (debouncedQuery !== lastDebouncedQuery) {
      setSelectedIndex(-1);
      setLastDebouncedQuery(debouncedQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  useEffect(() => {
    try {
      const storedSearches = (loadHistoricalSearches as () => string[])();
      if (Array.isArray(storedSearches)) {
        setHistoricalSearches(storedSearches);
      }
    } catch (error) {
      console.warn('Error loading historical searches:', error);
      setHistoricalSearches([]);
    }
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
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

  // Save successful searches to history
  useEffect(() => {
    if (
      debouncedQuery &&
      data.suggestions.length > 0 &&
      !loading.searching &&
      !error
    ) {
      // Use a ref to track if component is still mounted
      let isMounted = true;

      setHistoricalSearches(currentSearches => {
        if (!isMounted) return currentSearches;

        const newHistoricalSearches = (
          addToHistoricalSearches as (
            query: string,
            currentSearches: string[]
          ) => string[]
        )(debouncedQuery, currentSearches);

        // Only save if there are actual changes
        if (
          newHistoricalSearches.length !== currentSearches.length ||
          !newHistoricalSearches.every(
            (search, index) => search === currentSearches[index]
          )
        ) {
          // Save to localStorage asynchronously to avoid blocking
          setTimeout(() => {
            if (isMounted) {
              (saveHistoricalSearches as (searches: string[]) => void)(
                newHistoricalSearches
              );
            }
          }, 0);
          return newHistoricalSearches;
        }
        return currentSearches;
      });

      return () => {
        isMounted = false;
      };
    }
  }, [debouncedQuery, data.suggestions.length, loading.searching, error]);

  // Update selectedIndex when suggestions change
  useEffect(() => {
    setSelectedIndex(prev => {
      if (prev >= data.suggestions.length) {
        return data.suggestions.length > 0 ? 0 : -1;
      }
      return prev;
    });
  }, [data.suggestions.length]);

  if (!isOpen) return null;

  return (
    <Suspense
      fallback={
        <div className='fixed top-0 left-0 w-screen h-screen flex justify-content-center align-items-center z-5 bg-black-alpha-50'>
          <OrbitSpinner size={1.5} />
        </div>
      }
    >
      <Dialog
        visible={isOpen}
        blockScroll
        keepInViewport
        dismissableMask
        modal
        position='center'
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
            formRef={formRef}
            hover={hover}
            isFocused={isFocused}
            onFocus={handleInputFocus}
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
          {!loading.retrying &&
            !loading.searching &&
            !error &&
            data.suggestions.length > 0 && (
              <Suspense
                fallback={
                  <div className='flex w-full h-21rem justify-content-center align-items-center'>
                    <OrbitSpinner />
                  </div>
                }
              >
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
              </Suspense>
            )}
          {!loading.retrying &&
            !loading.searching &&
            !error &&
            debouncedQuery &&
            debouncedQuery.length >= 2 &&
            data.suggestions.length === 0 && (
              <Suspense
                fallback={
                  <div className='flex w-full h-21rem justify-content-center align-items-center'>
                    <OrbitSpinner />
                  </div>
                }
              >
                <NotFoundSection query={debouncedQuery} />
                <SearchHistory
                  searches={historicalSearches}
                  onSearchSelect={handleSuggestionSelect}
                  onClearHistory={handleClearHistoricalSearches}
                />
              </Suspense>
            )}
          {loading.searching && (
            <div className='h-full w-full justify-contents-center align-items-center flex flex-column'>
              <RadarSpinner size={180} />
            </div>
          )}
          {!loading.retrying && !loading.searching && error && debouncedQuery && (
            <Suspense
              fallback={
                <div className='flex w-full h-9rem justify-content-center align-items-center'>
                  <OrbitSpinner />
                </div>
              }
            >
              <SearchRetry
                error={error}
                handleRetrySearch={handleRetrySearch}
                loading={loading}
              />
            </Suspense>
          )}
          {!loading.searching &&
            !loading.retrying &&
            (!debouncedQuery || debouncedQuery.length < 2) && (
              <Suspense
                fallback={
                  <div className='flex w-full h-21rem justify-content-center align-items-center'>
                    <OrbitSpinner />
                  </div>
                }
              >
                <SearchHistory
                  searches={historicalSearches}
                  onSearchSelect={handleSuggestionSelect}
                  onClearHistory={handleClearHistoricalSearches}
                />
              </Suspense>
            )}
        </div>
      </Dialog>
    </Suspense>
  );
};

export default SearchModal;
