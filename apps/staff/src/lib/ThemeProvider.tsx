import { createContext, useContext, useEffect } from 'react';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: string;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: 'dark';
  setTheme: (theme: string) => void;
};

const ThemeProviderContext = createContext<ThemeProviderState>({
  theme: 'dark',
  setTheme: () => null,
});

// DineSmart always uses light/warm mode — theme toggle has been removed.
export function ThemeProvider({ 
  children, 
  defaultTheme = 'dark', 
  storageKey = 'dinesmart-staff-theme' 
}: ThemeProviderProps) {
  useEffect(() => {
    const root = window.document.documentElement;
    const theme = localStorage.getItem(storageKey) || defaultTheme;
    
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [defaultTheme, storageKey]);

  return (
    <ThemeProviderContext.Provider value={{ theme: 'dark', setTheme: () => {} }}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
