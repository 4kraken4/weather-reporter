import { Button } from 'primereact/button';
import { memo } from 'react';

import { type SearchHeaderProps } from '../types/search.types';

import SearchInput from './SearchInput';

export const SearchHeader = memo(
  ({
    query,
    isLoading,
    onSubmit,
    onChange,
    onClear,
    onClose,
    inputRef,
    formRef,
    hover,
    isFocused,
    onFocus,
  }: SearchHeaderProps) => {
    return (
      <div className='flex justify-content-center align-items-center'>
        <form onSubmit={onSubmit} className='w-full' ref={formRef}>
          <SearchInput
            value={query}
            onChange={onChange}
            onClear={onClear}
            onFocus={onFocus}
            inputRef={inputRef}
            isLoading={isLoading}
            hover={hover}
            isFocused={isFocused}
          />
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
  }
);

SearchHeader.displayName = 'SearchHeader';

export default SearchHeader;
