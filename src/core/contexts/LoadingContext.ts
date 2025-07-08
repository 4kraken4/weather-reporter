import { createContext } from 'react';

export type LoadingTask = {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'loading' | 'completed' | 'error';
  progress: number;
  startTime?: number;
  endTime?: number;
  error?: string;
};

export type LoadingContextType = {
  isAppLoading: boolean;
  setAppLoading: (loading: boolean) => void;
  loadingProgress: number;
  setLoadingProgress: (progress: number) => void;
  loadingTasks: LoadingTask[];
  addLoadingTask: (task: Omit<LoadingTask, 'status' | 'progress'>) => void;
  updateLoadingTask: (
    id: string,
    updates: Partial<Pick<LoadingTask, 'status' | 'progress' | 'error'>>
  ) => void;
  removeLoadingTask: (id: string) => void;
  currentLoadingMessage: string;
  setCurrentLoadingMessage: (message: string) => void;
  initializeApp: () => Promise<void>;
};

export const LoadingContext = createContext<LoadingContextType | undefined>(
  undefined
);
