import { memo } from 'react';

import type { NotFoundProps } from './types';

export const NotFoundSection = memo(({ query }: NotFoundProps) => {
  return (
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
          No results for "<span className='text-lg font-bold'>{query}</span>"
        </div>
      </div>
    </div>
  );
});

NotFoundSection.displayName = 'NotFoundSection';
export default NotFoundSection;
