import { Link } from 'react-router-dom';
import { LogIn, User } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
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
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const sortedItems = [...navigationItems].sort(
    (a, b) => a.displayOrder - b.displayOrder
  );

  return (
    <nav className="navbar bg-base-100 shadow-lg sticky top-0 z-50">
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
            className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
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
              <li>
                <Link to="/mypage" className="text-base">
                  <User className="w-4 h-4" />
                  마이페이지
                </Link>
              </li>
            )}
          </ul>
        </div>

        {/* Logo */}
        <Link
          to="/"
          className="btn btn-ghost text-xl font-bold normal-case hover:bg-transparent"
        >
          <span className="text-primary">우동금</span>
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
        {/* Cart Badge (optional - for future enhancement) */}
        <Link
          to="/cart"
          className="btn btn-ghost btn-circle"
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
            <span className="badge badge-sm badge-primary indicator-item">0</span>
          </div>
        </Link>

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
          <Link
            to="/mypage"
            className="btn btn-ghost gap-2 normal-case"
            aria-label="마이페이지"
          >
            <User className="w-5 h-5" />
            <span className="hidden sm:inline">{user?.name || '마이'}</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
