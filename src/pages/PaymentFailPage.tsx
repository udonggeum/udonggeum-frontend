import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Navbar, Footer, Button } from '@/components';
import { NAVIGATION_ITEMS } from '@/constants/navigation';
import { PaymentFailCallbackSchema } from '@/schemas/payment';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

/**
 * PaymentFailPage
 * Handles Kakao Pay failure callback
 *
 * Flow:
 * 1. Kakao Pay redirects to /payment/fail?order_id=123&error_msg=...
 * 2. Parse and validate query parameters
 * 3. Display error message with order number
 * 4. Provide "다시 결제하기" button to retry payment
 */
export default function PaymentFailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  // Parse callback parameters on mount
  useEffect(() => {
    try {
      const rawParams = {
        order_id: searchParams.get('order_id'),
        error_msg: searchParams.get('error_msg'),
      };

      // Validate with Zod schema
      const params = PaymentFailCallbackSchema.parse(rawParams);
      setOrderId(params.order_id);
      setErrorMsg(params.error_msg || null);
    } catch (error) {
      console.error('Invalid fail callback parameters:', error);
      setParseError('결제 실패 정보를 불러올 수 없습니다.');
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
      <Navbar navigationItems={NAVIGATION_ITEMS} />

      <main className="flex flex-1 items-center justify-center p-4 py-12">
        <div className="w-full max-w-md space-y-6 animate-fade-in">
          {/* Failure Icon & Message */}
          <div className="text-center space-y-3">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-error/10 border-2 border-error/30">
              <AlertTriangle className="h-12 w-12 text-error" />
            </div>
            <h1 className="text-4xl font-bold text-[var(--color-text)]">
              결제 실패
            </h1>
            <p className="text-lg text-[var(--color-text)]/70">
              결제 처리 중 오류가 발생했습니다
            </p>
          </div>

          {/* Order Info & Error Message Card */}
          <div className="rounded-3xl border-2 border-error/20 bg-gradient-to-br from-error/5 to-transparent p-6 shadow-lg">
            {orderId && (
              <div className="mb-4 border-b-2 border-error/20 pb-4 text-center">
                <p className="text-sm text-[var(--color-text)]/60 mb-1">주문번호</p>
                <p className="text-3xl font-bold text-[var(--color-text)]">
                  #{orderId}
                </p>
              </div>
            )}

            {/* Error Message from Kakao Pay */}
            {errorMsg && (
              <div className="rounded-2xl bg-error/10 border border-error/30 p-4">
                <p className="text-sm font-semibold text-[var(--color-text)]/70 mb-2">
                  오류 메시지:
                </p>
                <p className="text-base font-medium text-error">{errorMsg}</p>
              </div>
            )}

            {!errorMsg && !parseError && (
              <div className="text-center text-[var(--color-text)]/70 space-y-2">
                <p className="text-base">결제가 정상적으로 처리되지 않았습니다.</p>
                <p className="text-sm text-[var(--color-text)]/60">
                  다시 시도하거나 고객센터로 문의해주세요.
                </p>
              </div>
            )}
          </div>

          {/* Parse Error Display */}
          {parseError && (
            <div className="alert bg-error/10 border-2 border-error/30 animate-shake">
              <AlertTriangle className="h-5 w-5 text-error" />
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

          {/* Help Info */}
          <div className="rounded-3xl bg-info/10 border-2 border-info/20 p-5 text-sm">
            <p className="font-bold text-[var(--color-text)] mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              자주 발생하는 오류
            </p>
            <ul className="space-y-2 text-[var(--color-text)]/70">
              <li className="flex items-center gap-2">
                <span className="text-error">•</span>
                <span>잔액 부족</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-error">•</span>
                <span>카드 한도 초과</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-error">•</span>
                <span>인증 실패 (비밀번호 오류)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-error">•</span>
                <span>네트워크 연결 문제</span>
              </li>
            </ul>
            <p className="mt-4 text-xs text-[var(--color-text)]/60">
              문제가 지속되면 고객센터로 문의해주세요.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
