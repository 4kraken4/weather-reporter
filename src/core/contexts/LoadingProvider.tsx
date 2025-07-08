import { useCallback, useState } from 'react';

import { LoadingContext, type LoadingTask } from './LoadingContext';

type LoadingProviderProps = {
  children: React.ReactNode;
};

export const LoadingProvider = ({ children }: LoadingProviderProps) => {
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingTasks, setLoadingTasks] = useState<LoadingTask[]>([]);
  const [currentLoadingMessage, setCurrentLoadingMessage] =
    useState('Initializing...');

  const setAppLoading = useCallback((loading: boolean) => {
    setIsAppLoading(loading);
    if (!loading) {
      setLoadingProgress(100);
      setCurrentLoadingMessage('Application ready');
    }
  }, []);

  const addLoadingTask = useCallback(
    (task: Omit<LoadingTask, 'status' | 'progress'>) => {
      const newTask: LoadingTask = {
        ...task,
        status: 'pending',
        progress: 0,
        startTime: Date.now(),
      };
      setLoadingTasks(prev => [...prev, newTask]);
    },
    []
  );

  const updateLoadingTask = useCallback(
    (
      id: string,
      updates: Partial<Pick<LoadingTask, 'status' | 'progress' | 'error'>>
    ) => {
      setLoadingTasks(prev =>
        prev.map(task => {
          if (task.id === id) {
            const updatedTask = { ...task, ...updates };
            if (updates.status === 'completed' && !task.endTime) {
              updatedTask.endTime = Date.now();
              updatedTask.progress = 100;
            }
            return updatedTask;
          }
          return task;
        })
      );

      // Update overall progress
      setLoadingTasks(currentTasks => {
        const totalTasks = currentTasks.length;
        const completedTasks = currentTasks.filter(
          task => task.status === 'completed'
        ).length;
        const overallProgress =
          totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        setLoadingProgress(overallProgress);
        return currentTasks;
      });
    },
    []
  );

  const removeLoadingTask = useCallback((id: string) => {
    setLoadingTasks(prev => prev.filter(task => task.id !== id));
  }, []);

  // Helper function for delays
  const delay = (ms: number) =>
    new Promise<void>(resolve => {
      setTimeout(() => resolve(), ms);
    });

  const initializeApp = useCallback(async () => {
    try {
      // Add initial loading tasks
      addLoadingTask({
        id: 'theme-init',
        name: 'Theme System',
        description: 'Loading theme configuration',
      });

      addLoadingTask({
        id: 'api-init',
        name: 'API Services',
        description: 'Initializing API connections',
      });

      addLoadingTask({
        id: 'weather-init',
        name: 'Weather Data',
        description: 'Loading default weather information',
      });

      addLoadingTask({
        id: 'assets-init',
        name: 'Assets & Resources',
        description: 'Loading application assets',
      });

      // Simulate theme initialization
      setCurrentLoadingMessage('Setting up theme system...');
      updateLoadingTask('theme-init', { status: 'loading', progress: 50 });
      await delay(800);
      updateLoadingTask('theme-init', { status: 'completed' });

      // Simulate API initialization
      setCurrentLoadingMessage('Connecting to weather services...');
      updateLoadingTask('api-init', { status: 'loading', progress: 30 });
      await delay(1200);
      updateLoadingTask('api-init', { status: 'loading', progress: 80 });
      await delay(600);
      updateLoadingTask('api-init', { status: 'completed' });

      // Simulate asset loading
      setCurrentLoadingMessage('Loading application resources...');
      updateLoadingTask('assets-init', { status: 'loading', progress: 40 });
      await delay(900);
      updateLoadingTask('assets-init', { status: 'completed' });

      // Simulate weather data initialization
      setCurrentLoadingMessage('Fetching initial weather data...');
      updateLoadingTask('weather-init', { status: 'loading', progress: 25 });

      try {
        // This could be a real API call to load default weather data
        await delay(1000);
        updateLoadingTask('weather-init', { status: 'loading', progress: 75 });
        await delay(500);
        updateLoadingTask('weather-init', { status: 'completed' });
      } catch {
        updateLoadingTask('weather-init', {
          status: 'error',
          error: 'Failed to load weather data',
        });
      }

      // Final completion
      setCurrentLoadingMessage('Application ready!');
      await delay(500);
      setAppLoading(false);
    } catch (error) {
      console.error('App initialization failed:', error);
      setCurrentLoadingMessage('Failed to initialize application');
      setAppLoading(false);
    }
  }, [addLoadingTask, updateLoadingTask, setAppLoading]);

  return (
    <LoadingContext.Provider
      value={{
        isAppLoading,
        setAppLoading,
        loadingProgress,
        setLoadingProgress,
        loadingTasks,
        addLoadingTask,
        updateLoadingTask,
        removeLoadingTask,
        currentLoadingMessage,
        setCurrentLoadingMessage,
        initializeApp,
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
};
