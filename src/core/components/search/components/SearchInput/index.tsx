import { HourglassSpinner } from '@core/components/spinner';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { memo } from 'react';

import type { SearchInputProps } from './types';

export const SearchInput = memo(
  ({
    value,
    onChange,
    onClear,
    onFocus,
    inputRef,
    isLoading,
    hover,
    isFocused,
  }: SearchInputProps) => {
    const renderLoadingIndicator = () => {
      if (isLoading.searching || isLoading.paginating || isLoading.retrying) {
        return <HourglassSpinner size={1} />;
      }
      if (isLoading.backgroundRefreshing) {
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
    };

    return (
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
          {renderLoadingIndicator()}
        </span>
        <InputText
          ref={inputRef}
          id='searchQuery'
          placeholder='Search locations'
          onFocus={onFocus}
          className={`focus:shadow-none surface-card border-100 transition-colors transition-duration-200 ${
            hover || isFocused ? 'border-primary' : ''
          } ${value ? 'border-x-none' : 'border-left-none'} w-full`}
          value={value}
          onChange={onChange}
          aria-label='Search locations'
          aria-describedby='search-help'
          aria-autocomplete='list'
        />
        {value && (
          <Button
            className={`p-inputgroup-addon border-left-none surface-card border-100 transition-colors transition-duration-200 focus:shadow-none ${
              hover || isFocused ? 'border-primary' : ''
            }`}
            onClick={onClear}
            icon='pi pi-times text-700'
            aria-label='Clear search'
            type='button'
          />
        )}
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';

export default SearchInput;
