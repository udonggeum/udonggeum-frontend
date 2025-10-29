// 1. Imports (외부 → 내부 순서)
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainPage from '@/pages/MainPage';
import Home from '@/pages/Home';
import ApiDemo from '@/pages/ApiDemo';
import LoginPage from '@/pages/LoginPage';
import MyPage from '@/pages/MyPage';
import LogoutPage from '@/pages/LogoutPage';

// 2. Component
export default function App() {
  // 렌더링
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/old-home" element={<Home />} />
        <Route path="/apidemo" element={<ApiDemo />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/logout" element={<LogoutPage />} />
      </Routes>
    </BrowserRouter>
  );
}
