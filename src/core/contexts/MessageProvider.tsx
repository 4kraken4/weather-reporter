import messageTemplate, {
  type Message,
} from '@core/components/notification/MessageTemplate';
import { Messages } from 'primereact/messages';
import { useCallback, useRef } from 'react';

import { MessageContext } from './MessageContext';

const MAX_MESSAGES = 2;

export type MessagesRef = {
  show: (options: Message) => void;
};

export const MessageProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const messagesRef = useRef<Messages>(null);
  const queueRef = useRef<Message[]>([]);
  const visibleMessagesRef = useRef(0);

  const displayMessage = useCallback((message: Message) => {
    messagesRef.current?.show({
      severity: message.severity,
      sticky: message.sticky ?? false,
      closable: message.closable ?? false,
      content: messageTemplate(message),
      life: message.sticky ? undefined : (message.life ?? 3000),
    });
  }, []);

  const showMessage = useCallback(
    (message: Message) => {
      if (visibleMessagesRef.current < MAX_MESSAGES) {
        displayMessage(message);
        visibleMessagesRef.current += 1;
      } else {
        queueRef.current.push(message);
      }
    },
    [displayMessage]
  );

  const handleMessageRemove = useCallback(() => {
    visibleMessagesRef.current -= 1;

    const availableSlots = MAX_MESSAGES - visibleMessagesRef.current;
    const currentQueue = queueRef.current;

    if (availableSlots > 0 && currentQueue.length > 0) {
      const messagesToShow = currentQueue.slice(0, availableSlots);
      queueRef.current = currentQueue.slice(availableSlots);

      setTimeout(() => {
        messagesToShow.forEach(msg => {
          displayMessage(msg);
          visibleMessagesRef.current += 1;
        });
      }, 300);
    }
  }, [displayMessage]);

  return (
    <MessageContext.Provider value={{ showMessage }}>
      {children}
      <div className='global-messages'>
        <Messages ref={messagesRef} onRemove={handleMessageRemove} />
      </div>
    </MessageContext.Provider>
  );
};
