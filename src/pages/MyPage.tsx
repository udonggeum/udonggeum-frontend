import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { useLogout } from '@/hooks/queries/useAuthQueries';
import { User, LogOut, MapPin, Mail, Calendar, Phone } from 'lucide-react';
import { Navbar, Footer, Button } from '@/components';
import { NAVIGATION_ITEMS } from '@/constants/navigation';

const MyPage: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        void navigate('/');
      },
    });
  };

  React.useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      void navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar navigationItems={NAVIGATION_ITEMS} />

      <main className="flex-grow py-6">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Page Header */}
          <div className="mb-6 pb-4 border-b-2 border-[var(--color-gold)]/20">
            <div className="flex items-center gap-4">
              <div className="avatar placeholder">
                <div className="bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold)]/70 text-[var(--color-primary)] rounded-full w-16 h-16 border-4 border-[var(--color-gold)]/20">
                  <User className="w-8 h-8" />
                </div>
              </div>
              <div className="space-y-0.5">
                <span className="badge badge-sm border border-[var(--color-gold)] text-[var(--color-gold)] bg-[var(--color-gold)]/10 font-medium mb-1">
                  My Page
                </span>
                <h1 className="text-2xl font-bold text-[var(--color-text)]">마이페이지</h1>
                <p className="text-sm text-[var(--color-text)]/60">회원 정보 관리</p>
              </div>
            </div>
          </div>

          {/* User Info Card */}
          <div className="card bg-[var(--color-primary)] shadow-md border-2 border-[var(--color-gold)]/20">
            <div className="card-body p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[var(--color-text)]">회원 정보</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/mypage/edit')}
                  className="border-[var(--color-gold)] text-[var(--color-gold)] hover:bg-[var(--color-gold)] hover:text-[var(--color-primary)]"
                >
                  수정
                </Button>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 bg-[var(--color-secondary)] rounded-lg">
                  <User className="w-4 h-4 text-[var(--color-text)]/50 flex-shrink-0" />
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-xs font-medium text-[var(--color-text)]/70 w-16 flex-shrink-0">닉네임</span>
                    <span className="text-sm font-semibold text-[var(--color-text)] truncate">{user?.nickname || '-'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-[var(--color-secondary)] rounded-lg">
                  <User className="w-4 h-4 text-[var(--color-text)]/50 flex-shrink-0" />
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-xs font-medium text-[var(--color-text)]/70 w-16 flex-shrink-0">이름</span>
                    <span className="text-sm font-semibold text-[var(--color-text)] truncate">{user?.name || '-'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-[var(--color-secondary)] rounded-lg">
                  <Mail className="w-4 h-4 text-[var(--color-text)]/50 flex-shrink-0" />
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-xs font-medium text-[var(--color-text)]/70 w-16 flex-shrink-0">이메일</span>
                    <span className="text-sm font-semibold text-[var(--color-text)] truncate">{user?.email || '-'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-[var(--color-secondary)] rounded-lg">
                  <Phone className="w-4 h-4 text-[var(--color-text)]/50 flex-shrink-0" />
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-xs font-medium text-[var(--color-text)]/70 w-16 flex-shrink-0">전화번호</span>
                    <span className="text-sm font-semibold text-[var(--color-text)] truncate">{user?.phone || '-'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-[var(--color-secondary)] rounded-lg">
                  <MapPin className="w-4 h-4 text-[var(--color-text)]/50 flex-shrink-0" />
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-xs font-medium text-[var(--color-text)]/70 w-16 flex-shrink-0">주소</span>
                    <span className="text-sm font-semibold text-[var(--color-text)] truncate">{user?.address || '-'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-[var(--color-secondary)] rounded-lg">
                  <Calendar className="w-4 h-4 text-[var(--color-text)]/50 flex-shrink-0" />
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-xs font-medium text-[var(--color-text)]/70 w-16 flex-shrink-0">가입일</span>
                    <span className="text-sm font-semibold text-[var(--color-text)] truncate">
                      {user?.created_at
                        ? new Date(user.created_at).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : '-'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="divider my-3"></div>

              <Button
                variant="error"
                size="sm"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full gap-2"
              >
                {isLoggingOut ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    <span>로그아웃 중...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4" />
                    <span>로그아웃</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MyPage;
