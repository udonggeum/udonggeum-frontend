/**
 * SellerOrdersPage Component
 * Manages seller's orders and allows status updates
 */

import { useState, useEffect } from 'react';
import { ShoppingBag, Package } from 'lucide-react';
import { useQueries } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { useSellerStores, useUpdateOrderStatus, sellerKeys } from '@/hooks/queries';
import { sellerService } from '@/services/seller';
import { useAuthStore } from '@/stores/useAuthStore';
import { LoadingSpinner, ErrorAlert, OrderStatusBadge, PaymentStatusBadge, Button, Card, CardBody, Select } from '@/components';
import type { Order } from '@/schemas';
import type { UpdateOrderStatusRequest } from '@/schemas/seller';

export default function SellerOrdersPage() {
  const [searchParams] = useSearchParams();
  const statusParam = searchParams.get('status') || 'all';

  const [selectedStoreId, setSelectedStoreId] = useState<number | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>(statusParam);

  // Update status when URL parameter changes
  useEffect(() => {
    setSelectedStatus(statusParam);
  }, [statusParam]);
  const { data: stores, isLoading: isLoadingStores } = useSellerStores();
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'admin';

  // Fetch orders for all stores to enable "all" filter using useQueries
  const storeIds = stores?.map((store) => store.id) || [];
  const orderQueries = useQueries({
    queries: storeIds.map((storeId) => ({
      queryKey: [...sellerKeys.orders(), storeId] as const,
      queryFn: () => sellerService.getStoreOrders(storeId),
      enabled: isAdmin,
      staleTime: 1000 * 60, // 1 minute
    })),
  });

  // Get orders from selected store or all stores
  const allOrders = orderQueries.flatMap((query) => query.data || []);
  const filteredByStore =
    selectedStoreId === 'all'
      ? allOrders
      : allOrders.filter((o) =>
          o.order_items?.some((item) => item.store_id === selectedStoreId)
        );

  // Apply status filter
  const orders =
    selectedStatus === 'all'
      ? filteredByStore
      : filteredByStore.filter((o) => o.status === selectedStatus);

  const isLoading = orderQueries.some((q) => q.isLoading);
  const isError = orderQueries.some((q) => q.isError);
  const error = orderQueries.find((q) => q.error)?.error;

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
        {selectedStatus !== 'all' && (
          <div className="mt-4">
            <span className={`badge badge-lg ${
              selectedStatus === 'pending' ? 'bg-amber-100 text-amber-700 border-amber-200' :
              selectedStatus === 'confirmed' ? 'bg-cyan-100 text-cyan-700 border-cyan-200' :
              selectedStatus === 'shipping' ? 'bg-indigo-100 text-indigo-700 border-indigo-200' :
              selectedStatus === 'delivered' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
              selectedStatus === 'cancelled' ? 'bg-rose-100 text-rose-700 border-rose-200' :
              'badge-primary'
            }`}>
              필터: {
                selectedStatus === 'pending' ? '대기 중' :
                selectedStatus === 'confirmed' ? '확인됨' :
                selectedStatus === 'shipping' ? '배송 중' :
                selectedStatus === 'delivered' ? '배송 완료' :
                selectedStatus === 'cancelled' ? '취소됨' : selectedStatus
              }
            </span>
          </div>
        )}
      </div>

      {/* Filters */}
      {!stores || stores.length === 0 ? (
        <div className="alert alert-warning mb-8">
          <span>먼저 가게를 추가해주세요. 가게가 있어야 주문을 확인할 수 있습니다.</span>
        </div>
      ) : (
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Store Filter */}
          <Select
            id="store-select-orders"
            label="가게 필터"
            value={selectedStoreId}
            onChange={(e) =>
              setSelectedStoreId(
                e.target.value === 'all' ? 'all' : Number(e.target.value)
              )
            }
          >
            <option value="all">전체</option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </Select>

          {/* Status Filter */}
          <Select
            id="status-select"
            label="주문 상태 필터"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">전체</option>
            <option value="pending">대기 중</option>
            <option value="confirmed">확인됨</option>
            <option value="shipping">배송 중</option>
            <option value="delivered">배송 완료</option>
            <option value="cancelled">취소됨</option>
          </Select>
        </div>
      )}

      {/* Loading/Error States */}
      {isLoading && (
        <div className="flex justify-center items-center min-h-[200px]">
          <LoadingSpinner />
        </div>
      )}

      {isError && (
        <ErrorAlert error={error ?? undefined} message="주문 목록을 불러오는 중 오류가 발생했습니다" />
      )}

      {/* Orders List */}
      {!isLoading && !isError && (!orders || orders.length === 0) ? (
        <Card>
          <CardBody className="text-center">
            <ShoppingBag className="w-16 h-16 mx-auto text-[var(--color-text)]/30 mb-4" />
            <p className="text-lg font-semibold">주문이 없습니다</p>
            <p className="text-[var(--color-text)]/70">
              새로운 주문이 들어오면 여기에 표시됩니다
            </p>
          </CardBody>
        </Card>
      ) : orders && orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardBody>
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
              </CardBody>
            </Card>
          ))}
        </div>
      ) : null}

      {/* Status Update Modal */}
      {selectedOrder && (
        <div className="modal modal-open">
          <div className="modal-box bg-[var(--color-secondary)] border border-[var(--color-text)]/10">
            <h3 className="font-bold text-lg mb-4">
              주문 상태 변경 (주문 #{selectedOrder.id})
            </h3>

            <div className="mb-6">
              <Select
                id="status"
                label="새로운 상태"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <option value="pending">대기 중</option>
                <option value="confirmed">확인됨</option>
                <option value="shipping">배송 중</option>
                <option value="delivered">배송 완료</option>
                <option value="cancelled">취소됨</option>
              </Select>
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
