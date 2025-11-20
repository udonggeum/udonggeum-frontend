// 1. Imports (외부 → 내부 순서)
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainPage from '@/pages/MainPage';
import Home from '@/pages/Home';
import ApiDemo from '@/pages/ApiDemo';
import ComponentsDemo from '@/pages/ComponentsDemo';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import MyPage from '@/pages/MyPage';
import ProfileEditPage from '@/pages/ProfileEditPage';
import ProductsPage from '@/pages/ProductsPage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import StoresPage from '@/pages/StoresPage';
import StoreDetailPage from '@/pages/StoreDetailPage';
import CartPage from '@/pages/CartPage';
import OrderPage from '@/pages/OrderPage';
import WishlistPage from '@/pages/WishlistPage';
import OrderHistoryPage from '@/pages/OrderHistoryPage';
import AddressManagementPage from '@/pages/AddressManagementPage';
import SellerDashboardPage from '@/pages/SellerDashboardPage';
import SellerStoresPage from '@/pages/SellerStoresPage';
import SellerProductsPage from '@/pages/SellerProductsPage';
import SellerOrdersPage from '@/pages/SellerOrdersPage';
import MinimalLayout from '@/components/layouts/MinimalLayout';
import SellerLayout from '@/components/layouts/SellerLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminRoute from '@/components/AdminRoute';
import { useThemeStore } from '@/stores/useThemeStore';

// 2. Component
export default function App() {
  const theme = useThemeStore((state) => state.theme);

  // Update CSS variables when theme changes
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', theme.primary);
    root.style.setProperty('--color-secondary', theme.secondary);
    root.style.setProperty('--color-gold', theme.gold);
    root.style.setProperty('--color-text', theme.text);
    root.style.setProperty('--color-line', theme.line || theme.secondary);
  }, [theme]);

  // 렌더링
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes - MinimalLayout (no header/footer) */}
        <Route element={<MinimalLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

        {/* Protected Routes - Require authentication */}
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order"
          element={
            <ProtectedRoute>
              <OrderPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mypage"
          element={
            <ProtectedRoute>
              <MyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mypage/edit"
          element={
            <ProtectedRoute>
              <ProfileEditPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mypage/addresses"
          element={
            <ProtectedRoute>
              <AddressManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wishlist"
          element={
            <ProtectedRoute>
              <WishlistPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrderHistoryPage />
            </ProtectedRoute>
          }
        />

        {/* Seller Routes - Require admin role with SellerLayout */}
        <Route element={<SellerLayout />}>
          <Route
            path="/seller/dashboard"
            element={
              <AdminRoute>
                <SellerDashboardPage />
              </AdminRoute>
            }
          />
          <Route
            path="/seller/stores"
            element={
              <AdminRoute>
                <SellerStoresPage />
              </AdminRoute>
            }
          />
          <Route
            path="/seller/products"
            element={
              <AdminRoute>
                <SellerProductsPage />
              </AdminRoute>
            }
          />
          <Route
            path="/seller/orders"
            element={
              <AdminRoute>
                <SellerOrdersPage />
              </AdminRoute>
            }
          />
        </Route>

        {/* Regular Routes - No layout (TODO: Add DefaultLayout) */}
        <Route path="/" element={<MainPage />} />
        <Route path="/old-home" element={<Home />} />
        <Route path="/apidemo" element={<ApiDemo />} />
        <Route path="/components-demo" element={<ComponentsDemo />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:productId" element={<ProductDetailPage />} />
        <Route path="/stores" element={<StoresPage />} />
        <Route path="/stores/:storeId" element={<StoreDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}
