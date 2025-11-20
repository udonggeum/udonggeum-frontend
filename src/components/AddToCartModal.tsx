import { useState, useEffect } from 'react';
import type { Product, ProductOption } from '@/schemas/products';
import { FallbackImage, Button } from '@/components';

interface AddToCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onConfirm: (productId: number, quantity: number, optionId?: number) => void;
  isPending?: boolean;
}

export default function AddToCartModal({
  isOpen,
  onClose,
  product,
  onConfirm,
  isPending = false,
}: AddToCartModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedOption, setSelectedOption] = useState<number | undefined>(undefined);

  // Reset state when modal opens/closes or product changes
  useEffect(() => {
    if (isOpen && product) {
      // Select default option if available
      const defaultOption = product.options?.find((opt) => opt.is_default);
      setSelectedOption(defaultOption?.id);
      setQuantity(1);
    } else {
      setSelectedOption(undefined);
      setQuantity(1);
    }
  }, [isOpen, product]);

  if (!product) return null;

  const hasOptions = product.options && product.options.length > 0;
  const selectedOptionData = hasOptions
    ? product.options?.find((opt) => opt.id === selectedOption)
    : undefined;

  // 상품 가격 + 옵션 추가금 = 단가, 단가 × 수량 = 총 금액
  const unitPrice = product.price + (selectedOptionData?.additional_price ?? 0);
  const totalPrice = unitPrice * quantity;

  const handleConfirm = () => {
    if (hasOptions && !selectedOption) {
      return; // Require option selection if options exist
    }
    onConfirm(product.id, quantity, selectedOption);
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Modal */}
      <dialog
        className={`modal ${isOpen ? 'modal-open' : ''}`}
        onClose={onClose}
      >
        <div className="modal-box max-w-md bg-[var(--color-primary)] border border-[var(--color-text)]/10">
          {/* Header */}
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold">{product.name}</h3>
              <p className="text-sm text-[var(--color-text)]/70">
                {product.price.toLocaleString()}원
              </p>
            </div>
            <Button
              variant="circle"
              size="sm"
              onClick={onClose}
              aria-label="닫기"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Button>
          </div>

          {/* Product Image */}
          <div className="mb-4">
            <FallbackImage
              src={product.image_url}
              alt={product.name}
              className="h-48 w-full rounded-lg object-cover"
            />
          </div>

          <div className="space-y-4">
            {/* Options Selection */}
            {hasOptions && (
              <div>
                <label className="label">
                  <span className="label-text font-semibold">옵션 선택</span>
                  <span className="label-text-alt text-error">*필수</span>
                </label>
                <select
                  className="select select-bordered w-full bg-[var(--color-primary)] border-[var(--color-text)]/20"
                  value={selectedOption ?? ''}
                  onChange={(e) =>
                    setSelectedOption(
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                >
                  <option value="" disabled>
                    옵션을 선택하세요
                  </option>
                  {product.options?.map((option: ProductOption) => (
                    <option key={option.id} value={option.id} disabled={option.stock_quantity === 0}>
                      {option.name}: {option.value}
                      {option.additional_price > 0 &&
                        ` (+${option.additional_price.toLocaleString()}원)`}
                      {option.stock_quantity === 0 && ' (품절)'}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Quantity Selection */}
            <div>
              <label className="label">
                <span className="label-text font-semibold">수량</span>
              </label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-4 w-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 12h-15"
                    />
                  </svg>
                </Button>
                <input
                  type="number"
                  className="input input-bordered w-20 text-center bg-[var(--color-primary)] border-[var(--color-text)]/20"
                  value={quantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10);
                    if (!isNaN(value) && value >= 1) {
                      setQuantity(value);
                    }
                  }}
                  min={1}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(1)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-4 w-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                </Button>
              </div>
            </div>

            {/* Total Price */}
            <div className="rounded-lg bg-[var(--color-secondary)] p-4 border border-[var(--color-text)]/10">
              <div className="flex items-center justify-between">
                <span className="font-semibold">총 금액</span>
                <span className="text-xl font-bold text-[var(--color-gold)]">
                  {totalPrice.toLocaleString()}원
                </span>
              </div>
              {selectedOptionData?.additional_price ? (
                <p className="mt-1 text-xs text-[var(--color-text)]/60">
                  (상품 {product.price.toLocaleString()}원 + 옵션 {selectedOptionData.additional_price.toLocaleString()}원) × {quantity}개
                </p>
              ) : (
                <p className="mt-1 text-xs text-[var(--color-text)]/60">
                  {product.price.toLocaleString()}원 × {quantity}개
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="modal-action">
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={isPending}
            >
              취소
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirm}
              disabled={
                isPending ||
                (hasOptions && !selectedOption) ||
                (selectedOptionData?.stock_quantity === 0)
              }
            >
              {isPending ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  추가 중...
                </>
              ) : (
                '장바구니에 추가'
              )}
            </Button>
          </div>
        </div>
      </dialog>
    </>
  );
}
