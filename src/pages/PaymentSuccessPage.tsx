import { useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Navbar,
  Footer,
  Button,
  LoadingSpinner,
  ErrorAlert,
} from '@/components';
import { NAVIGATION_ITEMS } from '@/constants/navigation';
import { usePaymentApproval } from '@/hooks/queries/usePaymentQueries';
import { PaymentSuccessCallbackSchema } from '@/schemas/payment';
import { CheckCircle2, Package, CreditCard, Clock } from 'lucide-react';

/**
 * PaymentSuccessPage
 * Handles Kakao Pay success callback
 *
 * Flow:
 * 1. Kakao Pay redirects to /payment/success?order_id=123&pg_token=abc
 * 2. Parse and validate query parameters
 * 3. Call backend /success endpoint (backend approves payment)
 * 4. Display payment confirmation with details
 * 5. Provide navigation to order history
 */
export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Parse and validate callback parameters
  const params = useMemo(() => {
    try {
      const rawParams = {
        order_id: searchParams.get('order_id'),
        pg_token: searchParams.get('pg_token'),
      };
      return PaymentSuccessCallbackSchema.parse(rawParams);
    } catch {
      console.error('Invalid callback parameters');
      return null;
    }
  }, [searchParams]);

  // Use query hook for payment approval
  // This works correctly with React Strict Mode (unlike useMutation in useEffect)
  const {
    data: approvalData,
    isLoading,
    error,
    isSuccess,
  } = usePaymentApproval(
    params?.order_id ?? null,
    params?.pg_token ?? null,
    { enabled: !!params }
  );

  // Format currency
  const formatCurrency = (amount: number) => {
    return `₩${amount.toLocaleString('ko-KR')}`;
  };

  // Format timestamp to Korean format
  const formatTimestamp = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get payment method display text
  const getPaymentMethodText = (method: 'CARD' | 'MONEY') => {
    return method === 'CARD' ? '카드 결제' : '카카오머니';
  };

  // Invalid params state
  if (!params) {
    return (
      <div className="flex min-h-screen flex-col bg-base-100">
        <Navbar navigationItems={NAVIGATION_ITEMS} />
        <main className="flex flex-1 items-center justify-center p-4">
          <div className="w-full max-w-md space-y-4">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-error/10">
                <CheckCircle2 className="h-8 w-8 text-error" />
              </div>
              <h1 className="mt-4 text-2xl font-bold text-base-content">
                잘못된 요청
              </h1>
            </div>
            <ErrorAlert message="결제 콜백 파라미터가 올바르지 않습니다." />
            <div className="flex gap-2">
              <Button
                onClick={() => void navigate('/orders')}
                className="flex-1"
              >
                주문 내역 확인
              </Button>
              <Button
                onClick={() => void navigate('/')}
                variant="outline"
                className="flex-1"
              >
                홈으로
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Loading state (processing approval)
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-base-100">
        <Navbar navigationItems={NAVIGATION_ITEMS} />
        <main className="flex flex-1 flex-col items-center justify-center p-4">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-lg font-medium text-base-content">
            결제를 처리하고 있습니다...
          </p>
          <p className="mt-2 text-sm text-base-content/60">
            잠시만 기다려주세요
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error || !isSuccess || !approvalData) {
    return (
      <div className="flex min-h-screen flex-col bg-base-100">
        <Navbar navigationItems={NAVIGATION_ITEMS} />
        <main className="flex flex-1 items-center justify-center p-4">
          <div className="w-full max-w-md space-y-4">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-error/10">
                <CheckCircle2 className="h-8 w-8 text-error" />
              </div>
              <h1 className="mt-4 text-2xl font-bold text-base-content">
                결제 처리 실패
              </h1>
            </div>
            <ErrorAlert
              message={error?.message || '결제 승인 처리 중 오류가 발생했습니다.'}
            />
            <div className="flex gap-2">
              <Button
                onClick={() => void navigate('/orders')}
                className="flex-1"
              >
                주문 내역 확인
              </Button>
              <Button
                onClick={() => void navigate('/')}
                variant="outline"
                className="flex-1"
              >
                홈으로
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Success state
  const { data } = approvalData;

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-primary)]">
      <Navbar navigationItems={NAVIGATION_ITEMS} />

      <main className="flex flex-1 items-center justify-center p-4 py-12">
        <div className="w-full max-w-2xl space-y-8 animate-fade-in">
          {/* Success Icon & Message */}
          <div className="text-center space-y-3">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-gold)]/20 to-success/10 border-2 border-[var(--color-gold)]">
              <CheckCircle2 className="h-12 w-12 text-[var(--color-gold)]" />
            </div>
            <h1 className="text-4xl font-bold text-[var(--color-text)]">
              결제 완료!
            </h1>
            <p className="text-lg text-[var(--color-text)]/70">
              주문이 성공적으로 결제되었습니다
            </p>
          </div>

          {/* Payment Details Card */}
          <div className="rounded-3xl border-2 border-[var(--color-gold)]/30 bg-gradient-to-br from-[var(--color-gold)]/5 to-transparent p-8 shadow-lg">
            {/* Order Number */}
            <div className="mb-6 border-b-2 border-[var(--color-gold)]/20 pb-4 text-center">
              <p className="text-sm text-[var(--color-text)]/60 mb-1">주문번호</p>
              <p className="text-3xl font-bold text-[var(--color-gold)]">
                #{data.order_id}
              </p>
            </div>

            {/* Payment Information */}
            <div className="space-y-4">
              {/* Total Amount */}
              <div className="flex items-center justify-between rounded-3xl bg-gradient-to-r from-[var(--color-gold)]/10 to-transparent border-2 border-[var(--color-gold)]/20 p-5">
                <span className="text-lg font-semibold text-[var(--color-text)]">결제 금액</span>
                <span className="text-3xl font-bold text-[var(--color-gold)]">
                  {formatCurrency(data.total_amount)}
                </span>
              </div>

              {/* Payment Method */}
              <div className="flex items-center gap-4 rounded-2xl bg-[var(--color-secondary)] p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-gold)]/10">
                  <CreditCard className="h-5 w-5 text-[var(--color-gold)]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-[var(--color-text)]/60">결제 수단</p>
                  <p className="font-semibold text-[var(--color-text)]">
                    {getPaymentMethodText(data.payment_method)}
                  </p>
                </div>
              </div>

              {/* Approval Time */}
              <div className="flex items-center gap-4 rounded-2xl bg-[var(--color-secondary)] p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-gold)]/10">
                  <Clock className="h-5 w-5 text-[var(--color-gold)]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-[var(--color-text)]/60">결제 시각</p>
                  <p className="font-semibold text-[var(--color-text)]">
                    {formatTimestamp(data.approved_at)}
                  </p>
                </div>
              </div>

              {/* Transaction IDs (collapsed) */}
              <details className="collapse collapse-arrow bg-[var(--color-secondary)] rounded-2xl border border-[var(--color-text)]/10">
                <summary className="collapse-title text-sm font-semibold text-[var(--color-text)]/70">
                  거래 정보 상세
                </summary>
                <div className="collapse-content space-y-3 pt-2">
                  <div>
                    <p className="text-xs text-[var(--color-text)]/60 mb-1">거래 고유번호 (TID)</p>
                    <p className="font-mono text-sm text-[var(--color-text)] bg-[var(--color-primary)] px-3 py-2 rounded-lg">
                      {data.tid}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-text)]/60 mb-1">승인 번호 (AID)</p>
                    <p className="font-mono text-sm text-[var(--color-text)] bg-[var(--color-primary)] px-3 py-2 rounded-lg">
                      {data.aid}
                    </p>
                  </div>
                </div>
              </details>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              onClick={() => void navigate('/orders')}
              className="bg-[var(--color-gold)] hover:bg-[var(--color-gold)]/80 text-[var(--color-primary)] border-[var(--color-gold)] flex-1 btn-lg"
            >
              <Package className="h-5 w-5" />
              주문 내역 보기
            </Button>
            <Button
              onClick={() => void navigate('/')}
              variant="outline"
              className="flex-1 btn-lg border-[var(--color-gold)] text-[var(--color-text)] hover:bg-[var(--color-gold)]/10"
            >
              홈으로 가기
            </Button>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
