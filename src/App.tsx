// 1. Imports (외부 → 내부 순서)
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainPage from '@/pages/MainPage';
import Home from '@/pages/Home';
import ApiDemo from '@/pages/ApiDemo';
import ComponentsDemo from '@/pages/ComponentsDemo';
import LoginPage from '@/pages/LoginPage';
import MyPage from '@/pages/MyPage';
import LogoutPage from '@/pages/LogoutPage';
import ProductsPage from '@/pages/ProductsPage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import CartPage from '@/pages/CartPage';
import StoresPage from '@/pages/StoresPage';

// 2. Component
export default function App() {
  // 렌더링
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/old-home" element={<Home />} />
        <Route path="/apidemo" element={<ApiDemo />} />
        <Route path="/components-demo" element={<ComponentsDemo />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/logout" element={<LogoutPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:productId" element={<ProductDetailPage />} />
        <Route path="/stores" element={<StoresPage />} />
        <Route path="/cart" element={<CartPage />} />
      </Routes>
    </BrowserRouter>
  );
}
