import { useContext } from 'react';

import { LoadingContext } from '../contexts/LoadingContext';

export const useAppLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useAppLoading must be used within a LoadingProvider');
  }
  return context;
};
