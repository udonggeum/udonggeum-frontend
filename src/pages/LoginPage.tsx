import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { LogIn } from 'lucide-react';

const LoginPage: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  React.useEffect(() => {
    // Redirect to home if already authenticated
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = () => {
    // Mock login - in production, this would call an API
    const mockUser = {
      id: 1,
      name: '테스트 사용자',
      email: 'user@example.com',
      role: 'user' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const mockTokens = {
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
    };
    setAuth(mockUser, mockTokens);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          <LogIn className="w-16 h-16 text-primary mb-4" />
          <h2 className="card-title text-2xl mb-2">로그인</h2>
          <p className="text-base-content/70 mb-6">
            우동금 서비스에 로그인하세요
          </p>
          <div className="card-actions">
            <button onClick={handleLogin} className="btn btn-primary btn-wide">
              로그인하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
