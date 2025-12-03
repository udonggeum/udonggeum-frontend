import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Navbar,
  Footer,
  Button,
  LoadingSpinner,
  ErrorAlert,
} from '@/components';
import { NAVIGATION_ITEMS } from '@/constants/navigation';
import { useOrderDetail } from '@/hooks/queries/useOrdersQueries';
import {
  useInitiateKakaoPay,
  usePaymentStatus,
} from '@/hooks/queries/usePaymentQueries';
import { CreditCard, AlertTriangle, CheckCircle2 } from 'lucide-react';

/**
 * PaymentPage
 * Initiates Kakao Pay payment for an order
 *
 * Flow:
 * 1. Load order details
 * 2. Check payment status (prevent duplicate payments)
 * 3. Display order summary with "결제하기" button
 * 4. On click: Call /ready endpoint
 * 5. Redirect to Kakao Pay (PC or mobile URL based on device)
 */
export default function PaymentPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const orderIdNum = orderId ? parseInt(orderId, 10) : 0;

  // Fetch order details
  const {
    data: orderResponse,
    isLoading: isLoadingOrder,
    error: orderError,
  } = useOrderDetail(orderIdNum, {
    enabled: orderIdNum > 0,
  });

  // Fetch payment status
  const {
    data: paymentStatus,
    isLoading: isLoadingPayment,
    error: paymentError,
  } = usePaymentStatus(orderIdNum, {
    enabled: orderIdNum > 0,
  });

  // Initiate payment mutation
  const {
    mutate: initiatePayment,
    isPending: isInitiatingPayment,
    error: initiateError,
  } = useInitiateKakaoPay();

  const order = orderResponse;
  const payment = paymentStatus?.data;

  // Duplicate payment prevention (US5)
  // Redirect if payment already completed
  useEffect(() => {
    if (payment?.payment_status === 'completed') {
      // Payment already completed, redirect to order history
      void navigate('/orders', { replace: true });
    }
  }, [payment?.payment_status, navigate]);

  // Handle payment button click
  const handlePayment = () => {
    if (!orderIdNum) return;

    initiatePayment(
      { order_id: orderIdNum },
      {
        onSuccess: (data) => {
          // Detect device type for appropriate redirect URL
          const isMobile = /Mobile|Android|iPhone/i.test(navigator.userAgent);
          const redirectUrl = isMobile
            ? data.data.next_redirect_mobile_url
            : data.data.next_redirect_pc_url;

          // Redirect to Kakao Pay
          window.location.href = redirectUrl;
        },
      }
    );
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return `₩${amount.toLocaleString('ko-KR')}`;
  };

  // Loading state
  if (isLoadingOrder || isLoadingPayment) {
    return (
      <div className="flex min-h-screen flex-col bg-base-100">
        <Navbar navigationItems={NAVIGATION_ITEMS} />
        <main className="flex flex-1 items-center justify-center">
          <LoadingSpinner />
        </main>
        <Footer />
      </div>
    );
  }

  // Error state
  if (orderError || paymentError || !order) {
    return (
      <div className="flex min-h-screen flex-col bg-base-100">
        <Navbar navigationItems={NAVIGATION_ITEMS} />
        <main className="flex flex-1 items-center justify-center p-4">
          <div className="w-full max-w-md">
            <ErrorAlert
              message={
                orderError?.message ||
                paymentError?.message ||
                '주문 정보를 불러올 수 없습니다.'
              }
            />
            <div className="mt-4 text-center">
              <Button onClick={() => void navigate('/orders')}>
                주문 내역으로 이동
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Payment status display
  const getPaymentStatusBadge = () => {
    switch (payment?.payment_status) {
      case 'pending':
        return (
          <div className="flex items-center gap-2 rounded-full bg-warning/10 px-3 py-1 text-sm font-medium text-warning">
            <AlertTriangle className="h-4 w-4" />
            결제 대기
          </div>
        );
      case 'completed':
        return (
          <div className="flex items-center gap-2 rounded-full bg-success/10 px-3 py-1 text-sm font-medium text-success">
            <CheckCircle2 className="h-4 w-4" />
            결제 완료
          </div>
        );
      case 'failed':
        return (
          <div className="flex items-center gap-2 rounded-full bg-error/10 px-3 py-1 text-sm font-medium text-error">
            <AlertTriangle className="h-4 w-4" />
            결제 실패
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-base-100">
      <Navbar navigationItems={NAVIGATION_ITEMS} />

      <main className="flex flex-1 items-center justify-center p-4 py-12">
        <div className="w-full max-w-2xl space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-base-content">
              결제하기
            </h1>
            <p className="mt-2 text-base-content/60">
              카카오페이로 안전하게 결제하세요
            </p>
          </div>

          {/* Order Summary Card */}
          <div className="rounded-3xl border border-base-200 bg-base-50 p-6 shadow-lg">
            {/* Order Header */}
            <div className="mb-4 flex items-center justify-between border-b border-base-200 pb-4">
              <div>
                <p className="text-sm text-base-content/60">주문번호</p>
                <p className="text-lg font-semibold text-base-content">
                  #{order.id}
                </p>
              </div>
              {getPaymentStatusBadge()}
            </div>

            {/* Order Items Summary */}
            <div className="space-y-3">
              <div className="flex justify-between text-base-content">
                <span>주문 상품</span>
                <span className="font-medium">
                  {order.order_items.length}개
                </span>
              </div>

              {/* Items List (compact) */}
              <div className="space-y-2 rounded-2xl bg-base-100 p-4">
                {order.order_items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between text-sm text-base-content/80"
                  >
                    <span>{item.product_id}</span>
                    <span>
                      {item.quantity}개 × {formatCurrency(item.price)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Fulfillment Type */}
              <div className="flex justify-between text-base-content">
                <span>배송 방법</span>
                <span className="font-medium">
                  {order.fulfillment_type === 'delivery'
                    ? '배송'
                    : '매장 픽업'}
                </span>
              </div>

              {order.fulfillment_type === 'delivery' &&
                order.shipping_address && (
                  <div className="rounded-2xl bg-base-100 p-3 text-sm text-base-content/70">
                    <p className="font-medium text-base-content">배송지</p>
                    <p className="mt-1">{order.shipping_address}</p>
                  </div>
                )}

              {/* Total Amount */}
              <div className="mt-4 flex justify-between border-t border-base-200 pt-4 text-xl font-bold text-base-content">
                <span>총 결제 금액</span>
                <span className="text-primary">
                  {formatCurrency(order.total_amount)}
                </span>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {initiateError && (
            <ErrorAlert message={initiateError.message} />
          )}

          {/* Payment Button */}
          <Button
            onClick={handlePayment}
            disabled={
              isInitiatingPayment ||
              payment?.payment_status === 'completed'
            }
            className="btn-primary btn-lg w-full"
          >
            {isInitiatingPayment ? (
              <>
                <LoadingSpinner size="sm" />
                결제 준비 중...
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5" />
                카카오페이로 결제하기
              </>
            )}
          </Button>

          {/* Info Alert */}
          <div className="alert alert-info">
            <AlertTriangle className="h-5 w-5" />
            <div className="text-sm">
              <p className="font-medium">결제 안내</p>
              <ul className="mt-1 list-inside list-disc space-y-1 text-xs">
                <li>카카오페이 앱에서 결제를 진행해주세요</li>
                <li>결제 중 창을 닫지 마세요</li>
                <li>결제 완료 후 주문 내역에서 확인 가능합니다</li>
              </ul>
            </div>
          </div>

          {/* Back Button */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => void navigate('/orders')}
              className="btn btn-ghost btn-sm"
              disabled={isInitiatingPayment}
            >
              주문 내역으로 돌아가기
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
