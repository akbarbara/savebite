'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from './theme-provider';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <button className="p-2 rounded-full text-text-secondary opacity-0" aria-label="Toggle Theme">
        <Moon size={20} />
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-surface/10 transition-colors text-text-secondary hover:text-primary"
      aria-label="Toggle Theme"
    >
      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
