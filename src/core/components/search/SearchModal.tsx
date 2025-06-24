import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { useClickOutside, useDebounce, useEventListener } from 'primereact/hooks';
import { InputText } from 'primereact/inputtext';
import { useEffect, useRef, useState } from 'react';

import HourglassSpinner from '../spinner/HourglassSpinner';

import { searchResult } from './SearchResult';
import './styles/SearchModal.scss';

import type { SearchModalProps } from '@/core/types/common.types';

const SearchModal = ({ isOpen, setOpen, onClose }: SearchModalProps) => {
  const [searchQuery, debouncedQuery, setSearchQuery] = useDebounce('', 400);
  const [loading, setLoading] = useState(false);
  const [hover, setHover] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  const elementRef = useRef<HTMLFormElement | null>(null);
  const formSubmitRef = useRef<HTMLButtonElement | null>(null);

  const [bindMouseEnterListener, unbindMouseEnterListener] = useEventListener({
    target: elementRef,
    type: 'mouseenter',
    listener: () => {
      setHover(true);
    },
  }) as [() => void, () => void];

  const [bindMouseLeaveListener, unbindMouseLeaveListener] = useEventListener({
    target: elementRef,
    type: 'mouseleave',
    listener: () => {
      setHover(false);
    },
  }) as [() => void, () => void];

  useClickOutside(elementRef as React.RefObject<Element>, () => {
    setIsFocused(false);
  });

  useEffect(() => {
    bindMouseEnterListener();
    bindMouseLeaveListener();

    return () => {
      unbindMouseEnterListener();
      unbindMouseLeaveListener();
    };
  }, [
    bindMouseEnterListener,
    bindMouseLeaveListener,
    unbindMouseEnterListener,
    unbindMouseLeaveListener,
  ]);

  useEffect(() => {
    setTimeout(() => {
      const footerEle = document.querySelector('.p-dialog-footer');
      if (footerEle && !footerEle.classList.contains('px-0')) {
        footerEle.classList.add('px-0');
      }
    }, 100);
  }, []);

  useEffect(() => {
    if (debouncedQuery) {
      if (formSubmitRef.current) {
        formSubmitRef.current?.click();
      }
    } else {
      setSearchResults([]);
    }
  }, [debouncedQuery]);

  type SearchResult = {
    id?: string;
    title?: string;
    [key: string]: string | number | boolean | null | undefined;
  };

  const fetchSearchResults = async (query: string): Promise<void> => {
    setLoading(true);
    try {
      const response = await fetch(`https://api.example.com/search?q=${query}`);
      const data = (await response.json()) as { results: SearchResult[] };
      setSearchResults(data.results);
    } catch (error) {
      console.error('Error fetching search results:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchModalMaskStyles = {};

  const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = event => {
    setSearchQuery(event.target.value);
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event): void => {
    event.preventDefault();
    void fetchSearchResults(debouncedQuery);
  };

  const keyboardKeyIcons = {
    escape: {
      icon: (
        <svg width='15' height='15' aria-label='Escape key' role='img'>
          <g
            fill='none'
            stroke='currentColor'
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth='1.2'
          >
            <path d='M13.6167 8.936c-.1065.3583-.6883.962-1.4875.962-.7993 0-1.653-.9165-1.653-2.1258v-.5678c0-1.2548.7896-2.1016 1.653-2.1016.8634 0 1.3601.4778 1.4875 1.0724M9 6c-.1352-.4735-.7506-.9219-1.46-.8972-.7092.0246-1.344.57-1.344 1.2166s.4198.8812 1.3445.9805C8.465 7.3992 8.968 7.9337 9 8.5c.032.5663-.454 1.398-1.4595 1.398C6.6593 9.898 6 9 5.963 8.4851m-1.4748.5368c-.2635.5941-.8099.876-1.5443.876s-1.7073-.6248-1.7073-2.204v-.4603c0-1.0416.721-2.131 1.7073-2.131.9864 0 1.6425 1.031 1.5443 2.2492h-2.956' />
          </g>
        </svg>
      ),
      label: 'Escape',
      keyCode: 27,
    },
    enter: {
      icon: (
        <svg width='15' height='15' aria-label='Enter key' role='img'>
          <g
            fill='none'
            stroke='currentColor'
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth='1.2'
          >
            <path d='M12 3.53088v3c0 1-1 2-2 2H4M7 11.53088l-3-3 3-3' />
          </g>
        </svg>
      ),
      label: 'Enter',
      keyCode: 13,
    },
    arrowUp: {
      icon: (
        <svg width='15' height='15' aria-label='Arrow up' role='img'>
          <g
            fill='none'
            stroke='currentColor'
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth='1.2'
          >
            <path d='M7.5 11.5v-8M10.5 6.5l-3-3-3 3' />
          </g>
        </svg>
      ),
      label: 'Arrow Up',
      keyCode: 38,
    },
    arroDown: {
      icon: (
        <svg width='15' height='15' aria-label='Arrow down' role='img'>
          <g
            fill='none'
            stroke='currentColor'
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth='1.2'
          >
            <path d='M7.5 3.5v8M10.5 8.5l-3 3-3-3' />
          </g>
        </svg>
      ),
      label: 'Arrow Down',
      keyCode: 40,
    },
  };

  const modalKeyCommands = [
    {
      keyCombo: [keyboardKeyIcons.enter],
      commandLabel: 'to select',
      action: () => {
        onClose();
      },
    },
    {
      keyCombo: [keyboardKeyIcons.arroDown, keyboardKeyIcons.arrowUp],
      commandLabel: 'to navigate',
      action: () => {
        console.warn('ArrowDown');
      },
    },
    {
      keyCombo: [keyboardKeyIcons.escape],
      commandLabel: 'to close',
      action: () => {
        setOpen(false);
      },
    },
  ];

  const header = (
    <div className='flex justify-content-center align-items-center'>
      <form onSubmit={handleSubmit} className='w-full' ref={elementRef}>
        <div
          className={`p-inputgroup flex-1 h-3rem transition-all transition-duration-200 transition-ease-in-out ${
            hover || isFocused ? 'ring-shadow' : ''
          }`}
        >
          <span
            className={`p-inputgroup-addon border-right-none surface-card border-100 transition-colors transition-duration-200 transition-ease-in-out ${
              hover || isFocused ? 'border-primary' : ''
            }`}
          >
            {loading ? (
              <HourglassSpinner
                style={{
                  width: '100%',
                  height: '100%',
                  margin: 'auto',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              />
            ) : (
              <i className='pi pi-search' />
            )}
          </span>
          <InputText
            id='searchQuery'
            placeholder='Search docs'
            onFocus={() => setIsFocused(true)}
            className={`focus:shadow-none surface-card border-100 transition-colors transition-duration-200 ${
              hover || isFocused ? 'border-primary' : ''
            } ${searchQuery ? 'border-x-none' : 'border-left-none'} w-full`}
            value={searchQuery}
            onChange={handleInputChange}
          />
          {searchQuery && (
            <Button
              className={`p-inputgroup-addon border-left-none surface-card border-100 transition-colors transition-duration-200 focus:shadow-none ${
                hover || isFocused ? 'border-primary' : ''
              }`}
              onClick={() => setSearchQuery('')}
              icon='pi pi-times text-700'
            />
          )}
        </div>
        <Button
          type='submit'
          className='hidden'
          ref={el => {
            formSubmitRef.current = el as HTMLButtonElement | null;
          }}
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
  );

  const footer = (
    <div className='flex justify-content-center align-items-end border-top-1 h-4rem px-2'>
      <div className='grid nested-grid h-full align-items-end'>
        <div className='col-8'>
          <div className='hidden md:flex'>
            <ul className='flex flex-row justify-content-center align-items-center list-none p-1 m-0 gap-3'>
              {modalKeyCommands?.map(combo => (
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
        </div>
        <div className='col-4'>
          <div className='flex justify-content-end align-items-end gap-1 flex-row-reverse md:flex-row'>
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
                src='/logo.svg'
                alt='PrimeReact'
                className='md:w-full h-full w-2rem'
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <Dialog
      header={header}
      footer={footer}
      visible={isOpen}
      blockScroll
      dismissableMask
      draggable={false}
      closable={false}
      maskStyle={searchModalMaskStyles}
      className='search-modal'
      onHide={() => {
        if (!isOpen) return;
        setOpen(false);
      }}
    >
      <div className='p-2'>
        {loading && (
          <div className='text-center text-xs font-light'>
            Searching for "<span>{debouncedQuery}</span>"
          </div>
        )}
        {!loading && debouncedQuery && searchResults.length > 0 && (
          <ul className='flex flex-column list-none p-0 m-0 gap-2'>
            {searchResults.map(async result => (
              <li key={result.id ?? result.title}>{await searchResult(result)}</li>
            ))}
          </ul>
        )}
        {!loading && debouncedQuery && searchResults.length === 0 && (
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
                No results for "
                <span className='text-lg font-bold'>{debouncedQuery}</span>"
              </div>
            </div>
            <div className='flex flex-column gap-2 text-xs mt-1'>
              Try searching for:
              <ul className='m-0 p-0 inline-block' id='searchList'>
                <li>
                  <Button
                    label='Documentation'
                    className='p-0 text-left text-xs font-light h-2rem hover:surface-overlay hover:underline hover:text-primary focus:outline-none focus:shadow-none focus:surface-overlay'
                    text
                    onClick={() => setSearchQuery('Documentation')}
                  />
                </li>
              </ul>
            </div>
          </div>
        )}
        {!loading && !debouncedQuery && (
          <div className='text-center text-xs font-light'>No recent searches</div>
        )}
      </div>
    </Dialog>
  );
};

export default SearchModal;
