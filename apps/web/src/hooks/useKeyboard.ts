import { useEffect } from 'react';
import { useWorkItemStore } from '../stores/workItemStore';

/**
 * Global keyboard shortcuts
 */
export const useKeyboardShortcuts = (onNewItem: () => void) => {
  const { isDrawerOpen, closeDrawer, setCurrentParent } = useWorkItemStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      const isInputFocused =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      // ESC - Close drawer or go to root
      if (e.key === 'Escape') {
        if (isDrawerOpen) {
          closeDrawer();
        } else {
          setCurrentParent(null);
        }
        return;
      }

      // Shortcuts that don't work when input is focused
      if (isInputFocused) return;

      // N - New work item
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        onNewItem();
        return;
      }

      // H - Go home (root level)
      if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        setCurrentParent(null);
        return;
      }

      // ? - Show help (future feature)
      if (e.key === '?') {
        e.preventDefault();
        alert(
          'Keyboard Shortcuts:\n\n' +
          'N - New work item\n' +
          'ESC - Close drawer / Go to root\n' +
          'H - Go home (root level)\n' +
          '? - Show this help'
        );
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen, closeDrawer, setCurrentParent, onNewItem]);
};
