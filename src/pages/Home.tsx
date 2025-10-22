// 1. Imports (외부 → 내부 순서)
import { Link } from 'react-router-dom';

// 2. Component
export default function Home() {
  // 렌더링
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-2xl w-full">
        <h1 className="text-5xl font-bold text-indigo-600 mb-6">
          우동금 Frontend
        </h1>
        <p className="text-gray-700 mb-8 text-lg">
          React + Vite + TypeScript + TailwindCSS + TanStack Query
        </p>

        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <h3 className="font-semibold text-gray-800">TypeScript</h3>
              <p className="text-sm text-gray-600">타입 안전성 보장</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <h3 className="font-semibold text-gray-800">TailwindCSS</h3>
              <p className="text-sm text-gray-600">빠른 UI 개발</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <h3 className="font-semibold text-gray-800">TanStack Query</h3>
              <p className="text-sm text-gray-600">서버 상태 관리</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <h3 className="font-semibold text-gray-800">Zustand</h3>
              <p className="text-sm text-gray-600">클라이언트 상태 관리</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <h3 className="font-semibold text-gray-800">Zod</h3>
              <p className="text-sm text-gray-600">스키마 검증</p>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Link
            to="/apidemo"
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-center"
          >
            API Testing Console →
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            프로젝트 아키텍처와 가이드는 <code className="bg-gray-100 px-2 py-1 rounded">/docs</code> 폴더를 참고하세요
          </p>
        </div>
      </div>
    </div>
  );
}
