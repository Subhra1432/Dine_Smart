import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../lib/ThemeProvider';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="relative p-2 rounded-lg hover:bg-surface-container-high dark:hover:bg-inverse-surface transition-colors text-on-surface-variant dark:text-outline"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
