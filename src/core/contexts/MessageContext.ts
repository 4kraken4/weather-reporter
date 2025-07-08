import { createContext } from 'react';

import type { Message } from '../components/notification/MessageTemplate';

type MessageContextType = {
  showMessage: (message: Message) => void;
  hideMessage?: () => void;
};

export const MessageContext = createContext<MessageContextType | undefined>(
  undefined
);
