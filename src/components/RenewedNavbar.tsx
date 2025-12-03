import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';

/**
 * RenewedNavbar Component
 *
 * ui-renewal/main.html 디자인을 기반으로 한 네비게이션바
 *
 * Features:
 * - 심플하고 깔끔한 디자인 (ui-renewal 스타일)
 * - 로고 + 네비게이션 링크
 * - 로그인/사용자 아바타
 * - sticky top
 */
export default function RenewedNavbar() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  return (
    <header className="w-full bg-white sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-[1200px] mx-auto px-5 h-[60px] flex justify-between items-center">
        {/* 로고 */}
        <Link
          to={user?.role === 'admin' ? '/seller/dashboard' : '/'}
          className="flex items-center gap-2"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
          </div>
          <span className="text-lg font-bold text-gray-900">우리동네금은방</span>
        </Link>

        {/* 네비게이션 */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/products?category=gold"
            className="text-[15px] font-medium text-gray-600 hover:text-gray-900 transition-all duration-200"
          >
            금시세
          </Link>
          <Link
            to="/stores"
            className="text-[15px] font-medium text-gray-600 hover:text-gray-900 transition-all duration-200"
          >
            매장찾기
          </Link>
          <Link
            to="/community"
            className="text-[15px] font-medium text-gray-600 hover:text-gray-900 transition-all duration-200"
          >
            커뮤니티
          </Link>
        </nav>

        {/* 우측 영역 */}
        <div className="flex items-center gap-3">
          {!isAuthenticated ? (
            /* 비로그인 상태 */
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="hidden md:block px-4 py-2 text-[14px] font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                로그인
              </Link>
              <Link
                to="/register"
                className="px-4 py-2.5 text-[14px] font-semibold text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-all duration-200"
              >
                시작하기
              </Link>
            </div>
          ) : (
            /* 로그인 상태 */
            <Link
              to={user?.role === 'admin' ? '/seller/dashboard' : '/mypage'}
              className="w-9 h-9 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center text-white text-[14px] font-bold"
            >
              {user?.name?.charAt(0) || 'U'}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
