import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Navbar,
  Footer,
  OrderCard,
  LoadingSpinner,
  ErrorAlert,
} from '@/components';
import { useOrders } from '@/hooks/queries';
import { NAV_ITEMS } from '@/constants/navigation';

type StatusFilter = 'all' | 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';

/**
 * OrderHistoryPage Component
 *
 * Displays user's order history with filtering options.
 * Features:
 * - Filter by order status
 * - Empty state with call-to-action
 * - Order detail view
 * - Date sorting (newest first)
 */
export default function OrderHistoryPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const {
    data: ordersData,
    isLoading,
    error,
    refetch,
  } = useOrders();

  // Filter orders by status
  const filteredOrders = ordersData?.orders.filter((order) => {
    if (statusFilter === 'all') return true;
    return order.status === statusFilter;
  }) || [];

  const handleViewDetail = (orderId: number) => {
    // TODO: Navigate to order detail page or open modal
    console.log('View order detail:', orderId);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar navigationItems={NAV_ITEMS} />

      <main className="flex-grow">
        <section className="container mx-auto px-4 py-10">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">주문 내역</h1>
            <p className="mt-2 text-[var(--color-text)]/70">
              지금까지의 주문 내역을 확인하세요
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="tabs tabs-boxed mb-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`tab ${statusFilter === 'all' ? 'tab-active' : ''}`}
            >
              전체
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('pending')}
              className={`tab ${statusFilter === 'pending' ? 'tab-active' : ''}`}
            >
              대기중
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('confirmed')}
              className={`tab ${statusFilter === 'confirmed' ? 'tab-active' : ''}`}
            >
              확인됨
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('shipping')}
              className={`tab ${statusFilter === 'shipping' ? 'tab-active' : ''}`}
            >
              배송중
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('delivered')}
              className={`tab ${statusFilter === 'delivered' ? 'tab-active' : ''}`}
            >
              배송완료
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('cancelled')}
              className={`tab ${statusFilter === 'cancelled' ? 'tab-active' : ''}`}
            >
              취소됨
            </button>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : error ? (
            /* Error State */
            <div className="flex flex-col items-center justify-center py-20">
              <ErrorAlert
                title="주문 내역을 불러올 수 없습니다"
                message={
                  error instanceof Error
                    ? error.message
                    : '알 수 없는 오류가 발생했습니다.'
                }
              />
              <button
                type="button"
                onClick={() => {
                  void refetch();
                }}
                className="btn btn-primary mt-6"
              >
                다시 시도
              </button>
            </div>
          ) : filteredOrders.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center rounded-xl bg-[var(--color-secondary)] py-20 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-24 w-24 text-[var(--color-text)]/30 mb-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <h2 className="text-2xl font-bold mb-3">
                {statusFilter === 'all'
                  ? '주문 내역이 없습니다'
                  : '해당 상태의 주문이 없습니다'}
              </h2>
              <p className="text-[var(--color-text)]/70 mb-6 max-w-md">
                {statusFilter === 'all' ? (
                  <>
                    아직 주문하신 상품이 없습니다.
                    <br />
                    마음에 드는 상품을 찾아보세요!
                  </>
                ) : (
                  <>
                    다른 상태의 주문을 확인하시려면
                    <br />
                    위의 필터를 변경해주세요.
                  </>
                )}
              </p>
              {statusFilter === 'all' ? (
                <Link to="/products" className="btn btn-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  상품 둘러보기
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className="btn btn-primary btn-outline"
                >
                  전체 주문 보기
                </button>
              )}
            </div>
          ) : (
            /* Orders Grid */
            <>
              {/* Order Count */}
              <div className="mb-6">
                <p className="text-[var(--color-text)]/70">
                  {statusFilter === 'all' ? '전체' : ''}{' '}
                  <span className="font-semibold text-primary">
                    {filteredOrders.length}
                  </span>
                  개의 주문
                </p>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onViewDetail={handleViewDetail}
                  />
                ))}
              </div>

              {/* Continue Shopping */}
              <div className="mt-10 flex justify-center">
                <Link to="/products" className="btn btn-outline btn-primary">
                  계속 쇼핑하기
                </Link>
              </div>
            </>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
