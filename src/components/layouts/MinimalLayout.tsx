import { Outlet } from 'react-router-dom';
import { useThemeStore } from '@/stores/useThemeStore';
import { Moon, Sun } from 'lucide-react';

/**
 * MinimalLayout Component
 *
 * Clean, centered layout for authentication pages
 * - No navigation header
 * - No footer
 * - Centered content with responsive padding
 * - Used for: Login, Register pages
 *
 * @example
 * <Route element={<MinimalLayout />}>
 *   <Route path="/login" element={<LoginPage />} />
 *   <Route path="/register" element={<RegisterPage />} />
 * </Route>
 */
export default function MinimalLayout() {
  const { mode, toggleTheme } = useThemeStore();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-[var(--color-primary)]">
      {/* Theme Toggle Button */}
      <button
        type="button"
        onClick={toggleTheme}
        className="btn btn-ghost btn-circle absolute top-4 right-4 hover:bg-opacity-10 text-[var(--color-text)]"
        style={{ backgroundColor: 'transparent' }}
        aria-label={mode === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'}
        title={mode === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'}
      >
        {mode === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
      </button>

      <Outlet />
    </div>
  );
}
