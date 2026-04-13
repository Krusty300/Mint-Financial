import { useCallback, useEffect } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  description: string;
  action: () => void;
  enabled?: boolean;
}

class KeyboardShortcutsService {
  private shortcuts: Map<string, KeyboardShortcut> = new Map();
  private isEnabled = true;

  registerShortcut(id: string, shortcut: KeyboardShortcut) {
    this.shortcuts.set(id, { ...shortcut, enabled: true });
  }

  unregisterShortcut(id: string) {
    this.shortcuts.delete(id);
  }

  enableShortcut(id: string) {
    const shortcut = this.shortcuts.get(id);
    if (shortcut) {
      shortcut.enabled = true;
    }
  }

  disableShortcut(id: string) {
    const shortcut = this.shortcuts.get(id);
    if (shortcut) {
      shortcut.enabled = false;
    }
  }

  enableAll() {
    this.isEnabled = true;
  }

  disableAll() {
    this.isEnabled = false;
  }

  getShortcutKey(event: KeyboardEvent): string {
    const parts = [];
    if (event.ctrlKey) parts.push('ctrl');
    if (event.shiftKey) parts.push('shift');
    if (event.altKey) parts.push('alt');
    if (event.metaKey) parts.push('meta');
    parts.push(event.key.toLowerCase());
    return parts.join('+');
  }

  handleKeyDown = (event: KeyboardEvent) => {
    if (!this.isEnabled) return;

    // Don't trigger shortcuts when user is typing in input fields
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
      // Allow some shortcuts even in inputs (like Ctrl+S)
      if (!event.ctrlKey && !event.metaKey) return;
    }

    const key = this.getShortcutKey(event);
    
    for (const [, shortcut] of this.shortcuts) {
      if (!shortcut.enabled) continue;

      const shortcutKey = this.getShortcutKey({
        key: shortcut.key,
        ctrlKey: shortcut.ctrlKey || false,
        shiftKey: shortcut.shiftKey || false,
        altKey: shortcut.altKey || false,
        metaKey: shortcut.metaKey || false,
      } as KeyboardEvent);

      if (key === shortcutKey) {
        event.preventDefault();
        event.stopPropagation();
        shortcut.action();
        break;
      }
    }
  };

  getAllShortcuts(): Array<{ id: string; shortcut: KeyboardShortcut }> {
    return Array.from(this.shortcuts.entries()).map(([id, shortcut]) => ({ id, shortcut }));
  }
}

export const keyboardShortcutsService = new KeyboardShortcutsService();

// Hook for using keyboard shortcuts in components
export const useKeyboardShortcuts = () => {
  useEffect(() => {
    document.addEventListener('keydown', keyboardShortcutsService.handleKeyDown);
    return () => {
      document.removeEventListener('keydown', keyboardShortcutsService.handleKeyDown);
    };
  }, []);

  const registerShortcut = useCallback((id: string, shortcut: KeyboardShortcut) => {
    keyboardShortcutsService.registerShortcut(id, shortcut);
  }, []);

  const unregisterShortcut = useCallback((id: string) => {
    keyboardShortcutsService.unregisterShortcut(id);
  }, []);

  const enableShortcut = useCallback((id: string) => {
    keyboardShortcutsService.enableShortcut(id);
  }, []);

  const disableShortcut = useCallback((id: string) => {
    keyboardShortcutsService.disableShortcut(id);
  }, []);

  const getAllShortcuts = useCallback(() => {
    return keyboardShortcutsService.getAllShortcuts();
  }, []);

  return {
    registerShortcut,
    unregisterShortcut,
    enableShortcut,
    disableShortcut,
    getAllShortcuts,
  };
};

// Common shortcut definitions
export const COMMON_SHORTCUTS = {
  NEW_INVOICE: {
    key: 'n',
    ctrlKey: true,
    description: 'Create new invoice',
  },
  SAVE: {
    key: 's',
    ctrlKey: true,
    description: 'Save current invoice',
  },
  DELETE: {
    key: 'Delete',
    description: 'Delete selected item',
  },
  COPY: {
    key: 'c',
    ctrlKey: true,
    description: 'Copy selected item',
  },
  PASTE: {
    key: 'v',
    ctrlKey: true,
    description: 'Paste item',
  },
  UNDO: {
    key: 'z',
    ctrlKey: true,
    description: 'Undo last action',
  },
  REDO: {
    key: 'y',
    ctrlKey: true,
    description: 'Redo last action',
  },
  SEARCH: {
    key: '/',
    description: 'Focus search',
  },
  EXPORT: {
    key: 'e',
    ctrlKey: true,
    description: 'Export data',
  },
  REFRESH: {
    key: 'r',
    ctrlKey: true,
    description: 'Refresh data',
  },
};
