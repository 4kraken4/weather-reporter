import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Divider } from 'primereact/divider';
import { useClickOutside, useDebounce, useEventListener } from 'primereact/hooks';
import { InputText } from 'primereact/inputtext';
import { Paginator } from 'primereact/paginator';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import HourglassSpinner from '../spinner/HourglassSpinner';

import { SearchResult } from './SearchResult';
import './styles/SearchModal.scss';

import '@/core/utils/searchHighlight.scss';
import { useRegionSearch } from '@/features/weather/hooks/useRegionSearch';

type SearchModalProps = {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  onClose: () => void;
};

// Constants for historical searches
const HISTORICAL_SEARCHES_KEY = 'weather-app-historical-searches';
const MAX_HISTORICAL_SEARCHES = 3;

// Helper functions for managing historical searches
const loadHistoricalSearches = (): string[] => {
  try {
    // Check if localStorage is available
    if (typeof Storage === 'undefined' || !window.localStorage) {
      return [];
    }

    const stored = localStorage.getItem(HISTORICAL_SEARCHES_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored) as unknown;
    // Validate that it's an array of strings
    if (Array.isArray(parsed) && parsed.every(item => typeof item === 'string')) {
      return parsed.slice(0, MAX_HISTORICAL_SEARCHES); // Ensure max limit
    }
    return [];
  } catch (error) {
    console.warn('Failed to load historical searches:', error);
    // Clear corrupted data
    try {
      localStorage.removeItem(HISTORICAL_SEARCHES_KEY);
    } catch (clearError) {
      console.warn('Failed to clear corrupted historical searches:', clearError);
    }
    return [];
  }
};

const saveHistoricalSearches = (searches: string[]): void => {
  try {
    // Check if localStorage is available
    if (typeof Storage === 'undefined' || !window.localStorage) {
      return;
    }

    // Validate input
    if (!Array.isArray(searches) || searches.some(item => typeof item !== 'string')) {
      console.warn('Invalid searches array provided to saveHistoricalSearches');
      return;
    }

    // Limit size and sanitize
    const sanitizedSearches = searches
      .slice(0, MAX_HISTORICAL_SEARCHES)
      .map(search => search.trim())
      .filter(search => search.length >= 2 && search.length <= 100);

    localStorage.setItem(HISTORICAL_SEARCHES_KEY, JSON.stringify(sanitizedSearches));
  } catch (error) {
    // Handle quota exceeded or other localStorage errors
    if (error instanceof DOMException && error.code === 22) {
      console.warn('localStorage quota exceeded, clearing historical searches');
      try {
        localStorage.removeItem(HISTORICAL_SEARCHES_KEY);
      } catch (clearError) {
        console.warn('Failed to clear localStorage:', clearError);
      }
    } else {
      console.warn('Failed to save historical searches:', error);
    }
  }
};

const addToHistoricalSearches = (
  query: string,
  currentSearches: string[]
): string[] => {
  // Input validation
  if (typeof query !== 'string' || !Array.isArray(currentSearches)) {
    console.warn('Invalid input to addToHistoricalSearches');
    return Array.isArray(currentSearches) ? currentSearches : [];
  }

  const trimmedQuery = query.trim();
  if (!trimmedQuery || trimmedQuery.length < 2 || trimmedQuery.length > 100) {
    return currentSearches;
  }

  // Sanitize query (basic XSS prevention)
  const sanitizedQuery = trimmedQuery.replace(/[<>'"&]/g, '');
  if (!sanitizedQuery || sanitizedQuery.length < 2) {
    return currentSearches;
  }

  // Remove if already exists to move to front (case-insensitive)
  const filtered = currentSearches.filter(
    search =>
      typeof search === 'string' &&
      search.toLowerCase() !== sanitizedQuery.toLowerCase()
  );

  // Add to front and limit to MAX_HISTORICAL_SEARCHES
  return [sanitizedQuery, ...filtered].slice(0, MAX_HISTORICAL_SEARCHES);
};

const clearHistoricalSearches = (): void => {
  try {
    // Check if localStorage is available
    if (typeof Storage === 'undefined' || !window.localStorage) {
      return;
    }
    localStorage.removeItem(HISTORICAL_SEARCHES_KEY);
  } catch (error) {
    console.warn('Failed to clear historical searches:', error);
  }
};

// Define types for modalKeyCommands
// Use type instead of interface for lint compliance
type KeyIcon = {
  label: string;
  icon: React.ReactNode;
};

type ModalKeyCommand = {
  commandLabel: string;
  keyCombo: KeyIcon[];
};

const SearchModal = ({ isOpen, setOpen, onClose }: SearchModalProps) => {
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

  // Enhanced state tracking
  const isBackgroundRefreshing = loading.backgroundRefreshing;
  const currentSuggestions = useMemo(
    () => (searchQuery.length >= 2 ? getSuggestions(searchQuery, 5) : []),
    [searchQuery, getSuggestions]
  );

  const elementRef = useRef<HTMLFormElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Memoized event handlers to prevent unnecessary re-renders
  const handleMouseEnter = useCallback(() => setHover(true), []);
  const handleMouseLeave = useCallback(() => setHover(false), []);
  const handleClickOutside = useCallback(() => setIsFocused(false), []);

  // Optimized navigation handler for search results
  const handleResultNavigate = useCallback(
    (cityId: number) => {
      void navigate(`/weather/${cityId}`);
    },
    [navigate]
  );

  const [bindMouseEnterListener, unbindMouseEnterListener] = useEventListener({
    target: elementRef,
    type: 'mouseenter',
    listener: handleMouseEnter,
  }) as [() => void, () => void];

  const [bindMouseLeaveListener, unbindMouseLeaveListener] = useEventListener({
    target: elementRef,
    type: 'mouseleave',
    listener: handleMouseLeave,
  }) as [() => void, () => void];

  useClickOutside(elementRef as React.RefObject<Element>, handleClickOutside);

  // Load historical searches on mount
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

  // Focus management when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      // Focus the input when modal opens
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    } else {
      // Reset states when modal closes
      setSelectedIndex(-1);
      setSearchQuery('');
      setLastDebouncedQuery('');
      setIsFocused(false);
      setHover(false);
    }

    // Cleanup timeout on unmount or when isOpen changes
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isOpen, setSearchQuery]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

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

  // Initialize footer styling
  useEffect(() => {
    if (!isOpen) return;

    const timeoutId = setTimeout(() => {
      const footerEle = document.querySelector('.p-dialog-footer');
      if (footerEle && !footerEle.classList.contains('px-0')) {
        footerEle.classList.add('px-0');
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [isOpen]);

  // Store search function in a ref to avoid dependency issues
  const searchRef = useRef(search);
  const isOpenRef = useRef(isOpen);

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
  }, [debouncedQuery, lastDebouncedQuery]);

  // Save successful searches to historical searches
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

        const newHistoricalSearches = addToHistoricalSearches(
          debouncedQuery,
          currentSearches
        );
        if (
          newHistoricalSearches.length !== currentSearches.length ||
          !newHistoricalSearches.every(
            (search, index) => search === currentSearches[index]
          )
        ) {
          // Save to localStorage asynchronously to avoid blocking
          setTimeout(() => {
            if (isMounted) {
              saveHistoricalSearches(newHistoricalSearches);
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

  // Search suggestions for real-time autocomplete
  useEffect(() => {
    // This effect is for potential future enhancements
    // Currently suggestions are shown based on currentSuggestions length
  }, [searchQuery, debouncedQuery]);

  // Reset selected index when suggestions change (prevent out-of-bounds)
  useEffect(() => {
    setSelectedIndex(prev => {
      if (prev >= data.suggestions.length) {
        return data.suggestions.length > 0 ? 0 : -1;
      }
      return prev;
    });
  }, [data.suggestions.length]);

  // Scroll selected item into view with better error handling
  useEffect(() => {
    if (selectedIndex >= 0 && selectedIndex < data.suggestions.length) {
      // Use requestAnimationFrame for better performance
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

  // Enhanced keyboard navigation handler with accessibility
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpenRef.current) return;

      // Don't handle keyboard events if user is typing in an input field (except our search input)
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' && target.id !== 'searchQuery') return;

      const suggestionsLength = data.suggestions.length;

      switch (event.key) {
        case 'ArrowDown':
          // Only handle arrow navigation if there are suggestions
          if (suggestionsLength > 0) {
            event.preventDefault();
            event.stopPropagation();
            setSelectedIndex(prev => {
              const nextIndex = prev < suggestionsLength - 1 ? prev + 1 : 0; // Wrap to beginning
              return nextIndex;
            });
          }
          break;
        case 'ArrowUp':
          // Only handle arrow navigation if there are suggestions
          if (suggestionsLength > 0) {
            event.preventDefault();
            event.stopPropagation();
            setSelectedIndex(prev => {
              const nextIndex = prev > 0 ? prev - 1 : suggestionsLength - 1; // Wrap to end
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
            // Prevent both keyboard handler and form submission from triggering
            event.preventDefault();
            event.stopPropagation();
            void searchRef.current(debouncedQuery);
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

    if (isOpenRef.current) {
      // Use capture phase to ensure we get the event before other handlers
      document.addEventListener('keydown', handleKeyDown, true);
      return () => document.removeEventListener('keydown', handleKeyDown, true);
    }
  }, [
    data.suggestions,
    selectedIndex,
    setOpen,
    debouncedQuery,
    navigate,
    handleResultNavigate,
  ]);

  const searchModalMaskStyles = {};

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(event.target.value);
    },
    [setSearchQuery]
  );

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (debouncedQuery && isOpenRef.current) {
        void searchRef.current(debouncedQuery);
      }
    },
    [debouncedQuery]
  );

  const handleInputFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setSelectedIndex(-1);
    // Focus back to input after clearing
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [setSearchQuery]);

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      setSearchQuery(suggestion);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    },
    [setSearchQuery]
  );

  const handleRetrySearch = useCallback(() => {
    if (isOpenRef.current) {
      void retryLastSearch();
    }
  }, [retryLastSearch]);

  const handlePageChange = useCallback(
    (event: { first: number; rows: number }) => {
      const newPage = Math.floor(event.first / event.rows) + 1;
      if (isOpenRef.current) {
        void goToPage(newPage);
      }
    },
    [goToPage]
  );

  const handleClearHistoricalSearches = useCallback(() => {
    setHistoricalSearches([]);
    clearHistoricalSearches();
  }, []);

  const handleHistoricalSearchClick = useCallback(
    (searchTerm: string) => {
      try {
        if (typeof searchTerm === 'string' && searchTerm.trim()) {
          setSearchQuery(searchTerm);
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }
      } catch (error) {
        console.warn('Error handling historical search click:', error);
      }
    },
    [setSearchQuery]
  );

  // Memoized search result list
  const renderedSearchResults = useMemo(() => {
    if (
      !debouncedQuery ||
      loading.searching ||
      loading.paginating ||
      loading.retrying ||
      data.suggestions.length === 0
    ) {
      return null;
    }
    return (
      <>
        <ul
          className='flex flex-column list-none p-0 m-0 gap-2'
          role='list'
          aria-label='Search results'
        >
          {data.suggestions.map((result, index) => {
            const countryData = data.countries[result.countryCode];
            if (!countryData) {
              console.warn('Missing country data for:', result.countryCode, result);
              return null;
            }
            // Memoize the click handler for each result
            const onClick = () => handleResultNavigate(result.id);
            return (
              <li key={result.id} data-result-index={index}>
                <SearchResult
                  headIcon={countryData.flagUrl}
                  headIconAlt={countryData.name}
                  title={result.name}
                  description={countryData.name}
                  onClick={onClick}
                  searchTerm={debouncedQuery}
                  isSelected={index === selectedIndex}
                  showAdditionalInfo={true}
                  countryCode={result.countryCode}
                  state={result.state}
                />
              </li>
            );
          })}
        </ul>
        {pagination.totalPages > 1 && (
          <div className='mt-3'>
            <Divider className='mb-2' type='solid' />
            <Paginator
              first={(pagination.currentPage - 1) * pagination.pageSize}
              rows={pagination.pageSize}
              totalRecords={pagination.totalItems}
              onPageChange={handlePageChange}
              template={{ layout: 'PrevPageLink CurrentPageReport NextPageLink' }}
              currentPageReportTemplate='page {currentPage} of {totalPages}'
              className='justify-content-center border-none'
            />
          </div>
        )}
      </>
    );
  }, [
    debouncedQuery,
    loading.searching,
    loading.paginating,
    loading.retrying,
    data.suggestions,
    data.countries,
    selectedIndex,
    handleResultNavigate,
    pagination,
    handlePageChange,
  ]);

  // Memoized suggestions list
  const renderedSuggestions = useMemo(() => {
    if (
      !(
        !loading.searching &&
        !loading.retrying &&
        !debouncedQuery &&
        searchQuery.length >= 2 &&
        currentSuggestions.length > 0
      )
    ) {
      return null;
    }
    return (
      <div className='p-2'>
        <div className='text-xs font-light mb-2 text-400'>Search suggestions:</div>
        <ul className='flex flex-column list-none p-0 m-0 gap-1'>
          {currentSuggestions.map(suggestion => (
            <li key={suggestion.query}>
              <Button
                label={suggestion.query}
                className='p-0 text-left text-xs font-light h-2rem w-full justify-content-start hover:surface-overlay hover:text-primary focus:outline-none focus:shadow-none focus:surface-overlay'
                text
                onClick={() => handleSuggestionClick(suggestion.query)}
                icon='pi pi-history text-400'
              />
            </li>
          ))}
        </ul>
      </div>
    );
  }, [
    loading.searching,
    loading.retrying,
    debouncedQuery,
    searchQuery,
    currentSuggestions,
    handleSuggestionClick,
  ]);

  const header = (
    <div className='flex justify-content-center align-items-center'>
      <form onSubmit={handleSubmit} className='w-full' ref={elementRef}>
        <div
          className={`p-inputgroup flex-1 h-3rem transition-all transition-duration-200 transition-ease-in-out ${
            hover || isFocused ? 'ring-shadow' : ''
          }`}
        >
          <span
            className={`p-inputgroup-addon border-right-none surface-card border-100 transition-colors transition-duration-200 transition-ease-in-out ${
              hover || isFocused ? 'border-primary' : ''
            }`}
          >
            {(() => {
              if (loading.searching || loading.paginating || loading.retrying) {
                return (
                  <HourglassSpinner
                    style={{
                      width: '100%',
                      height: '100%',
                      margin: 'auto',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  />
                );
              }
              if (isBackgroundRefreshing) {
                return (
                  <div className='relative'>
                    <i className='pi pi-search' />
                    <div
                      className='absolute -top-1 -right-1 w-2 h-2 bg-primary border-circle'
                      title='Refreshing data in background'
                      style={{
                        animation: 'pulse 2s infinite',
                        backgroundColor: 'var(--primary-color)',
                      }}
                    />
                  </div>
                );
              }
              return <i className='pi pi-search' />;
            })()}
          </span>
          <InputText
            ref={inputRef}
            id='searchQuery'
            placeholder='Search locations'
            onFocus={handleInputFocus}
            className={`focus:shadow-none surface-card border-100 transition-colors transition-duration-200 ${
              hover || isFocused ? 'border-primary' : ''
            } ${searchQuery ? 'border-x-none' : 'border-left-none'} w-full`}
            value={searchQuery}
            onChange={handleInputChange}
            aria-label='Search locations'
            aria-describedby='search-help'
            aria-autocomplete='list'
            aria-expanded={data.suggestions.length > 0}
            aria-activedescendant={
              selectedIndex >= 0 ? `search-result-${selectedIndex}` : undefined
            }
            role='combobox'
          />
          {searchQuery && (
            <Button
              className={`p-inputgroup-addon border-left-none surface-card border-100 transition-colors transition-duration-200 focus:shadow-none ${
                hover || isFocused ? 'border-primary' : ''
              }`}
              onClick={handleClearSearch}
              icon='pi pi-times text-700'
              aria-label='Clear search'
              type='button'
            />
          )}
        </div>
      </form>
      <Button
        label='Close'
        className='md:hidden focus:shadow-none hover:surface-overlay hover:text-primary focus:outline-none focus:surface-overlay'
        onClick={onClose}
        severity='secondary'
        text
      />
    </div>
  );

  // Example modalKeyCommands definition (should be replaced with actual logic if needed)
  const modalKeyCommands: ModalKeyCommand[] = useMemo(
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

  const footer = (
    <div className='flex justify-content-center align-items-end h-4rem px-2'>
      <div className='grid nested-grid h-full align-items-end'>
        <div className='col-8'>
          <div className='hidden md:flex'>
            <ul className='flex flex-row justify-content-center align-items-center list-none p-1 m-0 gap-3'>
              {modalKeyCommands?.map((combo: ModalKeyCommand) => (
                <li
                  key={combo.commandLabel}
                  className='flex flex-row align-items-center gap-2'
                >
                  <kbd className='flex gap-1'>
                    {combo.keyCombo.map((key: KeyIcon) => (
                      <span key={key.label} className='p-1 border-round-sm surface-0'>
                        {key.icon}
                      </span>
                    ))}
                  </kbd>
                  <small
                    className='text-400'
                    style={{
                      fontSize: '0.75em',
                    }}
                  >
                    {combo.commandLabel}
                  </small>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className='col-4'>
          <div className='flex justify-content-end align-items-end gap-1 flex-row-reverse md:flex-row'>
            {import.meta.env.DEV &&
              (() => {
                const analytics = getAnalytics();
                return analytics.totalSearches > 0 ? (
                  <small className='text-light text-left text-xs text-400 mr-2'>
                    {analytics.totalSearches} searches
                    {analytics.averageResponseTime > 0 &&
                      ` · ${Math.round(analytics.averageResponseTime)}ms avg`}
                  </small>
                ) : null;
              })()}
            <small className='text-light text-left text-xs text-400'>
              Powered by
            </small>
            <a
              href='https://www.primefaces.org/primereact'
              target='_blank'
              rel='noreferrer noopener'
              className='flex justify-content-end align-items-center w-3'
            >
              <img
                src='https://primefaces.org/cdn/primereact/images/favicon.ico'
                alt='PrimeReact'
                className='md:w-full h-full object-contain'
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <Dialog
      header={header}
      footer={footer}
      visible={isOpen}
      blockScroll
      dismissableMask
      draggable={false}
      closable={false}
      maskStyle={searchModalMaskStyles}
      className='search-modal'
      onHide={() => {
        if (!isOpen) return;
        setOpen(false);
      }}
      aria-labelledby='search-modal-title'
      aria-describedby='search-help'
    >
      <div className='p-2' role='main'>
        <div id='search-help' className='sr-only' aria-live='polite'>
          {loading.searching && `Searching for "${debouncedQuery}"`}
          {data.suggestions.length > 0 &&
            `Found ${data.suggestions.length} results. Use arrow keys to navigate, Enter to select.`}
        </div>
        {loading.searching && (
          <div className='text-center text-xs font-light'>
            Searching for "<span>{debouncedQuery}</span>"
          </div>
        )}
        {loading.paginating && (
          <div className='text-center text-xs font-light'>
            Loading more results...
          </div>
        )}
        {loading.retrying && (
          <div className='text-center text-xs font-light'>Retrying search...</div>
        )}
        {isBackgroundRefreshing && !loading.searching && !loading.paginating && (
          <div className='text-center text-xs font-light text-400'>
            <i className='pi pi-sync mr-1' style={{ fontSize: '0.7rem' }} />
            Refreshing results...
          </div>
        )}
        {error && (
          <div className='text-center text-sm text-red-500 p-3'>
            <div className='flex flex-column align-items-center gap-2'>
              <div>
                <i className='pi pi-exclamation-triangle mr-2' />
                {error.message || 'An error occurred while searching.'}
              </div>
              {error.retryable && (
                <Button
                  label={loading.retrying ? 'Retrying...' : 'Try Again'}
                  size='small'
                  className='p-button-sm'
                  onClick={handleRetrySearch}
                  disabled={loading.retrying}
                  icon={loading.retrying ? 'pi pi-spin pi-spinner' : 'pi pi-refresh'}
                  aria-label='Retry search'
                />
              )}
            </div>
          </div>
        )}
        {/* Rendered search results (memoized) */}
        {renderedSearchResults}
        {/* Rendered suggestions (memoized) */}
        {renderedSuggestions}
        {!loading.searching &&
          !loading.paginating &&
          !loading.retrying &&
          debouncedQuery &&
          data.suggestions.length === 0 &&
          !error && (
            <div className='flex flex-column justify-content-center align-items-center gap-3'>
              <div className='flex flex-column justify-content-center align-items-center'>
                <span>
                  <svg
                    width='40'
                    height='40'
                    viewBox='0 0 20 20'
                    fill='none'
                    fillRule='evenodd'
                    stroke='currentColor'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  >
                    <path d='M15.5 4.8c2 3 1.7 7-1 9.7h0l4.3 4.3-4.3-4.3a7.8 7.8 0 01-9.8 1m-2.2-2.2A7.8 7.8 0 0113.2 2.4M2 18L18 2' />
                  </svg>
                </span>
                <div className='text-sm mt-2'>
                  No results for "
                  <span className='text-lg font-bold'>{debouncedQuery}</span>"
                </div>
              </div>
              <div className='flex flex-column gap-2 text-xs mt-1'>
                Try searching for:
                <ul className='m-0 p-0 inline-block' id='searchList'>
                  <li>
                    <Button
                      label='Documentation'
                      className='p-0 text-left text-xs font-light h-2rem hover:surface-overlay hover:underline hover:text-primary focus:outline-none focus:shadow-none focus:surface-overlay'
                      text
                      onClick={() => handleSuggestionClick('Documentation')}
                    />
                  </li>
                </ul>
              </div>
            </div>
          )}
        {!loading.searching &&
          !loading.retrying &&
          !debouncedQuery &&
          searchQuery.length >= 2 &&
          currentSuggestions.length > 0 && (
            <div className='p-2'>
              <div className='text-xs font-light mb-2 text-400'>
                Search suggestions:
              </div>
              <ul className='flex flex-column list-none p-0 m-0 gap-1'>
                {currentSuggestions.map(suggestion => (
                  <li key={suggestion.query}>
                    <Button
                      label={suggestion.query}
                      className='p-0 text-left text-xs font-light h-2rem w-full justify-content-start hover:surface-overlay hover:text-primary focus:outline-none focus:shadow-none focus:surface-overlay'
                      text
                      onClick={() => handleSuggestionClick(suggestion.query)}
                      icon='pi pi-history text-400'
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}
        {!loading.searching &&
          !loading.retrying &&
          !debouncedQuery &&
          (!searchQuery || searchQuery.length < 2) && (
            <div className='recent-searches-container p-4'>
              {historicalSearches.length > 0 ? (
                <div className='recent-searches-content'>
                  {/* Header Section */}
                  <div className='recent-searches-header'>
                    <div className='recent-searches-title'>
                      <div className='recent-searches-icon'>
                        <i className='pi pi-history' />
                      </div>
                      <h3 className='recent-searches-heading'>Recent Searches</h3>
                      <div className='recent-searches-count'>
                        {historicalSearches.length}
                      </div>
                    </div>
                    <Button
                      icon='pi pi-trash'
                      className='recent-searches-clear-btn'
                      onClick={handleClearHistoricalSearches}
                      aria-label='Clear recent searches'
                      tooltip='Clear all recent searches'
                      tooltipOptions={{
                        position: 'left',
                        style: {
                          fontSize: '0.7rem',
                          wordBreak: 'break-word',
                          maxWidth: '130px',
                          whiteSpace: 'normal',
                          textAlign: 'center',
                        },
                      }}
                      text
                      rounded
                      severity='danger'
                      size='small'
                    />
                  </div>

                  {/* Search Items */}
                  <div className='recent-searches-list'>
                    {historicalSearches.map(search => (
                      <div
                        key={search}
                        className='recent-search-item'
                        onClick={() => handleHistoricalSearchClick(search)}
                        role='button'
                        tabIndex={0}
                        aria-label={`Search for ${search}`}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleHistoricalSearchClick(search);
                          }
                        }}
                      >
                        <div className='recent-search-item-content'>
                          <div className='recent-search-item-icon'>
                            <i className='pi pi-search' />
                          </div>

                          <div className='recent-search-item-text'>
                            <div className='recent-search-query'>{search}</div>
                            <div className='recent-search-hint'>
                              Tap to search again
                            </div>
                          </div>

                          <div className='recent-search-item-arrow'>
                            <i className='pi pi-angle-right' />
                          </div>
                        </div>

                        <div className='recent-search-item-divider' />
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className='recent-searches-footer'>
                    <div className='recent-searches-footer-text'>
                      <i className='pi pi-info-circle' />
                      <span>Last {historicalSearches.length} searches are saved</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className='recent-searches-empty'>
                  <div className='recent-searches-empty-icon'>
                    <i className='pi pi-history' />
                  </div>
                  <div className='recent-searches-empty-content'>
                    <h4 className='recent-searches-empty-title'>
                      No recent searches
                    </h4>
                    <p className='recent-searches-empty-description'>
                      Start typing to search for locations.
                      <br />
                      Your search history will appear here.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
      </div>
    </Dialog>
  );
};

export default SearchModal;
