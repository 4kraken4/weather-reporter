import type { Message } from '@core/components/notification/MessageTemplate';
import { createContext } from 'react';

export type MessageContextType = {
  showMessage: (message: Message) => void;
  hideMessage?: () => void;
};

export const MessageContext = createContext<MessageContextType | undefined>(
  undefined
);
