import { OrderStatusBadge, PaymentStatusBadge } from './OrderStatusBadge';
import FallbackImage from './FallbackImage';

interface OrderItem {
  id: number;
  product_id: number;
  product_option_id?: number;
  store_id: number;
  quantity: number;
  price: number;
  option_snapshot: string;
  product?: {
    id: number;
    name: string;
    image_url?: string;
  };
  store?: {
    id: number;
    name: string;
  };
}

interface Order {
  id: number;
  user_id: number;
  total_amount: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  fulfillment_type: 'delivery' | 'pickup';
  shipping_address?: string;
  pickup_store_id?: number;
  order_items: OrderItem[];
  created_at: string;
  updated_at: string;
}

interface OrderCardProps {
  order: Order;
  onViewDetail?: (orderId: number) => void;
}

/**
 * OrderCard Component
 *
 * Displays a summary of an order with status badges and basic info.
 * Click to view full order details.
 */
export default function OrderCard({ order, onViewDetail }: OrderCardProps) {
  const orderDate = new Date(order.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const totalItems = order.order_items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  // Get first product image for preview
  const firstProduct = order.order_items[0]?.product;

  return (
    <div className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow">
      <div className="card-body">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-bold text-lg">주문번호 #{order.id}</h3>
            <p className="text-sm text-base-content/60">{orderDate}</p>
          </div>
          <div className="flex flex-col gap-1 items-end">
            <OrderStatusBadge status={order.status} />
            <PaymentStatusBadge status={order.payment_status} />
          </div>
        </div>

        {/* Product Preview */}
        {firstProduct && (
          <div className="flex gap-3 mb-3">
            <div className="w-16 h-16 flex-shrink-0">
              <FallbackImage
                src={firstProduct.image_url || ''}
                alt={firstProduct.name}
                className="w-full h-full object-cover rounded"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{firstProduct.name}</p>
              {order.order_items.length > 1 && (
                <p className="text-sm text-base-content/60">
                  외 {order.order_items.length - 1}개 상품
                </p>
              )}
            </div>
          </div>
        )}

        <div className="divider my-2"></div>

        {/* Order Info */}
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-base-content/70">총 상품 수</span>
            <span className="font-semibold">{totalItems}개</span>
          </div>
          <div className="flex justify-between">
            <span className="text-base-content/70">배송 방법</span>
            <span className="font-semibold">
              {order.fulfillment_type === 'delivery' ? '배송' : '픽업'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-base-content/70">총 결제 금액</span>
            <span className="font-bold text-lg text-primary">
              ₩{order.total_amount.toLocaleString('ko-KR')}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="card-actions justify-end mt-4">
          <button
            type="button"
            onClick={() => onViewDetail?.(order.id)}
            className="btn btn-sm btn-primary btn-outline"
          >
            상세 보기
          </button>
        </div>
      </div>
    </div>
  );
}
