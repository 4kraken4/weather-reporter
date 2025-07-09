import { Button } from 'primereact/button';
import { memo } from 'react';

import SearchInput from '../SearchInput';
import { type SearchModalHeaderProps } from './types';

const KeyboardHints = memo(({ commands }: { commands?: KeyboardCommand[] }) => {
  if (!commands?.length) return null;

  return (
    <div className='hidden md:flex justify-content-center align-items-center'>
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
});

KeyboardHints.displayName = 'KeyboardHints';

export const SearchModalHeader = memo(({
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
  keyboardCommands,
}: SearchModalHeaderProps) => {
  return (
    <div className='flex flex-column gap-2'>
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
      <KeyboardHints commands={keyboardCommands} />
    </div>
  );
});

SearchModalHeader.displayName = 'SearchModalHeader';

export default SearchModalHeader;
