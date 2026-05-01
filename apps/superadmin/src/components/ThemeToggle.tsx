import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../lib/ThemeProvider';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="relative p-3 rounded-2xl bg-stone-100 dark:bg-stone-800 hover:bg-saffron-500 hover:text-white transition-all text-stone-500 active:scale-90 shadow-sm"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
