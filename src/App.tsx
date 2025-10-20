// 1. Imports (외부 → 내부 순서)
import { useState } from 'react';
import Button from '@/components/Button';

// 2. Component
export default function App() {
  // 상태 선언
  const [count, setCount] = useState<number>(0);

  // 핸들러
  const handleIncrement = () => {
    setCount(count + 1);
  };

  const handleReset = () => {
    setCount(0);
  };

  // 렌더링
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md">
        <h1 className="text-4xl font-bold text-indigo-600 mb-4">
          Hello TypeScript!
        </h1>
        <p className="text-gray-700 mb-6">
          React + Vite + TypeScript + Tailwind CSS가 정상적으로 설정되었습니다.
        </p>

        <div className="mb-6">
          <p className="text-2xl font-semibold text-gray-800 mb-4">
            Count: {count}
          </p>
          <div className="flex gap-3">
            <Button onClick={handleIncrement}>
              Increment
            </Button>
            <Button variant="secondary" onClick={handleReset}>
              Reset
            </Button>
          </div>
        </div>

        <div className="text-sm text-gray-500">
          <p>✅ TypeScript</p>
          <p>✅ Tailwind CSS</p>
          <p>✅ Vite</p>
        </div>
      </div>
    </div>
  );
}