import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Navbar, Footer, Button } from '@/components';
import { NAV_ITEMS } from '@/constants/navigation';
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
    <div className="flex min-h-screen flex-col bg-base-100">
      <Navbar navigationItems={NAV_ITEMS} />

      <main className="flex flex-1 items-center justify-center p-4 py-12">
        <div className="w-full max-w-md space-y-6">
          {/* Failure Icon & Message */}
          <div className="text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-error/10">
              <AlertTriangle className="h-10 w-10 text-error" />
            </div>
            <h1 className="mt-4 text-3xl font-bold text-base-content">
              결제 실패
            </h1>
            <p className="mt-2 text-base-content/60">
              결제 처리 중 오류가 발생했습니다
            </p>
          </div>

          {/* Order Info & Error Message Card */}
          <div className="rounded-3xl border border-base-200 bg-base-50 p-6 shadow-lg">
            {orderId && (
              <div className="mb-4 border-b border-base-200 pb-4 text-center">
                <p className="text-sm text-base-content/60">주문번호</p>
                <p className="text-2xl font-bold text-base-content">
                  #{orderId}
                </p>
              </div>
            )}

            {/* Error Message from Kakao Pay */}
            {errorMsg && (
              <div className="rounded-2xl bg-error/5 p-4">
                <p className="text-sm font-medium text-base-content/70">
                  오류 메시지:
                </p>
                <p className="mt-1 text-base text-error">{errorMsg}</p>
              </div>
            )}

            {!errorMsg && !parseError && (
              <div className="text-center text-base-content/60">
                <p>결제가 정상적으로 처리되지 않았습니다.</p>
                <p className="mt-1 text-sm">
                  다시 시도하거나 고객센터로 문의해주세요.
                </p>
              </div>
            )}
          </div>

          {/* Parse Error Display */}
          {parseError && (
            <div className="alert alert-error">
              <AlertTriangle className="h-5 w-5" />
              <span>{parseError}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            {orderId && (
              <Button
                onClick={handleRetry}
                className="btn-primary w-full"
              >
                <RotateCcw className="h-5 w-5" />
                다시 결제하기
              </Button>
            )}
            <Button
              onClick={() => void navigate('/orders')}
              variant="outline"
              className="w-full"
            >
              주문 내역 확인
            </Button>
            <Button
              onClick={() => void navigate('/')}
              variant="ghost"
              className="w-full"
            >
              <Home className="h-5 w-5" />
              홈으로 가기
            </Button>
          </div>

          {/* Help Info */}
          <div className="rounded-2xl bg-info/10 p-4 text-sm text-info">
            <p className="font-medium">자주 발생하는 오류</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-xs">
              <li>잔액 부족</li>
              <li>카드 한도 초과</li>
              <li>인증 실패 (비밀번호 오류)</li>
              <li>네트워크 연결 문제</li>
            </ul>
            <p className="mt-3 text-xs">
              문제가 지속되면 고객센터로 문의해주세요.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
