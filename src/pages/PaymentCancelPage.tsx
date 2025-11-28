import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Navbar, Footer, Button } from '@/components';
import { NAV_ITEMS } from '@/constants/navigation';
import { PaymentCancelCallbackSchema } from '@/schemas/payment';
import { XCircle, RotateCcw, Home } from 'lucide-react';

/**
 * PaymentCancelPage
 * Handles Kakao Pay cancellation callback
 *
 * Flow:
 * 1. Kakao Pay redirects to /payment/cancel?order_id=123
 * 2. Parse and validate query parameters
 * 3. Display cancellation message with order number
 * 4. Provide "다시 결제하기" button to retry payment
 */
export default function PaymentCancelPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState<number | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  // Parse callback parameters on mount
  useEffect(() => {
    try {
      const rawParams = {
        order_id: searchParams.get('order_id'),
      };

      // Validate with Zod schema
      const params = PaymentCancelCallbackSchema.parse(rawParams);
      setOrderId(params.order_id);
    } catch (error) {
      console.error('Invalid cancel callback parameters:', error);
      setParseError('결제 취소 정보를 불러올 수 없습니다.');
    }
  }, [searchParams]);

  // Retry payment - navigate back to payment page
  const handleRetry = () => {
    if (orderId) {
      void navigate(`/payment/${orderId}`);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-primary)]">
      <Navbar navigationItems={NAV_ITEMS} />

      <main className="flex flex-1 items-center justify-center p-4 py-12">
        <div className="w-full max-w-md space-y-6 animate-fade-in">
          {/* Cancellation Icon & Message */}
          <div className="text-center space-y-3">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-warning/10 border-2 border-warning/30">
              <XCircle className="h-12 w-12 text-warning" />
            </div>
            <h1 className="text-4xl font-bold text-[var(--color-text)]">
              결제 취소
            </h1>
            <p className="text-lg text-[var(--color-text)]/70">
              사용자가 결제를 취소하셨습니다
            </p>
          </div>

          {/* Order Info Card */}
          {orderId && (
            <div className="rounded-3xl border-2 border-warning/20 bg-gradient-to-br from-warning/5 to-transparent p-6 shadow-lg">
              <div className="text-center">
                <p className="text-sm text-[var(--color-text)]/60 mb-1">주문번호</p>
                <p className="text-3xl font-bold text-[var(--color-text)]">
                  #{orderId}
                </p>
              </div>
            </div>
          )}

          {/* Error Display */}
          {parseError && (
            <div className="alert bg-error/10 border-2 border-error/30 animate-shake">
              <XCircle className="h-5 w-5 text-error" />
              <span className="text-[var(--color-text)]">{parseError}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            {orderId && (
              <Button
                onClick={handleRetry}
                className="btn-lg w-full bg-[var(--color-gold)] hover:bg-[var(--color-gold)]/80 text-[var(--color-primary)] border-[var(--color-gold)]"
              >
                <RotateCcw className="h-5 w-5" />
                다시 결제하기
              </Button>
            )}
            <Button
              onClick={() => void navigate('/orders')}
              variant="outline"
              className="btn-lg w-full border-[var(--color-text)]/20 hover:bg-[var(--color-secondary)]"
            >
              주문 내역 확인
            </Button>
            <Button
              onClick={() => void navigate('/')}
              variant="ghost"
              className="btn-lg w-full hover:bg-[var(--color-secondary)]"
            >
              <Home className="h-5 w-5" />
              홈으로 가기
            </Button>
          </div>

          {/* Info Message */}
          <div className="rounded-3xl bg-[var(--color-secondary)] border border-[var(--color-text)]/10 p-5 text-center">
            <p className="text-base text-[var(--color-text)]/80">결제를 취소하셔도 주문은 유지됩니다.</p>
            <p className="mt-2 text-sm text-[var(--color-text)]/60">언제든지 다시 결제를 진행하실 수 있습니다.</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
