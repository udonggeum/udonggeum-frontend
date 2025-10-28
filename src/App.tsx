// 1. Imports (외부 → 내부 순서)
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainPage from '@/pages/MainPage';
import Home from '@/pages/Home';
import ApiDemo from '@/pages/ApiDemo';

// 2. Component
export default function App() {
  // 렌더링
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/old-home" element={<Home />} />
        <Route path="/apidemo" element={<ApiDemo />} />
      </Routes>
    </BrowserRouter>
  );
}
