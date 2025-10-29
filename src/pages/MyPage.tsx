import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { User, LogOut } from 'lucide-react';

const MyPage: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate('/');
  };

  React.useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-base-200 py-8">
      <div className="container mx-auto px-4">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex items-center gap-4 mb-6">
              <div className="avatar placeholder">
                <div className="bg-primary text-primary-content rounded-full w-20">
                  <User className="w-10 h-10" />
                </div>
              </div>
              <div>
                <h2 className="card-title text-3xl">마이페이지</h2>
                <p className="text-base-content/70">회원 정보 및 주문 관리</p>
              </div>
            </div>

            <div className="divider"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="stats shadow">
                <div className="stat">
                  <div className="stat-title">총 주문</div>
                  <div className="stat-value text-primary">0</div>
                  <div className="stat-desc">지금까지의 주문 횟수</div>
                </div>
              </div>

              <div className="stats shadow">
                <div className="stat">
                  <div className="stat-title">적립 포인트</div>
                  <div className="stat-value text-secondary">0P</div>
                  <div className="stat-desc">사용 가능한 포인트</div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-xl font-bold mb-4">회원 정보</h3>
              <div className="space-y-2">
                <p><span className="font-semibold">이름:</span> {user?.name || '-'}</p>
                <p><span className="font-semibold">이메일:</span> {user?.email || '-'}</p>
                <p><span className="font-semibold">가입일:</span> 2025-01-01</p>
              </div>
            </div>

            <div className="divider"></div>

            <div className="card-actions justify-end">
              <button onClick={handleLogout} className="btn btn-error btn-outline gap-2">
                <LogOut className="w-4 h-4" />
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPage;
