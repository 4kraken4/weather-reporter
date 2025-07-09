import { Divider } from 'primereact/divider';
import { Paginator } from 'primereact/paginator';
import { Skeleton } from 'primereact/skeleton';
import { memo, Suspense } from 'react';

import { SearchResult as SearchResultItem } from '../../SearchResult';
import { type SearchResultsProps } from './types';

export const SearchResults = memo(({
  results,
  countries,
  loading,
  pagination,
  selectedIndex,
  searchTerm,
  onResultSelect,
  onPageChange,
}: SearchResultsProps) => {
  if (!searchTerm || loading.searching || loading.paginating || loading.retrying || results.length === 0) {
    return null;
  }

  return (
    <>
      <ul
        className='flex flex-column list-none p-0 m-0 gap-2'
        role='list'
        aria-label='Search results'
      >
        {results.map((result, index) => {
          const countryData = countries[result.countryCode];
          if (!countryData) {
            console.warn('Missing country data for:', result.countryCode, result);
            return null;
          }
          
          return (
            <li key={result.id} data-result-index={index}>
              <Suspense
                fallback={
                  <div className='w-full flex flex-column p-3'>
                    <Skeleton
                      width='100%'
                      height='4rem'
                      className='border-round-md'
                      style={{ marginBottom: '0.5rem' }}
                    />
                  </div>
                }
              >
                <SearchResultItem
                  headIcon={countryData.flagUrl}
                  headIconAlt={countryData.name}
                  title={result.name}
                  description={countryData.name}
                  onClick={() => onResultSelect(result.id)}
                  searchTerm={searchTerm}
                  isSelected={index === selectedIndex}
                  showAdditionalInfo={true}
                  countryCode={result.countryCode}
                  state={result.state}
                />
              </Suspense>
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
            onPageChange={onPageChange}
            template={{ layout: 'PrevPageLink CurrentPageReport NextPageLink' }}
            currentPageReportTemplate='page {currentPage} of {totalPages}'
            className='justify-content-center border-none'
          />
        </div>
      )}
    </>
  );
});

SearchResults.displayName = 'SearchResults';

export default SearchResults;
