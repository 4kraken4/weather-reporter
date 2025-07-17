import { memo } from 'react';

import {
  type KeyboardCommand,
  type KeyIcon,
  type SearchModalFooterProps,
} from './types';

const ShortcutList = memo(({ commands }: { commands?: KeyboardCommand[] }) => {
  if (!commands?.length) return null;

  return (
    <div className='col-8'>
      <div className='hidden md:flex'>
        <ul className='flex flex-row justify-content-center align-items-center list-none p-1 m-0 gap-3'>
          {commands?.map((combo: KeyboardCommand) => (
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
  );
});

ShortcutList.displayName = 'ShortcutList';

export const SearchModalFooter = memo(
  ({
    analyticsEnabled = false,
    analytics = { totalSearches: 0, averageResponseTime: 0 },
    keyboardCommands,
  }: SearchModalFooterProps) => {
    return (
      <div className='flex justify-content-center align-items-end h-4rem px-2'>
        <div className='grid nested-grid h-full align-items-end'>
          <ShortcutList commands={keyboardCommands} />
          <div className='col-4'>
            <div className='flex justify-content-end align-items-end gap-1 flex-row-reverse md:flex-row'>
              {analyticsEnabled && analytics.totalSearches > 0 && (
                <small className='text-light text-left text-xs text-400 mr-2'>
                  {analytics.totalSearches} searches
                  {analytics.averageResponseTime > 0 &&
                    ` · ${Math.round(analytics.averageResponseTime)}ms avg`}
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

SearchModalFooter.displayName = 'SearchModalFooter';

export default SearchModalFooter;
