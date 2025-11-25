import { ShoppingBag, Trash2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button, FallbackImage, QuantitySelector } from '@/components';
import { formatCurrency } from '@/utils/formatting';
import { LOW_STOCK_THRESHOLD, type FulfillmentType } from '@/constants/orderDefaults';
import type { CartItem } from '@/schemas/cart';

interface OrderItemsListProps {
  orderItems: CartItem[];
  markedItems: Record<number, boolean>;
  fulfillmentType: FulfillmentType;
  isDirectPurchase: boolean;
  isUpdatingCart: boolean;
  isRemovingCart: boolean;
  onMarkItem: (itemId: number) => void;
  onMarkAll: (checked: boolean) => void;
  onQuantityChange: (itemId: number, quantity: number) => void;
  onRemoveItem: (itemId: number) => void;
  onRemoveSelected: () => void;
  onClearAll: () => void;
}

/**
 * OrderItemsList component
 * Displays list of items in the order with quantity controls and removal options
 *
 * Extracted from OrderPage.tsx lines 763-945
 */
export function OrderItemsList({
  orderItems,
  markedItems,
  fulfillmentType,
  isDirectPurchase,
  isUpdatingCart,
  isRemovingCart,
  onMarkItem,
  onMarkAll,
  onQuantityChange,
  onRemoveItem,
  onRemoveSelected,
  onClearAll,
}: OrderItemsListProps) {
  const navigate = useNavigate();

  const markedCount = Object.values(markedItems).filter(Boolean).length;
  const allMarked = orderItems.length > 0 && orderItems.every((item) => markedItems[item.id]);

  if (orderItems.length === 0) {
    return (
      <section className="pb-8 border-b border-[var(--color-text)]/10">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-[var(--color-text)]/60">주문 상품</p>
            <h2 className="text-xl font-semibold text-[var(--color-text)]">총 0개</h2>
          </div>
        </div>

        <div className="rounded-xl border border-dashed border-[var(--color-text)]/20 p-10 text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-[var(--color-text)]/30" />
          <p className="mt-4 text-base font-semibold text-[var(--color-text)]">
            주문할 상품이 없습니다
          </p>
          <p className="mt-2 text-sm text-[var(--color-text)]/60">
            장바구니에서 상품을 선택한 뒤 다시 시도해주세요.
          </p>
          <Button
            className="mt-4"
            onClick={() => {
              void navigate('/cart');
            }}
          >
            장바구니로 이동
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="pb-8 border-b border-[var(--color-text)]/10">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-[var(--color-text)]/60">주문 상품</p>
          <h2 className="text-xl font-semibold text-[var(--color-text)]">
            총 {orderItems.length}개
          </h2>
        </div>
        {!isDirectPurchase && (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                className="checkbox checkbox-sm checkbox-primary"
                checked={allMarked}
                onChange={(event) => onMarkAll(event.target.checked)}
              />
              <span>전체 선택</span>
            </label>
            <span className="text-[var(--color-text)]/40">|</span>
            <Button
              variant="link"
              size="xs"
              onClick={onClearAll}
              disabled={orderItems.length === 0 || isRemovingCart}
            >
              전체 삭제
            </Button>
            <Button
              variant="link"
              size="xs"
              onClick={onRemoveSelected}
              disabled={markedCount === 0 || isRemovingCart}
            >
              선택 삭제 ({markedCount})
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {orderItems.map((item) => {
          const optionExtra = item.product_option?.additional_price ?? 0;
          const unitPrice = item.product.price + optionExtra;
          const itemTotal = unitPrice * item.quantity;
          const remainingStock = item.product.stock_quantity;
          const isLowStock = remainingStock > 0 && remainingStock <= LOW_STOCK_THRESHOLD;
          const insufficient = remainingStock < item.quantity;

          return (
            <article
              key={item.id}
              className="rounded-xl border border-[var(--color-text)]/10 p-4"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start">
                <div className="flex items-start gap-3">
                  {!isDirectPurchase && (
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary mt-2"
                      checked={Boolean(markedItems[item.id])}
                      onChange={() => onMarkItem(item.id)}
                      aria-label="삭제 대상 선택"
                    />
                  )}
                  <div className="h-24 w-24 overflow-hidden rounded-2xl border border-base-200">
                    <FallbackImage
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>

                <div className="flex flex-1 flex-col gap-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-[var(--color-text)]">
                        {item.product.name}
                      </p>
                      <p className="text-sm text-[var(--color-text)]/60">
                        {item.product_option
                          ? `${item.product_option.name} · ${item.product_option.value}`
                          : '옵션 없음'}
                      </p>
                      {item.product.store?.name && (
                        <p className="text-xs text-[var(--color-text)]/50">
                          {item.product.store.name}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-primary">
                        {formatCurrency(unitPrice)}
                      </p>
                      <p className="text-xs text-[var(--color-text)]/60">
                        수량 {item.quantity}개 · 소계 {formatCurrency(itemTotal)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <QuantitySelector
                      quantity={item.quantity}
                      onDecrease={() => onQuantityChange(item.id, item.quantity - 1)}
                      onIncrease={() => onQuantityChange(item.id, item.quantity + 1)}
                      disabled={isUpdatingCart}
                      showInput={false}
                    />
                    {!isDirectPurchase && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveItem(item.id)}
                        disabled={isRemovingCart}
                      >
                        <Trash2 className="h-4 w-4" />
                        삭제
                      </Button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3 text-xs text-[var(--color-text)]/60">
                    <span className="badge badge-outline border-dashed">
                      {fulfillmentType === 'delivery'
                        ? '배송 준비: 평균 2~3일'
                        : '픽업 준비: 준비 완료 시 알림'}
                    </span>
                    {isLowStock && !insufficient && (
                      <span className="flex items-center gap-1 text-warning">
                        <AlertTriangle className="h-3 w-3" />
                        남은 재고 {remainingStock}개
                      </span>
                    )}
                    {insufficient && (
                      <span className="flex items-center gap-1 text-error">
                        <AlertTriangle className="h-3 w-3" />
                        재고 부족
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
