import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { AlertCircle, LogOut } from 'lucide-react';

const LogoutPage: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [infoMessage, setInfoMessage] = React.useState('');
  const navigate = useNavigate();

  React.useEffect(() => {
    // If not authenticated, inform the user instead of redirecting immediately
    if (!isAuthenticated) {
      setInfoMessage('이미 로그아웃된 상태입니다. 로그인 후 다시 시도해주세요.');
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    if (!isAuthenticated) {
      setErrorMessage('이미 로그아웃된 상태입니다.');
      return;
    }
    try {
      clearAuth();
      setErrorMessage('');
      setInfoMessage('정상적으로 로그아웃되었습니다.');
      void navigate('/', { replace: true });
    } catch (error) {
      console.error('Failed to logout', error);
      setErrorMessage('로그아웃 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  const handleCancel = () => {
    setErrorMessage('');
    setInfoMessage('');
    void navigate(-1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          <LogOut className="w-16 h-16 text-warning mb-4" />
          <h2 className="card-title text-2xl mb-2">로그아웃</h2>
          <p className="text-base-content/70 mb-6">
            정말 로그아웃 하시겠습니까?
          </p>
          {infoMessage && !errorMessage && (
            <div role="status" className="alert alert-info w-full mb-4">
              <AlertCircle className="w-5 h-5" />
              <span>{infoMessage}</span>
            </div>
          )}
          {errorMessage && (
            <div role="alert" className="alert alert-error w-full mb-4">
              <AlertCircle className="w-5 h-5" />
              <span>{errorMessage}</span>
            </div>
          )}
          <div className="card-actions gap-4">
            <button
              type="button"
              onClick={handleCancel}
              className="btn btn-ghost"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="btn btn-warning"
            >
              <span>로그아웃</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoutPage;
