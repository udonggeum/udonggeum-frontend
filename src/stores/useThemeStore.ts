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
    primary: '#FFFFFF',      // 순백 배경 - 명도 대비 극대화
    secondary: '#F9FAFB',    // 매우 연한 회색 - 카드/섹션 배경
    gold: '#D4AF37',         // 진한 골드 - 채도 증가, 시인성 향상
    text: '#111827',         // 거의 검정 - 명도 대비 증가
    line: '#E5E7EB',         // 구분선 - 미묘한 회색
  },
  dark: {
    primary: '#1C1C1E',      // 어두운 배경 유지
    secondary: '#2D2D30',    // 중간 회색 - 약간 밝게
    gold: '#F5E6C8',         // 밝은 골드 - 다크모드에서 눈에 잘 띄게
    text: '#F4F4F5',         // 거의 흰색 유지
    line: '#3A3A3C',         // 구분선 유지
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
