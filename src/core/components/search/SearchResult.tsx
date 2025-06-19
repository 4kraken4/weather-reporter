import { Skeleton } from 'primereact/skeleton';

import type { SearchResultProps } from '@/core/types/common.types';

export const searchResult: React.FC<SearchResultProps> = ({
  headIcon,
  title,
  description,
  location,
  tailIcon,
}) => (
  <div>
    {location ? (
      <a href={location} className='cursor-pointer flex flex-row no-underline'>
        <div className='border-bottom-1 surface-border border-round hover:bg-primary text-900 transition-colors transition-duration-200 transition-ease-in-out p-2 w-full fadein animation-duration-300 animation-iteration-1'>
          <div className='flex justify-content-start align-items-center gap-2'>
            {headIcon ? (
              <span className='px-1 border-round-sm'>{headIcon}</span>
            ) : (
              <Skeleton shape='rectangle' size='2rem' className='mr-2' />
            )}

            <div style={{ flex: '1' }}>
              {title ? (
                <div className='text-sm font-semibold'>{title}</div>
              ) : (
                <Skeleton width='75%%' className='mb-2' />
              )}
              {description ? (
                <div className='text-xs font-light'>{description}</div>
              ) : (
                <Skeleton width='65%' />
              )}
            </div>
            {tailIcon ? (
              <span className='px-1 border-round-sm'>{tailIcon}</span>
            ) : (
              <Skeleton shape='rectangle' size='2rem' />
            )}
          </div>
        </div>
      </a>
    ) : null}
  </div>
);
