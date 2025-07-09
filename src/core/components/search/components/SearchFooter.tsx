import { memo } from 'react';

import { useSearchKeyboard } from '../hooks/useSearchKeyboard';
import { type SearchFooterProps } from '../types/search.types';

import SearchKeyboardCommands from './SearchKeyboardCommands';

export const SearchFooter = memo(
  ({
    analyticsEnabled = false,
    totalSearches = 0,
    averageResponseTime = 0,
  }: SearchFooterProps) => {
    const { activeCommands } = useSearchKeyboard({
      isOpen: true,
      suggestionsLength: 0,
      onSelect: () => {},
      onEscape: () => {},
      onEnter: () => {},
    });

    return (
      <div className='flex justify-content-center align-items-end h-4rem px-2'>
        <div className='grid nested-grid h-full align-items-end'>
          <div className='col-8'>
            <SearchKeyboardCommands commands={activeCommands} />
          </div>
          <div className='col-4'>
            <div className='flex justify-content-end align-items-end gap-1 flex-row-reverse md:flex-row'>
              {analyticsEnabled && totalSearches > 0 && (
                <small className='text-light text-left text-xs text-400 mr-2'>
                  {totalSearches} searches
                  {averageResponseTime > 0 &&
                    ` · ${Math.round(averageResponseTime)}ms avg`}
                </small>
              )}
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
  }
);

SearchFooter.displayName = 'SearchFooter';

export default SearchFooter;
