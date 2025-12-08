// 1. Imports (외부 → 내부 순서)
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
import StoresPage from '@/pages/StoresPage';
import StoreDetailPage from '@/pages/StoreDetailPage';
import PricePage from '@/pages/PricePage';
import WishlistPage from '@/pages/WishlistPage';
import AddressManagementPage from '@/pages/AddressManagementPage';
import CommunityPage from '@/pages/CommunityPage';
import CommunityDetailPage from '@/pages/CommunityDetailPage';
import CommunityWritePage from '@/pages/CommunityWritePage';
import MinimalLayout from '@/components/layouts/MinimalLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

// 2. Component
export default function App() {
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

        {/* Regular Routes - No layout (TODO: Add DefaultLayout) */}
        <Route path="/" element={<MainPage />} />
        <Route path="/old-home" element={<Home />} />
        <Route path="/apidemo" element={<ApiDemo />} />
        <Route path="/components-demo" element={<ComponentsDemo />} />
        <Route path="/stores" element={<StoresPage />} />
        <Route path="/stores/:storeId" element={<StoreDetailPage />} />
        <Route path="/price" element={<PricePage />} />

        {/* Community Routes */}
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/community/:id" element={<CommunityDetailPage />} />
        <Route path="/community/posts/:id" element={<CommunityDetailPage />} />
        <Route
          path="/community/write"
          element={
            <ProtectedRoute>
              <CommunityWritePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/community/edit/:id"
          element={
            <ProtectedRoute>
              <CommunityWritePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
