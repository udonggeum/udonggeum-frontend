import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { useLogout } from '@/hooks/queries/useAuthQueries';
import { useWishlist, useOrders } from '@/hooks/queries';
import { User, LogOut, ShoppingBag, Heart, MapPin, Mail, Calendar } from 'lucide-react';
import { Navbar, Footer, Button } from '@/components';
import { NAV_ITEMS } from '@/constants/navigation';

const MyPage: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const { data: wishlistData } = useWishlist(isAuthenticated);
  const { data: ordersData } = useOrders();

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
    // Redirect admin users to their dashboard
    if (isAuthenticated && user?.role === 'admin') {
      void navigate('/seller/dashboard');
    }
  }, [isAuthenticated, user?.role, navigate]);

  if (!isAuthenticated || user?.role === 'admin') {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar navigationItems={NAV_ITEMS} />

      <main className="flex-grow py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Page Header */}
          <div className="mb-8 pb-6 border-b-2 border-[var(--color-gold)]/20">
            <div className="flex items-center gap-5">
              <div className="avatar placeholder">
                <div className="bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold)]/70 text-[var(--color-primary)] rounded-full w-20 h-20 border-4 border-[var(--color-gold)]/20">
                  <User className="w-10 h-10" />
                </div>
              </div>
              <div className="space-y-1">
                <span className="badge badge-lg border-2 border-[var(--color-gold)] text-[var(--color-gold)] bg-[var(--color-gold)]/10 font-semibold mb-2">
                  My Page
                </span>
                <h1 className="text-4xl font-bold text-[var(--color-text)]">마이페이지</h1>
                <p className="text-base text-[var(--color-text)]/60">회원 정보 및 주문 관리</p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="card bg-gradient-to-br from-[var(--color-gold)]/5 to-transparent shadow-md border-2 border-[var(--color-gold)]/20 hover-lift">
              <div className="card-body p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-gold)]/10">
                    <ShoppingBag className="w-6 h-6 text-[var(--color-gold)]" />
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-text)]/70 mb-1">총 주문</p>
                    <p className="text-2xl font-bold text-[var(--color-gold)]">{ordersData?.count || 0}건</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-[var(--color-gold)]/5 to-transparent shadow-md border-2 border-[var(--color-gold)]/20 hover-lift">
              <div className="card-body p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-gold)]/10">
                    <Heart className="w-6 h-6 text-[var(--color-gold)]" />
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-text)]/70 mb-1">찜한 상품</p>
                    <p className="text-2xl font-bold text-[var(--color-gold)]">{wishlistData?.count || 0}개</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-[var(--color-gold)]/5 to-transparent shadow-md border-2 border-[var(--color-gold)]/20 hover-lift">
              <div className="card-body p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-gold)]/10">
                    <MapPin className="w-6 h-6 text-[var(--color-gold)]" />
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-text)]/70 mb-1">배송지</p>
                    <p className="text-2xl font-bold text-[var(--color-gold)]">0개</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-[var(--color-gold)]/5 to-transparent shadow-md border-2 border-[var(--color-gold)]/20 hover-lift">
              <div className="card-body p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-gold)]/10">
                    <User className="w-6 h-6 text-[var(--color-gold)]" />
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-text)]/70 mb-1">포인트</p>
                    <p className="text-2xl font-bold text-[var(--color-gold)]">0P</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Info Card */}
            <div className="card bg-[var(--color-primary)] shadow-md border-2 border-[var(--color-gold)]/20">
              <div className="card-body">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-[var(--color-text)]">회원 정보</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/mypage/edit')}
                    className="border-[var(--color-gold)] text-[var(--color-gold)] hover:bg-[var(--color-gold)] hover:text-[var(--color-primary)]"
                  >
                    수정
                  </Button>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-4 p-4 bg-[var(--color-secondary)] rounded-lg">
                    <User className="w-5 h-5 text-[var(--color-text)]/50 flex-shrink-0" />
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-sm font-medium text-[var(--color-text)]/70 w-20 flex-shrink-0">이름</span>
                      <span className="text-sm font-semibold text-[var(--color-text)] truncate">{user?.name || '-'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-[var(--color-secondary)] rounded-lg">
                    <Mail className="w-5 h-5 text-[var(--color-text)]/50 flex-shrink-0" />
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-sm font-medium text-[var(--color-text)]/70 w-20 flex-shrink-0">이메일</span>
                      <span className="text-sm font-semibold text-[var(--color-text)] truncate">{user?.email || '-'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-[var(--color-secondary)] rounded-lg">
                    <MapPin className="w-5 h-5 text-[var(--color-text)]/50 flex-shrink-0" />
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-sm font-medium text-[var(--color-text)]/70 w-20 flex-shrink-0">전화번호</span>
                      <span className="text-sm font-semibold text-[var(--color-text)] truncate">{user?.phone || '-'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-[var(--color-secondary)] rounded-lg">
                    <Calendar className="w-5 h-5 text-[var(--color-text)]/50 flex-shrink-0" />
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-sm font-medium text-[var(--color-text)]/70 w-20 flex-shrink-0">가입일</span>
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
                <div className="card-actions mt-4">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/mypage/addresses')}
                    className="w-full gap-2"
                  >
                    <MapPin className="w-4 h-4" />
                    배송지 관리
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="card bg-[var(--color-primary)] shadow-md border-2 border-[var(--color-gold)]/20">
              <div className="card-body">
                <h2 className="text-xl font-bold text-[var(--color-text)] mb-6">빠른 메뉴</h2>

                {/* Orders */}
                <div className="space-y-4">
                  <div className="p-4 bg-[var(--color-secondary)] rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-[var(--color-gold)]" />
                        <h3 className="font-semibold text-[var(--color-text)]">주문 내역</h3>
                      </div>
                      <span className="text-2xl font-bold text-[var(--color-gold)]">{ordersData?.count || 0}</span>
                    </div>
                    {ordersData && ordersData.count > 0 ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => navigate('/orders')}
                        className="w-full"
                      >
                        주문 내역 보기
                      </Button>
                    ) : (
                      <div>
                        <p className="text-xs text-[var(--color-text)]/70 mb-2">주문 내역이 없습니다</p>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => navigate('/products')}
                          className="w-full"
                        >
                          상품 둘러보기
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Wishlist */}
                  <div className="p-4 bg-[var(--color-secondary)] rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Heart className="w-5 h-5 text-[var(--color-gold)]" />
                        <h3 className="font-semibold text-[var(--color-text)]">찜 목록</h3>
                      </div>
                      <span className="text-2xl font-bold text-[var(--color-gold)]">{wishlistData?.count || 0}</span>
                    </div>
                    {wishlistData && wishlistData.count > 0 ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => navigate('/wishlist')}
                        className="w-full"
                      >
                        찜 목록 보기
                      </Button>
                    ) : (
                      <div>
                        <p className="text-xs text-[var(--color-text)]/70 mb-2">찜한 상품이 없습니다</p>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => navigate('/products')}
                          className="w-full"
                        >
                          상품 둘러보기
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="divider my-2"></div>

                <Button
                  variant="error"
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
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MyPage;
