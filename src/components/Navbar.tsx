import { Link, useNavigate } from 'react-router-dom';
import { LogIn, User, Moon, Sun, Settings, LogOut, LayoutDashboard, Home } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import { useThemeStore } from '../stores/useThemeStore';
import { useCart, useLogout } from '@/hooks/queries';
import type { NavigationItem } from '../types';

interface NavbarProps {
  navigationItems: NavigationItem[];
}

/**
 * Navbar Component
 *
 * Responsive navigation bar with logo and menu items.
 * Desktop (≥1024px): Horizontal menu
 * Mobile (<1024px): Hamburger menu with dropdown
 */
export default function Navbar({ navigationItems }: NavbarProps) {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const { mode, toggleTheme } = useThemeStore();
  const { data: cartData } = useCart();
  const { mutate: logout } = useLogout();
  const cartItemCount = cartData?.cart_items?.length || 0;
  const sortedItems = [...navigationItems].sort(
    (a, b) => a.displayOrder - b.displayOrder
  );

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        navigate('/');
      },
    });
  };

  return (
    <nav className="navbar bg-[var(--color-primary)] shadow-lg sticky top-0 z-50">
      <div className="navbar-start">
        {/* Mobile Hamburger Menu */}
        <div className="dropdown lg:hidden">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost btn-circle"
            aria-label="메뉴 열기"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-[var(--color-primary)] rounded-box w-52"
          >
            {sortedItems.map((item) => (
              <li key={item.id}>
                <Link to={item.path} className="text-base">
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="menu-title mt-2">
              <span>설정</span>
            </li>
            <li>
              <button
                type="button"
                onClick={toggleTheme}
                className="text-base"
              >
                {mode === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                {mode === 'light' ? '다크 모드' : '라이트 모드'}
              </button>
            </li>
            <li className="menu-title mt-2">
              <span>계정</span>
            </li>
            {!isAuthenticated ? (
              <li>
                <Link to="/login" className="text-base">
                  <LogIn className="w-4 h-4" />
                  로그인
                </Link>
              </li>
            ) : (
              <>
                <li>
                  <Link
                    to={user?.role === 'admin' ? '/seller/dashboard' : '/mypage'}
                    className="text-base"
                  >
                    {user?.role === 'admin' ? <LayoutDashboard className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    {user?.role === 'admin' ? '대시보드' : '마이페이지'}
                  </Link>
                </li>
                <li>
                  <Link to="/mypage/edit" className="text-base">
                    <Settings className="w-4 h-4" />
                    프로필 수정
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="text-base w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    로그아웃
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Logo */}
        <Link
          to={user?.role === 'admin' ? '/seller/dashboard' : '/'}
          className="btn btn-ghost text-xl font-bold normal-case hover:bg-transparent flex items-center gap-2"
          aria-label="홈으로 이동"
        >
          <Home className="w-6 h-6 text-[var(--color-gold)]" />
          <span className="text-[var(--color-gold)]">우동금</span>
        </Link>
      </div>

      {/* Desktop Navigation Menu (hidden on mobile) */}
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1 gap-1">
          {sortedItems.map((item) => (
            <li key={item.id}>
              <Link to={item.path} className="text-base font-medium">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Right Side Actions */}
      <div className="navbar-end gap-2">
        {/* Cart Badge - Hidden for admin users */}
        {user?.role !== 'admin' && (
          <Link
            to="/cart"
            className="btn btn-ghost btn-circle text-[var(--color-text)]"
            aria-label="장바구니로 이동"
          >
            <div className="indicator">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {cartItemCount > 0 && (
                <span className="badge badge-sm bg-[var(--color-gold)] text-[var(--color-primary)] border-[var(--color-gold)] indicator-item">
                  {cartItemCount}
                </span>
              )}
            </div>
          </Link>
        )}

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          className="btn btn-ghost btn-circle text-[var(--color-text)]"
          aria-label={mode === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'}
          title={mode === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'}
        >
          {mode === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </button>

        {/* Auth Buttons - Conditional based on auth state */}
        {!isAuthenticated ? (
          <Link
            to="/login"
            className="btn btn-ghost btn-circle"
            aria-label="로그인"
          >
            <LogIn className="w-5 h-5" />
          </Link>
        ) : (
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost gap-2 normal-case"
              aria-label="사용자 메뉴"
            >
              <User className="w-5 h-5" />
              <span className="hidden sm:inline">
                {user?.name || '사용자'}
              </span>
              <svg
                className="w-4 h-4 hidden sm:inline"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-[var(--color-secondary)] border border-[var(--color-text)]/10 rounded-box w-52"
            >
              <li className="menu-title">
                <span className="text-xs text-[var(--color-text)]/70">
                  {user?.email}
                </span>
              </li>
              <li>
                <Link
                  to={user?.role === 'admin' ? '/seller/dashboard' : '/mypage'}
                  className="text-base"
                >
                  {user?.role === 'admin' ? (
                    <>
                      <LayoutDashboard className="w-4 h-4" />
                      대시보드
                    </>
                  ) : (
                    <>
                      <User className="w-4 h-4" />
                      마이페이지
                    </>
                  )}
                </Link>
              </li>
              <li>
                <Link to="/mypage/edit" className="text-base">
                  <Settings className="w-4 h-4" />
                  프로필 수정
                </Link>
              </li>
              <div className="divider my-0"></div>
              <li>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-base text-error"
                >
                  <LogOut className="w-4 h-4" />
                  로그아웃
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
}
