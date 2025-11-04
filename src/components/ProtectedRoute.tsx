import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute Component
 *
 * Wraps routes that require authentication
 * - Redirects unauthenticated users to login
 * - Preserves intended destination via query param
 * - Allows authenticated users to access content
 *
 * @example
 * <Route
 *   path="/cart"
 *   element={
 *     <ProtectedRoute>
 *       <CartPage />
 *     </ProtectedRoute>
 *   }
 * />
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login with return URL preserved
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return <>{children}</>;
}
