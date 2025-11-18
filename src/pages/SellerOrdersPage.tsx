/**
 * SellerOrdersPage Component
 * Manages seller's orders and allows status updates
 */

import { useState } from 'react';
import { ShoppingBag, Package } from 'lucide-react';
import { useSellerOrders, useUpdateOrderStatus } from '@/hooks/queries';
import { LoadingSpinner, ErrorAlert, OrderStatusBadge, PaymentStatusBadge } from '@/components';
import type { Order } from '@/schemas';
import type { UpdateOrderStatusRequest } from '@/schemas/seller';

export default function SellerOrdersPage() {
  const { data: orders, isLoading, isError, error } = useSellerOrders();
  const { mutate: updateOrderStatus, isPending: isUpdating } = useUpdateOrderStatus();

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');

  const openStatusModal = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorAlert error={error} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <ShoppingBag className="w-8 h-8" aria-hidden="true" />
          주문 관리
        </h1>
        <p className="text-base-content/70 mt-2">
          들어온 주문을 확인하고 상태를 업데이트하세요
        </p>
      </div>

      {/* Orders List */}
      {!orders || orders.length === 0 ? (
        <div className="card bg-base-100 shadow-md">
          <div className="card-body text-center">
            <ShoppingBag className="w-16 h-16 mx-auto text-base-content/30 mb-4" />
            <p className="text-lg font-semibold">주문이 없습니다</p>
            <p className="text-base-content/70">
              새로운 주문이 들어오면 여기에 표시됩니다
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="card bg-base-100 shadow-md">
              <div className="card-body">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Order Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-lg font-semibold">주문 #{order.id}</h2>
                      <OrderStatusBadge status={order.status} />
                      <PaymentStatusBadge status={order.payment_status} />
                    </div>

                    <div className="text-sm text-base-content/70 space-y-1">
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
                    <button
                      type="button"
                      onClick={() => openStatusModal(order)}
                      className="btn btn-primary btn-sm"
                      disabled={isUpdating}
                    >
                      상태 변경
                    </button>
                  </div>
                </div>

                {/* Order Items */}
                {order.items && order.items.length > 0 && (
                  <div className="mt-4 border-t pt-4">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      주문 상품
                    </h3>
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center text-sm"
                        >
                          <span>
                            {item.product_name} x {item.quantity}
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
      )}

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
                className="select select-bordered w-full"
              >
                <option value="pending">대기 중</option>
                <option value="confirmed">확인됨</option>
                <option value="shipping">배송 중</option>
                <option value="delivered">배송 완료</option>
                <option value="cancelled">취소됨</option>
              </select>
            </div>

            <div className="modal-action">
              <button
                type="button"
                onClick={closeStatusModal}
                className="btn btn-ghost"
                disabled={isUpdating}
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleUpdateStatus}
                className="btn btn-primary"
                disabled={isUpdating || newStatus === selectedOrder.status}
              >
                {isUpdating ? '변경 중...' : '변경'}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={closeStatusModal}></div>
        </div>
      )}
    </div>
  );
}
