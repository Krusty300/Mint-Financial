import React, { useEffect } from 'react';
import { RotateCcw, RotateCw, History } from 'lucide-react';
import { useUndoRedo } from '../services/undoRedo';

export const UndoRedoToolbar: React.FC = () => {
  const { canUndo, canRedo, undo, redo, getHistory } = useUndoRedo();

  // Listen for keyboard shortcut events
  useEffect(() => {
    const handleUndoEvent = () => handleUndo();
    const handleRedoEvent = () => handleRedo();

    window.addEventListener('undo', handleUndoEvent);
    window.addEventListener('redo', handleRedoEvent);

    return () => {
      window.removeEventListener('undo', handleUndoEvent);
      window.removeEventListener('redo', handleRedoEvent);
    };
  }, []);

  const handleUndo = () => {
    const action = undo();
    if (action) {
      // Here you would implement the actual undo logic
      console.log('Undo action:', action);
      // This would be handled by the respective stores/components
    }
  };

  const handleRedo = () => {
    const action = redo();
    if (action) {
      // Here you would implement the actual redo logic
      console.log('Redo action:', action);
      // This would be handled by the respective stores/components
    }
  };

  const history = getHistory();

  return (
    <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center space-x-1">
        <button
          onClick={handleUndo}
          disabled={!canUndo()}
          className={`p-2 rounded transition-colors ${
            canUndo()
              ? 'text-gray-700 hover:bg-gray-200 cursor-pointer'
              : 'text-gray-400 cursor-not-allowed'
          }`}
          title={`Undo (${canUndo() ? history[history.length - 1]?.description || 'Last action' : 'No actions to undo'})`}
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        
        <button
          onClick={handleRedo}
          disabled={!canRedo()}
          className={`p-2 rounded transition-colors ${
            canRedo()
              ? 'text-gray-700 hover:bg-gray-200 cursor-pointer'
              : 'text-gray-400 cursor-not-allowed'
          }`}
          title={`Redo (${canRedo() ? history[history.length]?.description || 'Next action' : 'No actions to redo'})`}
        >
          <RotateCw className="w-4 h-4" />
        </button>
      </div>
      
      <div className="w-px h-4 bg-gray-300" />
      
      <div className="flex items-center space-x-1 text-xs text-gray-600">
        <History className="w-3 h-3" />
        <span>{history.length} actions</span>
      </div>
    </div>
  );
};
