import { Outlet, Link } from 'react-router-dom';
import { Home } from 'lucide-react';

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
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-[var(--color-primary)]">
      {/* Top Right Actions */}
      <div className="absolute top-4 right-4">
        {/* Home Button */}
        <Link
          to="/"
          className="btn btn-ghost btn-circle hover:bg-opacity-10 text-[var(--color-text)]"
          style={{ backgroundColor: 'transparent' }}
          aria-label="홈으로"
        >
          <Home className="h-5 w-5" />
        </Link>
      </div>

      <Outlet />
    </div>
  );
}
