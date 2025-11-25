import { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Package, MapPin, Calendar, CreditCard } from 'lucide-react';
import {
  Navbar,
  Footer,
  OrderCard,
  LoadingSpinner,
  ErrorAlert,
  OrderStatusBadge,
  PaymentStatusBadge,
} from '@/components';
import { useOrders } from '@/hooks/queries';
import { NAV_ITEMS } from '@/constants/navigation';
import type { Order } from '@/schemas/orders';
import FallbackImage from '@/components/FallbackImage';

type StatusFilter = 'all' | 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';

/**
 * OrderHistoryPage Component
 *
 * Displays user's order history with filtering options.
 * Features:
 * - Filter by order status
 * - Empty state with call-to-action
 * - Order detail modal
 * - Date sorting (newest first)
 */
export default function OrderHistoryPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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
    const order = ordersData?.orders.find((o) => o.id === orderId);
    if (order) {
      setSelectedOrder(order);
    }
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
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

      {/* Order Detail Modal */}
      {selectedOrder && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-3xl bg-[var(--color-secondary)] border border-[var(--color-text)]/10">
            {/* Modal Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-[var(--color-text)]">
                  주문 상세 정보
                </h3>
                <p className="text-sm text-[var(--color-text)]/60 mt-1">
                  주문번호 #{selectedOrder.id}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="btn btn-sm btn-circle btn-ghost"
                aria-label="모달 닫기"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Order Status */}
            <div className="flex flex-wrap gap-2 mb-6 p-4 bg-[var(--color-primary)] rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--color-text)]/70">주문 상태:</span>
                <OrderStatusBadge status={selectedOrder.status || 'pending'} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--color-text)]/70">결제 상태:</span>
                <PaymentStatusBadge status={selectedOrder.payment_status || 'pending'} />
              </div>
            </div>

            {/* Order Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="flex items-start gap-3 p-4 bg-[var(--color-primary)] rounded-lg">
                <Calendar className="h-5 w-5 text-[var(--color-gold)] mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-[var(--color-text)]/60 mb-1">주문 일시</p>
                  <p className="text-sm font-semibold text-[var(--color-text)]">
                    {new Date(selectedOrder.created_at).toLocaleString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-[var(--color-primary)] rounded-lg">
                <Package className="h-5 w-5 text-[var(--color-gold)] mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-[var(--color-text)]/60 mb-1">배송 방법</p>
                  <p className="text-sm font-semibold text-[var(--color-text)]">
                    {selectedOrder.fulfillment_type === 'delivery' ? '배송' : '픽업'}
                  </p>
                </div>
              </div>

              {selectedOrder.shipping_address && (
                <div className="flex items-start gap-3 p-4 bg-[var(--color-primary)] rounded-lg sm:col-span-2">
                  <MapPin className="h-5 w-5 text-[var(--color-gold)] mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-[var(--color-text)]/60 mb-1">배송지 주소</p>
                    <p className="text-sm font-semibold text-[var(--color-text)]">
                      {selectedOrder.shipping_address}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-[var(--color-text)] mb-3">
                주문 상품
              </h4>
              <div className="space-y-3">
                {selectedOrder.order_items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 bg-[var(--color-primary)] rounded-lg"
                  >
                    <div className="w-20 h-20 flex-shrink-0">
                      <FallbackImage
                        src={item.product?.image_url || ''}
                        alt={item.product?.name || '상품'}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[var(--color-text)] mb-1">
                        {item.product?.name || '상품명 없음'}
                      </p>
                      {item.option_snapshot && (
                        <p className="text-xs text-[var(--color-text)]/60 mb-2">
                          옵션: {item.option_snapshot}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-[var(--color-text)]/70">
                          수량: {item.quantity}개
                        </p>
                        <p className="text-sm font-bold text-[var(--color-gold)]">
                          ₩{item.price.toLocaleString('ko-KR')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Amount */}
            <div className="border-t border-[var(--color-text)]/10 pt-4">
              <div className="flex items-center justify-between p-4 bg-[var(--color-gold)]/10 rounded-lg">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-[var(--color-gold)]" />
                  <span className="text-lg font-semibold text-[var(--color-text)]">
                    총 결제 금액
                  </span>
                </div>
                <span className="text-2xl font-bold text-[var(--color-gold)]">
                  ₩{selectedOrder.total_amount.toLocaleString('ko-KR')}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="modal-action">
              {selectedOrder.payment_status === 'pending' && selectedOrder.status !== 'cancelled' && (
                <button
                  type="button"
                  onClick={() => {
                    // TODO: Implement payment flow
                    console.log('결제하기 clicked for order:', selectedOrder.id);
                  }}
                  className="btn bg-[var(--color-gold)] hover:bg-[var(--color-gold)]/80 text-[var(--color-primary)] border-[var(--color-gold)] gap-2"
                >
                  <CreditCard className="h-5 w-5" />
                  결제하기
                </button>
              )}
              <button
                type="button"
                onClick={handleCloseModal}
                className="btn btn-outline border-[var(--color-text)]/30 text-[var(--color-text)] hover:bg-[var(--color-secondary)]"
              >
                닫기
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button
              type="button"
              aria-label="모달 닫기"
              onClick={handleCloseModal}
            >
              닫기
            </button>
          </form>
        </dialog>
      )}
    </div>
  );
}
