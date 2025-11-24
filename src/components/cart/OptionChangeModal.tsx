import { Button } from '@/components';
import type { CartItem } from '@/schemas/cart';

export type OptionSelection = 'keep' | 'none' | number;

interface OptionChangeModalProps {
  item: CartItem | null;
  selection: OptionSelection;
  error: string | null;
  isUpdating: boolean;
  onSelectionChange: (selection: OptionSelection) => void;
  onClose: () => void;
  onApply: () => void;
}

/**
 * OptionChangeModal component
 * Modal for changing product options in cart
 *
 * Extracted from CartPage.tsx lines 406-617 (211 lines)
 */
export function OptionChangeModal({
  item,
  selection,
  error,
  isUpdating,
  onSelectionChange,
  onClose,
  onApply,
}: OptionChangeModalProps) {
  if (!item) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <h3 className="text-lg font-semibold text-[var(--color-text)]">옵션 변경</h3>
        <p className="mt-2 text-sm text-[var(--color-text)]/70">
          {item.product.name}의 옵션을 선택해주세요.
        </p>

        {item.product.options && item.product.options.length > 0 ? (
          <div className="mt-5 space-y-4">
            <p className="rounded-2xl bg-[var(--color-secondary)]/60 px-4 py-3 text-xs text-[var(--color-text)]/60">
              옵션을 변경하지 않으면 기존 설정이 유지되며, 옵션 제거를 선택하면 옵션이 삭제됩니다.
            </p>

            {item.product.options.length > 6 ? (
              // Select 방식 (옵션 6개 초과)
              (() => {
                const existingOption = item.product_option;
                const selectValue =
                  selection === 'keep'
                    ? '__KEEP__'
                    : selection === 'none'
                      ? '__NONE__'
                      : String(selection);

                return (
                  <label className="form-control w-full">
                    <span className="label-text text-sm text-[var(--color-text)]">옵션 목록</span>
                    <select
                      className="select select-bordered"
                      value={selectValue}
                      onChange={(event) => {
                        const { value } = event.target;
                        if (value === '__KEEP__') {
                          onSelectionChange('keep');
                        } else if (value === '__NONE__') {
                          onSelectionChange('none');
                        } else {
                          onSelectionChange(Number(value));
                        }
                      }}
                    >
                      <option value="__KEEP__">
                        현재 옵션 유지 (
                        {existingOption
                          ? `${existingOption.name} · ${existingOption.value}`
                          : '옵션 없음'}
                        )
                      </option>
                      {existingOption && <option value="__NONE__">옵션 제거 (옵션 없이 담기)</option>}
                      {item.product.options.map((option) => {
                        const additionalText =
                          option.additional_price && option.additional_price > 0
                            ? `(+₩${option.additional_price.toLocaleString('ko-KR')})`
                            : '';
                        return (
                          <option key={option.id} value={option.id}>
                            {option.name} {option.value} {additionalText}
                          </option>
                        );
                      })}
                    </select>
                  </label>
                );
              })()
            ) : (
              // Radio 방식 (옵션 6개 이하)
              (() => {
                const existingOption = item.product_option;
                const keepSelected = selection === 'keep';
                const noneSelected = selection === 'none';

                return (
                  <div className="space-y-3">
                    <label
                      className={`flex cursor-pointer flex-col gap-2 rounded-2xl border p-4 transition-all ${
                        keepSelected
                          ? 'border-primary bg-primary/10 shadow-sm'
                          : 'border-base-200 hover:border-primary/60 hover:bg-[var(--color-secondary)]/40'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="space-y-1 text-sm">
                          <p className="font-semibold text-[var(--color-text)]">현재 옵션 유지</p>
                          <p className="text-xs text-[var(--color-text)]/60">
                            {existingOption
                              ? `${existingOption.name} · ${existingOption.value}`
                              : '현재 옵션 없음'}
                          </p>
                        </div>
                        <input
                          type="radio"
                          name="cart-option"
                          className="radio radio-primary"
                          checked={keepSelected}
                          onChange={() => onSelectionChange('keep')}
                        />
                      </div>
                    </label>

                    {existingOption && (
                      <label
                        className={`flex cursor-pointer flex-col gap-2 rounded-2xl border p-4 transition-all ${
                          noneSelected
                            ? 'border-primary bg-primary/10 shadow-sm'
                            : 'border-base-200 hover:border-primary/60 hover:bg-[var(--color-secondary)]/40'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="space-y-1 text-sm">
                            <p className="font-semibold text-[var(--color-text)]">옵션 제거</p>
                            <p className="text-xs text-[var(--color-text)]/60">옵션 없이 담기</p>
                          </div>
                          <input
                            type="radio"
                            name="cart-option"
                            className="radio radio-primary"
                            checked={noneSelected}
                            onChange={() => onSelectionChange('none')}
                          />
                        </div>
                      </label>
                    )}

                    {item.product.options.map((option) => {
                      const isSelected = selection === option.id;
                      const additionalText =
                        option.additional_price && option.additional_price > 0
                          ? `+₩${option.additional_price.toLocaleString('ko-KR')}`
                          : '추가 금액 없음';
                      const stockText =
                        option.stock_quantity !== undefined
                          ? `재고 ${option.stock_quantity}개`
                          : '재고 정보 없음';

                      return (
                        <label
                          key={option.id}
                          className={`flex cursor-pointer flex-col gap-2 rounded-2xl border p-4 transition-all ${
                            isSelected
                              ? 'border-primary bg-primary/10 shadow-sm'
                              : 'border-base-200 hover:border-primary/60 hover:bg-[var(--color-secondary)]/40'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="space-y-1 text-sm">
                              <p className="font-semibold text-[var(--color-text)]">
                                {option.name} {option.value}
                              </p>
                              <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-text)]/60">
                                <span
                                  className={`rounded-full px-3 py-1 font-medium ${
                                    option.additional_price && option.additional_price > 0
                                      ? 'bg-primary/10 text-primary'
                                      : 'bg-[var(--color-secondary)] text-[var(--color-text)]/70'
                                  }`}
                                >
                                  {additionalText}
                                </span>
                                <span>{stockText}</span>
                              </div>
                            </div>
                            <input
                              type="radio"
                              name="cart-option"
                              className="radio radio-primary"
                              checked={isSelected}
                              onChange={() => onSelectionChange(option.id)}
                            />
                          </div>
                        </label>
                      );
                    })}
                  </div>
                );
              })()
            )}
          </div>
        ) : (
          <p className="mt-5 rounded-2xl bg-[var(--color-secondary)]/60 px-4 py-5 text-sm text-[var(--color-text)]/70">
            변경 가능한 옵션이 없습니다.
          </p>
        )}

        {error && <p className="mt-4 text-sm text-error">{error}</p>}

        <div className="modal-action">
          <Button variant="ghost" onClick={onClose} disabled={isUpdating}>
            취소
          </Button>
          <Button onClick={onApply} loading={isUpdating} disabled={isUpdating}>
            적용하기
          </Button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="button" onClick={onClose} aria-label="옵션 변경 닫기">
          닫기
        </button>
      </form>
    </dialog>
  );
}
