import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('theme');
      // Only return 'dark' if it's explicitly set, otherwise default to 'light'
      return storedTheme === 'dark' ? 'dark' : 'light';
    }
    return 'light';
  });
  
  const isDarkMode = useMemo(() => theme === 'dark', [theme]);
  
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme, isDarkMode]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};