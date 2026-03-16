import { useState, useEffect } from 'react';

const STORAGE_KEY = 'plant-suggest-dark-theme';

export function useDarkMode(): { isDark: boolean; toggle: () => void } {
  // Initialise from the class already applied by the inline script in index.html
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark'),
  );

  // Listen for OS preference changes — only applies when user has no stored override
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    function handleChange(e: MediaQueryListEvent) {
      if (localStorage.getItem(STORAGE_KEY) !== null) return; // user has an explicit override
      applyDark(e.matches);
    }
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  function applyDark(dark: boolean) {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    setIsDark(dark);
  }

  function toggle() {
    const next = !isDark;
    localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
    applyDark(next);
  }

  return { isDark, toggle };
}
