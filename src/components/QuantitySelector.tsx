import { Button } from '@/components';

interface QuantitySelectorProps {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  showInput?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * QuantitySelector Component
 *
 * Reusable quantity selector with gold-themed +/- buttons
 * Used across ProductDetailPage, CartItem, OrderPage, and AddToCartModal
 *
 * @example
 * <QuantitySelector
 *   quantity={quantity}
 *   onDecrease={() => setQuantity(q => q - 1)}
 *   onIncrease={() => setQuantity(q => q + 1)}
 * />
 */
export default function QuantitySelector({
  quantity,
  onDecrease,
  onIncrease,
  onChange,
  min = 1,
  max,
  disabled = false,
  showInput = true,
  size = 'sm',
}: QuantitySelectorProps) {
  const isDecreaseDisabled = disabled || quantity <= min;
  const isIncreaseDisabled = disabled || (max !== undefined && quantity >= max);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onChange) return;

    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= min) {
      if (max === undefined || value <= max) {
        onChange(value);
      }
    }
  };

  return (
    <div className="join">
      <Button
        variant="outline"
        size={size}
        className="join-item bg-[var(--color-gold)] text-[var(--color-primary)] border-[var(--color-gold)] hover:bg-[var(--color-gold)]/80 disabled:bg-[var(--color-text)]/20 disabled:text-[var(--color-text)]/40 disabled:border-[var(--color-text)]/20"
        onClick={onDecrease}
        disabled={isDecreaseDisabled}
        aria-label="수량 줄이기"
      >
        -
      </Button>

      {showInput ? (
        <input
          type="number"
          min={min}
          max={max}
          value={quantity}
          onChange={handleInputChange}
          disabled={disabled}
          className="join-item input input-sm input-bordered w-16 text-center font-semibold bg-[var(--color-primary)] text-[var(--color-text)] border-[var(--color-gold)] disabled:opacity-50"
          aria-label="수량"
          readOnly={!onChange}
        />
      ) : (
        <span className="join-item flex items-center px-4 text-sm font-semibold bg-[var(--color-primary)] text-[var(--color-text)] border-y border-[var(--color-gold)]">
          {quantity}
        </span>
      )}

      <Button
        variant="outline"
        size={size}
        className="join-item bg-[var(--color-gold)] text-[var(--color-primary)] border-[var(--color-gold)] hover:bg-[var(--color-gold)]/80 disabled:bg-[var(--color-text)]/20 disabled:text-[var(--color-text)]/40 disabled:border-[var(--color-text)]/20"
        onClick={onIncrease}
        disabled={isIncreaseDisabled}
        aria-label="수량 늘리기"
      >
        +
      </Button>
    </div>
  );
}
