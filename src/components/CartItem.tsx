import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import Button from './Button';
import FallbackImage from './FallbackImage';
import QuantitySelector from './QuantitySelector';
import type { CartItem as CartItemType } from '@/schemas/cart';

interface CartItemProps {
  item: CartItemType;
  isSelected: boolean;
  isUpdating: boolean;
  isRemoving: boolean;
  onToggleSelection: (id: number) => void;
  onQuantityChange: (id: number, quantity: number) => void;
  onOpenOptionModal: (item: CartItemType) => void;
  onRemove: (id: number) => void;
}

function formatCurrency(amount: number | undefined) {
  if (!amount || Number.isNaN(amount)) {
    return '₩0';
  }
  return `₩${amount.toLocaleString('ko-KR')}`;
}

const CartItem = React.memo(({
  item,
  isSelected,
  isUpdating,
  isRemoving,
  onToggleSelection,
  onQuantityChange,
  onOpenOptionModal,
  onRemove,
}: CartItemProps) => {
  const optionExtra = item.product_option?.additional_price ?? 0;
  const unitPrice = item.product.price + optionExtra;
  const itemTotalPrice = unitPrice * item.quantity;
  const optionList = item.product.options ?? [];
  const canChangeOption = optionList.length > 0;

  return (
    <article className="flex flex-col gap-4 rounded-3xl border border-[var(--color-text)]/10 bg-[var(--color-secondary)] p-5 shadow-sm transition hover:shadow-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            className="checkbox border-[var(--color-gold)] checked:bg-[var(--color-gold)] checked:border-[var(--color-gold)] mt-2"
            checked={isSelected}
            onChange={() => onToggleSelection(item.id)}
          />
          <Link
            to={`/products/${item.product.id}`}
            className="block h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-[var(--color-text)]/10"
          >
            <FallbackImage
              src={item.product.image_url}
              alt={item.product.name}
              className="h-full w-full object-cover"
            />
          </Link>
        </div>
        <div className="flex flex-1 flex-col gap-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <Link
                to={`/products/${item.product.id}`}
                className="text-lg font-semibold text-[var(--color-text)] hover:text-[var(--color-gold)]"
              >
                {item.product.name}
              </Link>
              {item.product_option ? (
                <p className="text-sm text-[var(--color-text)]/70">
                  {item.product_option.name} · {item.product_option.value}
                </p>
              ) : (
                <p className="text-sm text-[var(--color-text)]/50">옵션 없음</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-[var(--color-gold)]">
                {formatCurrency(unitPrice)}
              </p>
              <p className="text-xs text-[var(--color-text)]/60">
                수량 {item.quantity}개 · 합계 {formatCurrency(itemTotalPrice)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <QuantitySelector
              quantity={item.quantity}
              onDecrease={() => onQuantityChange(item.id, item.quantity - 1)}
              onIncrease={() => onQuantityChange(item.id, item.quantity + 1)}
              disabled={isUpdating}
            />
            <div className="flex flex-wrap gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenOptionModal(item)}
                disabled={!canChangeOption || isUpdating}
              >
                옵션 변경
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(item.id)}
                disabled={isRemoving}
              >
                <Trash2 className="h-4 w-4" />
                삭제
              </Button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
});

CartItem.displayName = 'CartItem';

export default CartItem;
