import { create } from 'zustand';

export interface UndoRedoAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  entityType: 'invoice' | 'client';
  data: any;
  previousData?: any;
  timestamp: Date;
  description: string;
}

interface UndoRedoState {
  history: UndoRedoAction[];
  currentIndex: number;
  maxHistorySize: number;
  
  // Actions
  addAction: (action: Omit<UndoRedoAction, 'id' | 'timestamp'>) => void;
  undo: () => UndoRedoAction | null;
  redo: () => UndoRedoAction | null;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clearHistory: () => void;
  getHistory: () => UndoRedoAction[];
}

export const useUndoRedoStore = create<UndoRedoState>((set, get) => ({
  history: [],
  currentIndex: -1,
  maxHistorySize: 50,

  addAction: (action) => {
    const { history, currentIndex, maxHistorySize } = get();
    
    const newAction: UndoRedoAction = {
      ...action,
      id: Date.now().toString(),
      timestamp: new Date(),
    };

    // Remove any actions after current index (for new actions after undo)
    const newHistory = history.slice(0, currentIndex + 1);
    
    // Add new action
    newHistory.push(newAction);
    
    // Limit history size
    if (newHistory.length > maxHistorySize) {
      newHistory.shift();
    }

    set({
      history: newHistory,
      currentIndex: newHistory.length - 1,
    });
  },

  undo: () => {
    const { history, currentIndex } = get();
    
    if (currentIndex < 0) return null;
    
    const action = history[currentIndex];
    set({ currentIndex: currentIndex - 1 });
    
    return action;
  },

  redo: () => {
    const { history, currentIndex } = get();
    
    if (currentIndex >= history.length - 1) return null;
    
    const nextIndex = currentIndex + 1;
    const action = history[nextIndex];
    set({ currentIndex: nextIndex });
    
    return action;
  },

  canUndo: () => {
    return get().currentIndex >= 0;
  },

  canRedo: () => {
    const { history, currentIndex } = get();
    return currentIndex < history.length - 1;
  },

  clearHistory: () => {
    set({
      history: [],
      currentIndex: -1,
    });
  },

  getHistory: () => {
    return get().history;
  },
}));

// Hook for undo/redo functionality with automatic action tracking
export const useUndoRedo = () => {
  const store = useUndoRedoStore();

  const trackAction = (action: Omit<UndoRedoAction, 'id' | 'timestamp'>) => {
    store.addAction(action);
  };

  const undo = () => {
    return store.undo();
  };

  const redo = () => {
    return store.redo();
  };

  return {
    ...store,
    trackAction,
    undo,
    redo,
  };
};
