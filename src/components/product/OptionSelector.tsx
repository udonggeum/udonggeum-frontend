import type { ProductOption } from '@/schemas/products';

interface OptionSelectorProps {
  options: ProductOption[] | undefined;
  selectedOptionId: number | null;
  onOptionChange: (optionId: number | null) => void;
}

/**
 * OptionSelector Component
 *
 * Handles product option selection with visual feedback.
 * Supports both dropdown (for many options) and card selection (for few options).
 */
export default function OptionSelector({
  options,
  selectedOptionId,
  onOptionChange,
}: OptionSelectorProps) {
  // No options case
  if (!options || options.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-[var(--color-text)]/20 bg-[var(--color-primary)] px-4 py-5 text-sm text-[var(--color-text)]/70">
        옵션이 없는 단일 상품입니다.
      </p>
    );
  }

  const hasManyOptions = options.length > 6;
  const currentOption = options.find((option) => option.id === selectedOptionId) ?? null;

  // Dropdown for many options (>6)
  if (hasManyOptions) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="product-option-select" className="text-sm font-medium text-[var(--color-text)]">
            옵션 선택
          </label>
          <select
            id="product-option-select"
            className="select select-bordered w-full bg-[var(--color-primary)] text-[var(--color-text)] border-[var(--color-gold)]"
            value={selectedOptionId ?? ''}
            onChange={(event) => {
              const value = event.target.value;
              onOptionChange(value ? Number(value) : null);
            }}
            aria-label="상품 옵션 선택"
            aria-required="true"
          >
            <option value="">옵션을 선택해 주세요</option>
            {options.map((option) => {
              const priceSuffix =
                option.additional_price && option.additional_price > 0
                  ? ` (+₩${option.additional_price.toLocaleString('ko-KR')})`
                  : '';
              return (
                <option key={option.id} value={option.id}>
                  {option.name} {option.value} {priceSuffix}
                </option>
              );
            })}
          </select>
        </div>

        {currentOption && (
          <div className="rounded-2xl border border-[var(--color-gold)]/30 bg-[var(--color-gold)]/5 p-4 text-sm text-[var(--color-text)]/80">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-semibold text-[var(--color-text)]">
                {currentOption.name} {currentOption.value}
              </p>
              <span className="rounded-full bg-[var(--color-gold)]/10 px-3 py-1 text-xs font-medium text-[var(--color-gold)]">
                추가 금액{' '}
                {currentOption.additional_price && currentOption.additional_price > 0
                  ? `+₩${currentOption.additional_price.toLocaleString('ko-KR')}`
                  : '없음'}
              </span>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <p className="rounded-xl bg-[var(--color-primary)] px-3 py-2 text-xs text-[var(--color-text)]/70 border border-[var(--color-text)]/10">
                재고{' '}
                {currentOption.stock_quantity !== undefined
                  ? `${currentOption.stock_quantity}개`
                  : '정보 없음'}
              </p>
              <p className="rounded-xl bg-[var(--color-primary)] px-3 py-2 text-xs text-[var(--color-text)]/70 border border-[var(--color-text)]/10">
                기본 옵션 여부 {currentOption.is_default ? '예' : '아니요'}
              </p>
            </div>
          </div>
        )}

        {!currentOption && (
          <p className="text-xs text-[var(--color-text)]/60">
            사용할 옵션을 선택해 주세요. 옵션별 추가 금액과 재고를 확인할 수 있습니다.
          </p>
        )}
      </div>
    );
  }

  // Card selection for few options (<=6)
  return (
    <div className="grid gap-3 sm:grid-cols-2" role="group" aria-label="상품 옵션 선택">
      {options.map((option) => {
        const hasAdditionalPrice = option.additional_price && option.additional_price > 0;

        const additionalText = hasAdditionalPrice
          ? `+₩${option.additional_price.toLocaleString('ko-KR')}`
          : '추가 금액 없음';

        const stockText =
          option.stock_quantity !== undefined
            ? `재고 ${option.stock_quantity}개`
            : '재고 정보 없음';

        const isSelected = selectedOptionId === option.id;

        return (
          <label
            key={option.id}
            className={`group flex cursor-pointer flex-col gap-3 rounded-2xl border p-4 transition-all ${
              isSelected
                ? 'border-[var(--color-gold)] bg-[var(--color-gold)]/10 shadow-sm'
                : 'border-[var(--color-text)]/20 hover:border-[var(--color-gold)]/60 hover:bg-[var(--color-secondary)]/40'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-[var(--color-text)]">
                  {option.name} {option.value}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-text)]/60">
                  <span className="rounded-full px-3 py-1 font-medium bg-[var(--color-gold)]/10 text-[var(--color-gold)]">
                    {additionalText}
                  </span>
                  <span>{stockText}</span>
                </div>
              </div>
              <input
                type="radio"
                name="product-option"
                className="radio border-[var(--color-gold)] checked:bg-[var(--color-gold)]"
                checked={isSelected}
                onChange={() => onOptionChange(option.id)}
              />
            </div>
          </label>
        );
      })}
    </div>
  );
}
