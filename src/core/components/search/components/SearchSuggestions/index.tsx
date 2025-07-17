import { Button } from 'primereact/button';
import { memo } from 'react';

import type { SearchSuggestionsProps } from './types';

export const SearchSuggestions = memo(
  ({ query, suggestions, loading, onSelectSuggestion }: SearchSuggestionsProps) => {
    if (loading.searching || loading.retrying || !query) {
      return null;
    }

    if (suggestions.length === 0) {
      return (
        <div className='text-center text-xs font-light'>
          No results found for "<span>{query}</span>"
        </div>
      );
    }

    return (
      <div className='p-2'>
        <div className='text-xs font-light mb-2 text-400'>Search suggestions:</div>
        <ul className='flex flex-column list-none p-0 m-0 gap-1'>
          {suggestions.map(suggestion => (
            <li key={suggestion.query}>
              <Button
                label={suggestion.query}
                className='p-0 text-left text-xs font-light h-2rem w-full justify-content-start hover:surface-overlay hover:text-primary focus:outline-none focus:shadow-none focus:surface-overlay'
                text
                onClick={() => onSelectSuggestion(suggestion.query)}
                icon='pi pi-history text-400'
              />
            </li>
          ))}
        </ul>
      </div>
    );
  }
);

SearchSuggestions.displayName = 'SearchSuggestions';

export default SearchSuggestions;
