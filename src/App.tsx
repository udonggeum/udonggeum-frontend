// 1. Imports (외부 → 내부 순서)
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainPage from '@/pages/MainPage';
import Home from '@/pages/Home';
import ApiDemo from '@/pages/ApiDemo';
import ComponentsDemo from '@/pages/ComponentsDemo';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import MyPage from '@/pages/MyPage';
import LogoutPage from '@/pages/LogoutPage';
import ProductsPage from '@/pages/ProductsPage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import StoresPage from '@/pages/StoresPage';
import StoreDetailPage from '@/pages/StoreDetailPage';
import CartPage from '@/pages/CartPage';
import MinimalLayout from '@/components/layouts/MinimalLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

// 2. Component
export default function App() {
  // 렌더링
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes - MinimalLayout (no header/footer) */}
        <Route element={<MinimalLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
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
          path="/mypage"
          element={
            <ProtectedRoute>
              <MyPage />
            </ProtectedRoute>
          }
        />

        {/* Regular Routes - No layout (TODO: Add DefaultLayout) */}
        <Route path="/" element={<MainPage />} />
        <Route path="/old-home" element={<Home />} />
        <Route path="/apidemo" element={<ApiDemo />} />
        <Route path="/components-demo" element={<ComponentsDemo />} />
        <Route path="/logout" element={<LogoutPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:productId" element={<ProductDetailPage />} />
        <Route path="/stores" element={<StoresPage />} />
        <Route path="/stores/:storeId" element={<StoreDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}
