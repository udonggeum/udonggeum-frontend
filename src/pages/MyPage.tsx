import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { useLogout } from '@/hooks/queries/useAuthQueries';
import { useWishlist, useOrders } from '@/hooks/queries';
import { User, LogOut, ShoppingBag, Heart, MapPin } from 'lucide-react';

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
                  <div className="stat-value text-primary">
                    {ordersData?.count || 0}
                  </div>
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">회원 정보</h3>
                <button
                  type="button"
                  onClick={() => {
                    void navigate('/mypage/edit');
                  }}
                  className="btn btn-sm btn-primary btn-outline"
                >
                  정보 수정
                </button>
              </div>
              <div className="space-y-2">
                <p><span className="font-semibold">이름:</span> {user?.name || '-'}</p>
                <p><span className="font-semibold">이메일:</span> {user?.email || '-'}</p>
                <p><span className="font-semibold">전화번호:</span> {user?.phone || '-'}</p>
                <p>
                  <span className="font-semibold">가입일:</span>{' '}
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : '-'}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={() => {
                  void navigate('/mypage/addresses');
                }}
                className="btn btn-outline gap-2 w-full md:w-auto"
              >
                <MapPin className="w-4 h-4" />
                배송지 관리
              </button>
            </div>

            <div className="divider"></div>

            {/* Orders Section */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <ShoppingBag className="w-6 h-6" />
                  주문 내역
                </h3>
                {ordersData && ordersData.count > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      void navigate('/orders');
                    }}
                    className="btn btn-sm btn-primary btn-outline"
                  >
                    전체 보기
                  </button>
                )}
              </div>
              {ordersData && ordersData.count > 0 ? (
                <div className="stats shadow w-full">
                  <div className="stat">
                    <div className="stat-title">총 주문</div>
                    <div className="stat-value text-primary">{ordersData.count}건</div>
                    <div className="stat-actions">
                      <button
                        type="button"
                        onClick={() => {
                          void navigate('/orders');
                        }}
                        className="btn btn-sm btn-primary"
                      >
                        주문 내역 보기
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="alert">
                  <div>
                    <p className="text-base-content/70">주문 내역이 없습니다</p>
                    <p className="text-sm text-base-content/50">첫 주문을 시작해보세요!</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      void navigate('/products');
                    }}
                    className="btn btn-sm btn-primary"
                  >
                    상품 둘러보기
                  </button>
                </div>
              )}
            </div>

            <div className="divider"></div>

            {/* Favorites Section */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Heart className="w-6 h-6" />
                  찜 목록
                </h3>
                {wishlistData && wishlistData.count > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      void navigate('/wishlist');
                    }}
                    className="btn btn-sm btn-primary btn-outline"
                  >
                    전체 보기
                  </button>
                )}
              </div>
              {wishlistData && wishlistData.count > 0 ? (
                <div className="stats shadow w-full">
                  <div className="stat">
                    <div className="stat-title">찜한 상품</div>
                    <div className="stat-value text-secondary">{wishlistData.count}개</div>
                    <div className="stat-actions">
                      <button
                        type="button"
                        onClick={() => {
                          void navigate('/wishlist');
                        }}
                        className="btn btn-sm btn-secondary"
                      >
                        찜 목록 보기
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="alert">
                  <div>
                    <p className="text-base-content/70">찜한 상품이 없습니다</p>
                    <p className="text-sm text-base-content/50">마음에 드는 상품을 찜해보세요!</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      void navigate('/products');
                    }}
                    className="btn btn-sm btn-primary"
                  >
                    상품 둘러보기
                  </button>
                </div>
              )}
            </div>

            <div className="divider"></div>

            <div className="card-actions justify-end">
              <button
                onClick={handleLogout}
                className="btn btn-error btn-outline gap-2"
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <LogOut className="w-4 h-4" />
                )}
                {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPage;
