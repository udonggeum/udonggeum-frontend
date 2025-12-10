import { Link, useNavigate } from 'react-router-dom';
import { LogIn, User, Settings, LogOut, Store } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import { useLogout } from '@/hooks/queries';
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
  const { mutate: logout } = useLogout();
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
                    to="/mypage"
                    className="text-base"
                  >
                    <User className="w-4 h-4" />
                    마이페이지
                  </Link>
                </li>
                {user?.role === 'admin' && (
                  <li>
                    <Link to="/my-store" className="text-base">
                      <Store className="w-4 h-4" />
                      내 매장 관리
                    </Link>
                  </li>
                )}
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
          to="/"
          className="btn btn-ghost text-xl font-bold normal-case hover:bg-transparent flex items-center gap-2"
          aria-label="홈으로 이동"
        >
          <img
            src="/images/samll-icon.png"
            alt="우동금 로고"
            className="w-8 h-8"
          />
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
                {user?.nickname || '사용자'}
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
                  to="/mypage"
                  className="text-base"
                >
                  <User className="w-4 h-4" />
                  마이페이지
                </Link>
              </li>
              {user?.role === 'admin' && (
                <li>
                  <Link to="/my-store" className="text-base">
                    <Store className="w-4 h-4" />
                    내 매장 관리
                  </Link>
                </li>
              )}
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
