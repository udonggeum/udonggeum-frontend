/**
 * Order status badge component
 * Displays order status with appropriate color and label
 */

type OrderStatus = 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';
type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  className?: string;
}

const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  pending: { label: '대기중', className: 'badge-warning' },
  confirmed: { label: '확인됨', className: 'badge-info' },
  shipping: { label: '배송중', className: 'badge-primary' },
  delivered: { label: '배송완료', className: 'badge-success' },
  cancelled: { label: '취소됨', className: 'badge-error' },
};

const PAYMENT_STATUS_CONFIG: Record<
  PaymentStatus,
  { label: string; className: string }
> = {
  pending: { label: '결제대기', className: 'badge-warning' },
  completed: { label: '결제완료', className: 'badge-success' },
  failed: { label: '결제실패', className: 'badge-error' },
  refunded: { label: '환불완료', className: 'badge-secondary' },
};

export function OrderStatusBadge({ status, className = '' }: OrderStatusBadgeProps) {
  const config = ORDER_STATUS_CONFIG[status] || ORDER_STATUS_CONFIG.pending;

  return (
    <span className={`badge ${config.className} ${className}`}>
      {config.label}
    </span>
  );
}

export function PaymentStatusBadge({ status, className = '' }: PaymentStatusBadgeProps) {
  const config = PAYMENT_STATUS_CONFIG[status] || PAYMENT_STATUS_CONFIG.pending;

  return (
    <span className={`badge ${config.className} ${className}`}>
      {config.label}
    </span>
  );
}
