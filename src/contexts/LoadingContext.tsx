import React, { createContext, useContext, useState, useCallback } from 'react';

interface LoadingState {
  [key: string]: boolean;
}

interface LoadingContextType {
  loading: LoadingState;
  setLoading: (key: string, isLoading: boolean) => void;
  isLoading: (key: string) => boolean;
  isAnyLoading: () => boolean;
  clearAllLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoadingState] = useState<LoadingState>({});

  const setLoading = useCallback((key: string, isLoading: boolean) => {
    setLoadingState(prev => {
      if (isLoading) {
        return { ...prev, [key]: true };
      } else {
        const newLoading = { ...prev };
        delete newLoading[key];
        return newLoading;
      }
    });
  }, []);

  const isLoading = useCallback((key: string) => {
    return loading[key] || false;
  }, [loading]);

  const isAnyLoading = useCallback(() => {
    return Object.keys(loading).length > 0;
  }, [loading]);

  const clearAllLoading = useCallback(() => {
    setLoadingState({});
  }, []);

  const value = {
    loading,
    setLoading,
    isLoading,
    isAnyLoading,
    clearAllLoading,
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};

// Hook for async operations with automatic loading state management
export const useAsyncOperation = () => {
  const { setLoading } = useLoading();

  const executeAsync = useCallback(async <T,>(
    operation: () => Promise<T>,
    loadingKey: string
  ): Promise<T> => {
    try {
      setLoading(loadingKey, true);
      const result = await operation();
      return result;
    } finally {
      setLoading(loadingKey, false);
    }
  }, [setLoading]);

  return { executeAsync };
};
