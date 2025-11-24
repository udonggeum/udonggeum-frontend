import { Button } from '@/components';
import { formatCurrency } from '@/utils/formatting';
import { ShoppingCart } from 'lucide-react';

interface CartSummaryProps {
  selectedCount: number;
  selectedTotal: number;
  onCheckout: () => void;
  onContinueShopping: () => void;
  checkoutError?: string | null;
}

/**
 * CartSummary component
 * Displays selected items summary and checkout button
 *
 * Extracted from CartPage.tsx lines 349-399
 */
export function CartSummary({
  selectedCount,
  selectedTotal,
  onCheckout,
  onContinueShopping,
  checkoutError,
}: CartSummaryProps) {
  return (
    <aside className="flex flex-col gap-4">
      <section className="rounded-3xl border border-[var(--color-text)]/10 bg-[var(--color-secondary)] p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[var(--color-text)]">주문 요약</h2>
        <div className="mt-4 space-y-3 text-sm text-[var(--color-text)]/70">
          <div className="flex items-center justify-between">
            <span>선택 상품 수</span>
            <span className="font-semibold text-[var(--color-text)]">{selectedCount}개</span>
          </div>
          <div className="flex items-center justify-between">
            <span>선택 상품 합계</span>
            <span className="text-base font-semibold text-[var(--color-text)]">
              {formatCurrency(selectedTotal)}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-[var(--color-text)]/10 pt-3 text-base font-semibold">
            <span>총 결제 예상 금액</span>
            <span className="text-[var(--color-gold)]">{formatCurrency(selectedTotal)}</span>
          </div>
        </div>
        {checkoutError && (
          <div className="mt-4 rounded-2xl border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">
            {checkoutError}
          </div>
        )}
        <Button
          block
          size="lg"
          className="mt-5"
          onClick={onCheckout}
          disabled={selectedCount === 0}
        >
          <ShoppingCart className="h-5 w-5" />
          선택 상품 결제하기
        </Button>
        <Button
          block
          size="lg"
          variant="ghost"
          className="mt-2"
          onClick={onContinueShopping}
        >
          계속 쇼핑하기
        </Button>
      </section>

      <section className="rounded-3xl border border-[var(--color-text)]/10 bg-[var(--color-secondary)] p-5 text-sm text-[var(--color-text)]/70">
        <h3 className="text-base font-semibold text-[var(--color-text)]">안내 사항</h3>
        <ul className="mt-3 space-y-2">
          <li>장바구니 상품은 최대 30일까지 보관됩니다.</li>
          <li>상품 가격과 재고는 주문 시점에 확정됩니다.</li>
          <li>옵션 변경 시 상품 상세 페이지에서 수정 후 다시 담아주세요.</li>
        </ul>
      </section>
    </aside>
  );
}
