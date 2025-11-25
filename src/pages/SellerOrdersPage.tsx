/**
 * SellerOrdersPage Component
 * Manages seller's orders and allows status updates
 */

import { useState } from 'react';
import { ShoppingBag, Package } from 'lucide-react';
import { useSellerStores, useStoreOrders, useUpdateOrderStatus } from '@/hooks/queries';
import { LoadingSpinner, ErrorAlert, OrderStatusBadge, PaymentStatusBadge, Button } from '@/components';
import type { Order } from '@/schemas';
import type { UpdateOrderStatusRequest } from '@/schemas/seller';

export default function SellerOrdersPage() {
  const [selectedStoreId, setSelectedStoreId] = useState<number | undefined>();
  const { data: stores, isLoading: isLoadingStores } = useSellerStores();
  const { data: orders, isLoading, isError, error } = useStoreOrders(selectedStoreId);
  const { mutate: updateOrderStatus, isPending: isUpdating } = useUpdateOrderStatus();

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');

  const openStatusModal = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status || 'pending');
  };

  const closeStatusModal = () => {
    setSelectedOrder(null);
    setNewStatus('');
  };

  const handleUpdateStatus = () => {
    if (!selectedOrder || !newStatus) return;

    const updateData: UpdateOrderStatusRequest = {
      status: newStatus as 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled',
    };

    updateOrderStatus(
      { id: selectedOrder.id, data: updateData },
      {
        onSuccess: () => {
          closeStatusModal();
        },
      }
    );
  };

  if (isLoadingStores) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-text)] flex items-center gap-3">
          <ShoppingBag className="w-8 h-8" aria-hidden="true" />
          주문 관리
        </h1>
        <p className="text-[var(--color-text)]/70 mt-2">
          들어온 주문을 확인하고 상태를 업데이트하세요
        </p>
      </div>

      {/* Store Selection */}
      {!stores || stores.length === 0 ? (
        <div className="alert alert-warning mb-8">
          <span>먼저 가게를 추가해주세요. 가게가 있어야 주문을 확인할 수 있습니다.</span>
        </div>
      ) : (
        <div className="mb-8">
          <label htmlFor="store-select-orders" className="label">
            <span className="label-text font-semibold">가게 선택</span>
          </label>
          <select
            id="store-select-orders"
            value={selectedStoreId || ''}
            onChange={(e) => setSelectedStoreId(Number(e.target.value) || undefined)}
            className="select select-bordered bg-[var(--color-primary)] text-[var(--color-text)] border-[var(--color-text)]/20 w-full max-w-xs"
          >
            <option value="">가게를 선택하세요</option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Loading/Error States */}
      {isLoading && selectedStoreId && (
        <div className="flex justify-center items-center min-h-[200px]">
          <LoadingSpinner />
        </div>
      )}

      {isError && selectedStoreId && (
        <ErrorAlert error={error} message="주문 목록을 불러오는 중 오류가 발생했습니다" />
      )}

      {/* Orders List */}
      {selectedStoreId && !isLoading && !isError && (!orders || orders.length === 0) ? (
        <div className="card bg-[var(--color-primary)] shadow-md">
          <div className="card-body text-center">
            <ShoppingBag className="w-16 h-16 mx-auto text-[var(--color-text)]/30 mb-4" />
            <p className="text-lg font-semibold">주문이 없습니다</p>
            <p className="text-[var(--color-text)]/70">
              새로운 주문이 들어오면 여기에 표시됩니다
            </p>
          </div>
        </div>
      ) : selectedStoreId && orders && orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="card bg-[var(--color-primary)] shadow-md">
              <div className="card-body">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Order Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-lg font-semibold">주문 #{order.id}</h2>
                      <OrderStatusBadge status={order.status || 'pending'} />
                      <PaymentStatusBadge status={order.payment_status || 'pending'} />
                    </div>

                    <div className="text-sm text-[var(--color-text)]/70 space-y-1">
                      <p>
                        <span className="font-semibold">주문일:</span>{' '}
                        {new Date(order.created_at).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <p>
                        <span className="font-semibold">총 금액:</span>{' '}
                        ₩{order.total_amount.toLocaleString()}
                      </p>
                      {order.shipping_address && (
                        <p>
                          <span className="font-semibold">배송지:</span>{' '}
                          {order.shipping_address}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div>
                    <Button onClick={() => openStatusModal(order)}
                      variant="primary"
                      size="sm"
                      disabled={isUpdating}
                    >
                      상태 변경
                    </Button>
                  </div>
                </div>

                {/* Order Items */}
                {order.order_items && order.order_items.length > 0 && (
                  <div className="mt-4 border-t pt-4">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      주문 상품
                    </h3>
                    <div className="space-y-2">
                      {order.order_items.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center text-sm"
                        >
                          <span>
                            상품 #{item.product_id} x {item.quantity}
                          </span>
                          <span className="font-semibold">
                            ₩{(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* Status Update Modal */}
      {selectedOrder && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">
              주문 상태 변경 (주문 #{selectedOrder.id})
            </h3>

            <div className="form-control w-full mb-6">
              <label htmlFor="status" className="label">
                <span className="label-text">새로운 상태</span>
              </label>
              <select
                id="status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="select select-bordered bg-[var(--color-primary)] text-[var(--color-text)] border-[var(--color-text)]/20 w-full"
              >
                <option value="pending">대기 중</option>
                <option value="confirmed">확인됨</option>
                <option value="shipping">배송 중</option>
                <option value="delivered">배송 완료</option>
                <option value="cancelled">취소됨</option>
              </select>
            </div>

            <div className="modal-action">
              <Button onClick={closeStatusModal}
                variant="ghost"
                disabled={isUpdating}
              >
                취소
              </Button>
              <Button onClick={handleUpdateStatus}
                variant="primary"
                disabled={isUpdating || newStatus === selectedOrder.status}
              >
                {isUpdating ? '변경 중...' : '변경'}
              </Button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={closeStatusModal}></div>
        </div>
      )}
    </div>
  );
}
