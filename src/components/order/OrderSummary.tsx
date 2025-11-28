import { formatCurrency } from '@/utils/formatting';
import { DELIVERY_FEE, type FulfillmentType } from '@/constants/orderDefaults';

interface OrderSummaryProps {
  itemsSubtotal: number;
  fulfillmentType: FulfillmentType;
  isCartFetching: boolean;
  isCTAEnabled: boolean;
  isSubmittingOrder: boolean;
  onProceedToPayment: () => void;
}

/**
 * OrderSummary component
 * Displays order summary with pricing breakdown and checkout button
 *
 * Extracted from OrderPage.tsx lines 1253-1316
 */
export function OrderSummary({
  itemsSubtotal,
  fulfillmentType,
  isCartFetching,
  isCTAEnabled,
  isSubmittingOrder,
  onProceedToPayment,
}: OrderSummaryProps) {
  const shippingFee = fulfillmentType === 'delivery' ? DELIVERY_FEE : 0;
  const totalDue = Math.max(itemsSubtotal + shippingFee, 0);

  return (
    <section className="rounded-3xl border-2 border-[var(--color-gold)]/30 bg-gradient-to-br from-[var(--color-gold)]/5 to-transparent p-6 shadow-md">
      <h2 className="text-xl font-bold text-[var(--color-text)] mb-4">주문 요약</h2>
      <div className="space-y-3 text-sm text-[var(--color-text)]/70">
        <div className="flex items-center justify-between">
          <span>상품 합계</span>
          <strong className="text-base font-semibold text-[var(--color-text)]">{formatCurrency(itemsSubtotal)}</strong>
        </div>
        <div className="flex items-center justify-between">
          <span>{fulfillmentType === 'delivery' ? '배송비' : '픽업 수수료'}</span>
          <strong className="text-base font-semibold text-[var(--color-text)]">
            {shippingFee === 0 ? (
              <span className="text-[var(--color-gold)]">무료</span>
            ) : (
              `+ ${formatCurrency(shippingFee)}`
            )}
          </strong>
        </div>
      </div>

      <div className="mt-5 border-t-2 border-[var(--color-gold)]/30 pt-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-[var(--color-text)]/60 mb-1">총 결제금액</p>
            <p className="text-2xl font-bold text-[var(--color-gold)]">
              {formatCurrency(totalDue)}
            </p>
          </div>
          {isCartFetching && (
            <span className="text-xs text-[var(--color-gold)] flex items-center gap-1">
              <span className="loading loading-spinner loading-xs"></span>
              계산 중
            </span>
          )}
        </div>
      </div>

      <button
        type="button"
        className={`btn btn-lg w-full mt-6 ${
          isCTAEnabled
            ? 'bg-[var(--color-gold)] hover:bg-[var(--color-gold)]/80 text-[var(--color-primary)] border-[var(--color-gold)]'
            : 'btn-disabled'
        }`}
        onClick={onProceedToPayment}
        disabled={!isCTAEnabled || isSubmittingOrder}
        aria-label="결제 페이지로 이동"
      >
        {isSubmittingOrder ? (
          <>
            <span className="loading loading-spinner"></span>
            주문 생성 중...
          </>
        ) : (
          '결제하기로 이동'
        )}
      </button>
      {!isCTAEnabled && (
        <p className="mt-3 text-sm text-error font-medium animate-pulse-slow">
          필수 입력값을 모두 채우고 배송/픽업 정보를 확인해주세요.
        </p>
      )}
      <p className="mt-4 text-xs text-[var(--color-text)]/60 leading-relaxed">
        주문 제출 시{' '}
        <a href="/" className="link text-[var(--color-gold)] hover:text-[var(--color-gold)]/80 font-medium">
          이용약관
        </a>
        에 동의한 것으로 간주됩니다.
      </p>
    </section>
  );
}
