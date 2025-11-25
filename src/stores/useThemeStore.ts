import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Theme {
  primary: string;
  secondary: string;
  gold: string;
  text: string;
  line?: string;
}

export const themes = {
  light: {
    primary: '#FFFFFF',
    secondary: '#F3F3F4',
    gold: '#D7B56D',
    text: '#2A2A2A',
    line: '#E5E5E5',
  },
  dark: {
    primary: '#1C1C1E',
    secondary: '#3A3A3C',
    gold: '#C6A667',
    text: '#F4F4F5',
    line: '#3A3A3C',
  },
} as const;

export type ThemeMode = keyof typeof themes;

interface ThemeStore {
  mode: ThemeMode;
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      mode: 'light',
      theme: themes.light,
      toggleTheme: () =>
        set((state) => {
          const newMode = state.mode === 'light' ? 'dark' : 'light';
          return {
            mode: newMode,
            theme: themes[newMode],
          };
        }),
      setTheme: (mode: ThemeMode) =>
        set({
          mode,
          theme: themes[mode],
        }),
    }),
    {
      name: 'udg-theme-store',
    }
  )
);
