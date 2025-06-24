import { MessageContext } from '@core/contexts/MessageContext';
import { useContext } from 'react';

export const useMessage = () => {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error('useMessage must be used within a MessageProvider');
  }
  return context;
};
