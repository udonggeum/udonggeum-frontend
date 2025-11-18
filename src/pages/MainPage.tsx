import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, ShoppingCart, UserRound } from 'lucide-react';
import MainHeroSection from '../components/MainHeroSection';
import ProductCarousel from '../components/ProductCarousel';
import { useAuthStore } from '../stores/useAuthStore';
import { usePopularProducts } from '../hooks/queries/useProductsQueries';
import { transformProductsFromAPI } from '../utils/apiAdapters';

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

  // Redirect admin users to dashboard
  useEffect(() => {
    if (user?.role === 'admin') {
      void navigate('/seller/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Fetch popular products from API
  const { data: popularData } = usePopularProducts({
    page_size: 10,
  });

  const popularProducts = popularData
    ? transformProductsFromAPI(popularData.products)
    : [];

  return (
    <div className="min-h-screen bg-base-100">
      {/* User Menu - Fixed top right */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        {isAuthenticated ? (
          <>
            <Link
              to="/mypage"
              className="btn btn-ghost btn-circle"
              aria-label="마이페이지"
              title="마이페이지"
            >
              <UserRound className="h-5 w-5" />
            </Link>
            <Link
              to="/cart"
              className="btn btn-ghost btn-circle"
              aria-label="장바구니"
              title="장바구니"
            >
              <ShoppingCart className="h-5 w-5" />
            </Link>
          </>
        ) : (
          <Link
            to="/login"
            className="btn btn-ghost btn-circle"
            aria-label="로그인"
            title="로그인"
          >
            <LogIn className="h-5 w-5" />
          </Link>
        )}
      </div>

      {/* Hero Section with Search - Full Screen */}
      <MainHeroSection />

      {/* Divider */}
      <div className="divider my-0"></div>

      {/* Popular Products Carousel */}
      <ProductCarousel title="인기상품" products={popularProducts} />
    </div>
  );
}
