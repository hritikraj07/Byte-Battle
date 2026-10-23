'use client';

import { useEffect } from 'react';

interface ShortcutOptions {
  onSearch?: () => void;
  onEscape?: () => void;
  onRandom?: () => void;
}

export function useArcadeShortcuts({ onSearch, onEscape, onRandom }: ShortcutOptions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      const isInputActive = activeTag === 'input' || activeTag === 'textarea';

      // Esc closes modals even if inside input
      if (e.key === 'Escape') {
        if (onEscape) {
          e.preventDefault();
          onEscape();
        }
        return;
      }

      // Do not trigger / or R when typing in input
      if (isInputActive) return;

      // / triggers search
      if (e.key === '/') {
        e.preventDefault();
        if (onSearch) {
          onSearch();
        } else {
          const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement | null;
          if (searchInput) {
            searchInput.focus();
            searchInput.select();
          }
        }
        return;
      }

      // R triggers random game
      if (e.key === 'r' || e.key === 'R') {
        if (!e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault();
          onRandom?.();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSearch, onEscape, onRandom]);
}
