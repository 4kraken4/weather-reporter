import { Button } from 'primereact/button';
import { memo } from 'react';

import { MAX_HISTORICAL_SEARCHES, type SearchHistoryProps } from './types';

export const SearchHistory = memo(
  ({ searches, onSearchSelect, onClearHistory }: SearchHistoryProps) => {
    if (searches.length === 0) {
      return (
        <div className='recent-searches-empty'>
          <div className='recent-searches-empty-icon'>
            <i className='pi pi-history' />
          </div>
          <div className='recent-searches-empty-content'>
            <h4 className='recent-searches-empty-title'>No recent searches</h4>
            <p className='recent-searches-empty-description'>
              Start typing to search for locations.
              <br />
              Your search history will appear here.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className='recent-searches-content'>
        <div className='recent-searches-header'>
          <div className='recent-searches-title'>
            <div className='recent-searches-icon'>
              <i className='pi pi-history' />
            </div>
            <h3 className='recent-searches-heading'>Recent Searches</h3>
            <div className='recent-searches-count'>{searches.length}</div>
          </div>
          <Button
            icon='pi pi-trash'
            className='focus:outline-none focus:shadow-none hover:surface-overlay hover:text-primary'
            onClick={onClearHistory}
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

        <div className='recent-searches-list'>
          {searches.map(search => (
            <div
              key={search}
              className='recent-search-item'
              onClick={() => onSearchSelect(search)}
              role='button'
              tabIndex={0}
              aria-label={`Search for ${search}`}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSearchSelect(search);
                }
              }}
            >
              <div className='recent-search-item-content'>
                <div className='recent-search-item-icon'>
                  <i className='pi pi-search' />
                </div>

                <div className='recent-search-item-text'>
                  <div className='recent-search-query'>{search}</div>
                  <div className='recent-search-hint'>Tap to search again</div>
                </div>

                <div className='recent-search-item-arrow'>
                  <i className='pi pi-angle-right' />
                </div>
              </div>

              <div className='recent-search-item-divider' />
            </div>
          ))}
        </div>

        <div className='recent-searches-footer'>
          <div className='recent-searches-footer-text'>
            <i className='pi pi-info-circle' />
            <span>Last {MAX_HISTORICAL_SEARCHES} searches are saved</span>
          </div>
        </div>
      </div>
    );
  }
);

SearchHistory.displayName = 'SearchHistory';

export default SearchHistory;
