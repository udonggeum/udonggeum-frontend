import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { LogOut } from 'lucide-react';

const LogoutPage: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const navigate = useNavigate();

  React.useEffect(() => {
    // If not authenticated, redirect to home
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    clearAuth();
    navigate('/');
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          <LogOut className="w-16 h-16 text-warning mb-4" />
          <h2 className="card-title text-2xl mb-2">로그아웃</h2>
          <p className="text-base-content/70 mb-6">
            정말 로그아웃 하시겠습니까?
          </p>
          <div className="card-actions gap-4">
            <button onClick={handleCancel} className="btn btn-ghost">
              취소
            </button>
            <button onClick={handleLogout} className="btn btn-warning">
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoutPage;
