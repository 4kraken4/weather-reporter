import { motion } from 'motion/react';
import { Skeleton } from 'primereact/skeleton';
import { lazy, memo, Suspense } from 'react';
import { IoWarningOutline } from 'react-icons/io5';
import './search-retry.scss';

import type { SearchRetryProps } from './types';

const Button = lazy(() =>
  import('primereact/button').then(module => ({ default: module.Button }))
);

export const SearchRetry = memo(
  ({ error, handleRetrySearch, loading }: SearchRetryProps) => {
    if (!error || !handleRetrySearch) return null;

    return (
      <motion.div
        className='search-retry-container'
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className='error-content'>
          <motion.div
            className='error-message'
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <IoWarningOutline className='error-message-icon' />
            <span>{error.message || 'An error occurred while searching.'}</span>
          </motion.div>

          {error.retryable && (
            <Suspense
              fallback={
                <motion.div
                  className='skeleton-wrapper'
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Skeleton
                    width='6rem'
                    height='2.25rem'
                    className='border-round-md'
                  />
                </motion.div>
              }
            >
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button
                  label={loading.retrying ? 'Retrying...' : 'Try Again'}
                  loading={loading.retrying}
                  loadingIcon='pi pi-spin pi-spinner'
                  size='small'
                  severity='warning'
                  outlined
                  className='retry-button'
                  onClick={handleRetrySearch}
                  disabled={loading.retrying}
                  icon='pi pi-refresh'
                  aria-label='Retry search'
                />
              </motion.div>
            </Suspense>
          )}
        </div>
      </motion.div>
    );
  }
);

SearchRetry.displayName = 'SearchRetry';

export default SearchRetry;
