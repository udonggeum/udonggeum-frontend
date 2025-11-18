import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';

interface AdminRouteProps {
  children: React.ReactNode;
}

/**
 * AdminRoute Component
 *
 * Wraps routes that require admin authentication
 * - Redirects unauthenticated users to login
 * - Redirects non-admin users to home page
 * - Allows admin users to access content
 *
 * @example
 * <Route
 *   path="/seller/dashboard"
 *   element={
 *     <AdminRoute>
 *       <SellerDashboardPage />
 *     </AdminRoute>
 *   }
 * />
 */
export default function AdminRoute({ children }: AdminRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // If authenticated but not an admin, redirect to home
  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
