import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, Theme as NavigationTheme } from '@react-navigation/native';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = '@vconnect.theme.mode';

const lightPalette = {
  background: '#F4F7FB',
  surface: '#FFFFFF',
  surfaceSoft: '#EEF2F7',
  text: '#0F172A',
  textMuted: '#64748B',
  primary: '#4A6D8C',
  border: '#D8E0EA',
  card: '#FFFFFF',
  tabBar: '#FFFFFF',
  tabInactive: '#8892A6',
  success: '#10B981',
  danger: '#D9485F',
  heroStart: '#16365F',
  heroMid: '#1B4B7E',
  heroEnd: '#2E7BAA',
  modalBackdrop: 'rgba(15, 23, 42, 0.45)',
  onPrimary: '#FFFFFF',
};

const darkPalette = {
  background: '#0B1220',
  surface: '#111A2C',
  surfaceSoft: '#1A2438',
  text: '#E2E8F0',
  textMuted: '#93A3B8',
  primary: '#7DA4D1',
  border: '#27344D',
  card: '#111A2C',
  tabBar: '#111A2C',
  tabInactive: '#7D8CA5',
  success: '#34D399',
  danger: '#FB7185',
  heroStart: '#0C1A30',
  heroMid: '#122845',
  heroEnd: '#17365C',
  modalBackdrop: 'rgba(2, 6, 23, 0.65)',
  onPrimary: '#FFFFFF',
};

export type AppPalette = typeof lightPalette;

type AppThemeContextValue = {
  mode: ThemeMode;
  isDark: boolean;
  theme: AppPalette;
  navigationTheme: NavigationTheme;
  ready: boolean;
  setMode: (next: ThemeMode) => void;
  toggleMode: () => void;
};

const AppThemeContext = createContext<AppThemeContextValue | undefined>(undefined);

export const AppThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>('light');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (!active) return;
        if (stored === 'dark' || stored === 'light') {
          setModeState(stored);
        }
      } finally {
        if (active) setReady(true);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  }, []);

  const toggleMode = useCallback(() => {
    setModeState((prev) => {
      const next: ThemeMode = prev === 'light' ? 'dark' : 'light';
      AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
      return next;
    });
  }, []);

  const theme = useMemo(() => (mode === 'dark' ? darkPalette : lightPalette), [mode]);
  const isDark = mode === 'dark';

  const navigationTheme = useMemo<NavigationTheme>(() => {
    const base = isDark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        background: theme.background,
        card: theme.surface,
        text: theme.text,
        border: theme.border,
        primary: theme.primary,
      },
    };
  }, [isDark, theme]);

  const value = useMemo<AppThemeContextValue>(
    () => ({
      mode,
      isDark,
      theme,
      navigationTheme,
      ready,
      setMode,
      toggleMode,
    }),
    [mode, isDark, theme, navigationTheme, ready, setMode, toggleMode],
  );

  return <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>;
};

export const useAppTheme = () => {
  const context = useContext(AppThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used inside AppThemeProvider.');
  }
  return context;
};
