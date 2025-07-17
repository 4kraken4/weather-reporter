import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { ModalKeyCommand, UseSearchKeyboardReturn } from '../types/search.types';

type UseSearchKeyboardOptions = {
  isOpen: boolean;
  suggestionsLength: number;
  onSelect: (index: number) => void;
  onEscape: () => void;
  onEnter: () => void;
};

/**
 * Custom hook for handling keyboard navigation in search modal
 */
export const useSearchKeyboard = ({
  isOpen,
  suggestionsLength,
  onSelect,
  onEscape,
  onEnter,
}: UseSearchKeyboardOptions): UseSearchKeyboardReturn => {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const isOpenRef = useRef(isOpen);
  const suggestionsLengthRef = useRef(suggestionsLength);

  // Update refs when props change
  useEffect(() => {
    isOpenRef.current = isOpen;
    suggestionsLengthRef.current = suggestionsLength;
  }, [isOpen, suggestionsLength]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isOpenRef.current) return;

      // Don't handle keyboard events if user is typing in an input field (except our search input)
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' && target.id !== 'searchQuery') return;

      switch (event.key) {
        case 'ArrowDown':
          if (suggestionsLengthRef.current > 0) {
            event.preventDefault();
            event.stopPropagation();
            setSelectedIndex(prev => {
              const nextIndex =
                prev < suggestionsLengthRef.current - 1 ? prev + 1 : 0;
              onSelect(nextIndex);
              return nextIndex;
            });
          }
          break;

        case 'ArrowUp':
          if (suggestionsLengthRef.current > 0) {
            event.preventDefault();
            event.stopPropagation();
            setSelectedIndex(prev => {
              const nextIndex =
                prev > 0 ? prev - 1 : suggestionsLengthRef.current - 1;
              onSelect(nextIndex);
              return nextIndex;
            });
          }
          break;

        case 'Enter':
          if (selectedIndex >= 0 && selectedIndex < suggestionsLengthRef.current) {
            event.preventDefault();
            event.stopPropagation();
            onEnter();
          }
          break;

        case 'Escape':
          event.preventDefault();
          event.stopPropagation();
          onEscape();
          break;

        case 'Home':
          if (suggestionsLengthRef.current > 0) {
            event.preventDefault();
            event.stopPropagation();
            setSelectedIndex(0);
            onSelect(0);
          }
          break;

        case 'End':
          if (suggestionsLengthRef.current > 0) {
            event.preventDefault();
            event.stopPropagation();
            const lastIndex = suggestionsLengthRef.current - 1;
            setSelectedIndex(lastIndex);
            onSelect(lastIndex);
          }
          break;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onSelect, onEnter, onEscape]
  );

  // Attach/detach keyboard event listener
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown, true);
      return () => document.removeEventListener('keydown', handleKeyDown, true);
    }
  }, [isOpen, handleKeyDown]);

  // Define available keyboard commands
  const activeCommands: ModalKeyCommand[] = useMemo(
    () => [
      {
        commandLabel: 'Navigate Up',
        keyCombo: [{ label: '↑', icon: '↑' }],
      },
      {
        commandLabel: 'Navigate Down',
        keyCombo: [{ label: '↓', icon: '↓' }],
      },
      {
        commandLabel: 'Select',
        keyCombo: [{ label: 'Enter', icon: '⏎' }],
      },
      {
        commandLabel: 'Close',
        keyCombo: [{ label: 'Esc', icon: '⎋' }],
      },
      {
        commandLabel: 'First Suggestion',
        keyCombo: [{ label: 'Home', icon: 'Home' }],
      },
      {
        commandLabel: 'Last Suggestion',
        keyCombo: [{ label: 'End', icon: 'End' }],
      },
    ],
    []
  );

  return {
    selectedIndex,
    setSelectedIndex,
    handleKeyDown,
    activeCommands,
  };
};
