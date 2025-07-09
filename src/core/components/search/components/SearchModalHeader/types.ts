import { KeyboardCommand } from '../../types/common';

export interface SearchModalHeaderProps {
  query: string;
  isLoading: {
    searching: boolean;
    paginating: boolean;
    retrying: boolean;
    backgroundRefreshing: boolean;
  };
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  onClose: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
  formRef: React.RefObject<HTMLFormElement>;
  hover: boolean;
  isFocused: boolean;
  onFocus: () => void;
  keyboardCommands?: KeyboardCommand[];
}
