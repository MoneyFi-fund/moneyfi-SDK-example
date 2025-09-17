import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { getThemeColors, getCardColors, getButtonColors, getMenuColors } from '@/theme/material-design-3';

export type ThemeMode = 'light' | 'dark';

export interface ThemeContextType {
  mode: ThemeMode;
  toggleMode: () => void;
  setMode: (mode: ThemeMode) => void;
  colors: ReturnType<typeof getThemeColors>;
  cardColors: ReturnType<typeof getCardColors>;
  buttonColors: {
    primary: ReturnType<typeof getButtonColors>;
    secondary: ReturnType<typeof getButtonColors>;
    error: ReturnType<typeof getButtonColors>;
  };
  menuColors: ReturnType<typeof getMenuColors>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'moneyfi-theme-mode';

interface ThemeProviderProps {
  children: ReactNode;
  defaultMode?: ThemeMode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultMode = 'light'
}) => {
  const [mode, setModeState] = useState<ThemeMode>(defaultMode);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const initializeTheme = () => {
      // Check localStorage first
      const savedMode = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
      
      if (savedMode && (savedMode === 'light' || savedMode === 'dark')) {
        setModeState(savedMode);
        return;
      }

      // Check system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setModeState('dark');
      } else {
        setModeState('light');
      }
    };

    initializeTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const savedMode = localStorage.getItem(THEME_STORAGE_KEY);
      // Only update if user hasn't set a preference
      if (!savedMode) {
        setModeState(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Update document class and localStorage when mode changes
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    root.classList.add(mode);
    
    // Update CSS variables
    const colors = getThemeColors(mode);
    root.style.setProperty('--theme-background', colors.background);
    root.style.setProperty('--theme-on-background', colors.onBackground);
    root.style.setProperty('--theme-surface', colors.surfaceBg);
    root.style.setProperty('--theme-on-surface', colors.onSurface);
    root.style.setProperty('--theme-surface-variant', colors.surfaceVariant);
    root.style.setProperty('--theme-on-surface-variant', colors.onSurfaceVariant);
    root.style.setProperty('--theme-outline', colors.outline);
    root.style.setProperty('--theme-outline-variant', colors.outlineVariant);
    root.style.setProperty('--theme-primary', colors.primary[500]);
    root.style.setProperty('--theme-secondary', colors.secondary[500]);
    root.style.setProperty('--theme-tertiary', colors.tertiary[500]);
    root.style.setProperty('--theme-error', colors.error[500]);
    root.style.setProperty('--theme-success', colors.success[500]);
    root.style.setProperty('--theme-warning', colors.warning[500]);
    
    // Save to localStorage
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  }, [mode]);

  const toggleMode = () => {
    setModeState(prevMode => prevMode === 'light' ? 'dark' : 'light');
  };

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
  };

  // Generate theme-aware color objects
  const colors = getThemeColors(mode);
  const cardColors = getCardColors(mode);
  const menuColors = getMenuColors(mode);
  const buttonColors = {
    primary: getButtonColors(mode, 'primary'),
    secondary: getButtonColors(mode, 'secondary'),
    error: getButtonColors(mode, 'error'),
  };

  const contextValue: ThemeContextType = {
    mode,
    toggleMode,
    setMode,
    colors,
    cardColors,
    buttonColors,
    menuColors,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Theme-aware hook for dynamic styling
export const useThemeColors = () => {
  const { mode, colors, cardColors, buttonColors, menuColors } = useTheme();
  
  return {
    mode,
    colors,
    cardColors,
    buttonColors,
    menuColors,
    isDark: mode === 'dark',
    isLight: mode === 'light',
  };
};

// CSS-in-JS helper for theme-aware styles
export const useThemeStyle = () => {
  const { colors } = useTheme();
  
  const getStyle = (lightStyle: React.CSSProperties, darkStyle: React.CSSProperties) => ({
    ...lightStyle,
    ...(document.documentElement.classList.contains('dark') ? darkStyle : {}),
  });
  
  return { getStyle, colors };
};