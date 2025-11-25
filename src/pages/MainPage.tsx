import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, ShoppingCart, UserRound, Moon, Sun } from 'lucide-react';
import Button from '../components/Button';
import MainHeroSection from '../components/MainHeroSection';
import { useAuthStore } from '../stores/useAuthStore';
import { useThemeStore } from '../stores/useThemeStore';

/**
 * MainPage Component
 *
 * The main landing page for the jewelry marketplace.
 * Features full-screen hero section with indexed search and popular products carousel below.
 */
export default function MainPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { mode, toggleTheme } = useThemeStore();

  // Redirect admin users to dashboard
  useEffect(() => {
    if (user?.role === 'admin') {
      void navigate('/seller/dashboard', { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen">
      {/* User Menu - Fixed top right */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        {/* Theme Toggle Button */}
        <Button
          variant="circle"
          onClick={toggleTheme}
          style={{ backgroundColor: 'transparent' }}
          aria-label={mode === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'}
          title={mode === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'}
        >
          {mode === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </Button>

        {isAuthenticated ? (
          <>
            <Link
              to="/mypage"
              className="btn btn-ghost btn-circle text-[var(--color-text)]"
              aria-label="마이페이지"
              title="마이페이지"
            >
              <UserRound className="h-5 w-5" />
            </Link>
            <Link
              to="/cart"
              className="btn btn-ghost btn-circle text-[var(--color-text)]"
              aria-label="장바구니"
              title="장바구니"
            >
              <ShoppingCart className="h-5 w-5" />
            </Link>
          </>
        ) : (
          <Link
            to="/login"
            className="btn btn-ghost btn-circle text-[var(--color-text)]"
            aria-label="로그인"
            title="로그인"
          >
            <LogIn className="h-5 w-5" />
          </Link>
        )}
      </div>

      {/* Hero Section with Search - Full Screen */}
      <MainHeroSection />
    </div>
  );
}
