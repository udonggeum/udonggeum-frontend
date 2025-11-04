import { Outlet } from 'react-router-dom';

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
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <Outlet />
    </div>
  );
}
