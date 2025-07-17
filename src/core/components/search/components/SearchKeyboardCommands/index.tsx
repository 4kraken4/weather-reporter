import { memo } from 'react';

import { type SearchKeyboardCommandsProps } from './types';

export const SearchKeyboardCommands = memo(
  ({ commands }: SearchKeyboardCommandsProps) => {
    return (
      <div className='hidden md:flex'>
        <ul className='flex flex-row justify-content-center align-items-center list-none p-1 m-0 gap-3'>
          {commands.map(combo => (
            <li
              key={combo.commandLabel}
              className='flex flex-row align-items-center gap-2'
            >
              <kbd className='flex gap-1'>
                {combo.keyCombo.map(key => (
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
    );
  }
);

SearchKeyboardCommands.displayName = 'SearchKeyboardCommands';

export default SearchKeyboardCommands;
