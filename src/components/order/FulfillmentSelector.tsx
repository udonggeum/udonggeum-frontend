import { Truck, Package } from 'lucide-react';
import { formatCurrency } from '@/utils/formatting';
import { DELIVERY_FEE, type FulfillmentType } from '@/constants/orderDefaults';

interface FulfillmentSelectorProps {
  fulfillmentType: FulfillmentType;
  onFulfillmentTypeChange: (type: FulfillmentType) => void;
}

/**
 * FulfillmentSelector component
 * Allows user to choose between delivery and pickup
 *
 * Extracted from OrderPage.tsx lines 947-1019
 */
export function FulfillmentSelector({
  fulfillmentType,
  onFulfillmentTypeChange,
}: FulfillmentSelectorProps) {
  return (
    <section className="pb-8 border-b border-[var(--color-text)]/10">
      <div className="mb-4 flex items-center gap-2">
        <Truck className="h-5 w-5 text-[var(--color-gold)]" />
        <div>
          <p className="text-sm text-[var(--color-text)]/60">수령 방법</p>
          <h2 className="text-lg font-semibold text-[var(--color-text)]">배송 또는 픽업 선택</h2>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <button
          type="button"
          className={`flex items-start gap-3 rounded-xl border p-4 text-left transition ${
            fulfillmentType === 'delivery'
              ? 'border-[var(--color-gold)] bg-[var(--color-gold)]/5'
              : 'border-[var(--color-text)]/10 hover:border-[var(--color-text)]/20'
          }`}
          onClick={() => onFulfillmentTypeChange('delivery')}
          aria-pressed={fulfillmentType === 'delivery'}
        >
          <span className="rounded-full bg-[var(--color-gold)]/10 p-3 text-[var(--color-gold)]">
            <Truck className="h-5 w-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-[var(--color-text)]">배송 받기</p>
              {fulfillmentType === 'delivery' && (
                <span className="badge badge-outline border-[var(--color-gold)] text-[var(--color-gold)] badge-sm">
                  선택됨
                </span>
              )}
            </div>
            <p className="text-sm text-[var(--color-text)]/70">
              집이나 회사 등 원하는 주소로 안전하게 배송됩니다.
            </p>
            <p className="mt-1 text-xs text-[var(--color-text)]/50">
              기본 배송비 {formatCurrency(DELIVERY_FEE)} · 평균 2~3일 소요
            </p>
          </div>
        </button>

        <button
          type="button"
          className={`flex items-start gap-3 rounded-xl border p-4 text-left transition ${
            fulfillmentType === 'pickup'
              ? 'border-[var(--color-gold)] bg-[var(--color-gold)]/5'
              : 'border-[var(--color-text)]/10 hover:border-[var(--color-text)]/20'
          }`}
          onClick={() => onFulfillmentTypeChange('pickup')}
          aria-pressed={fulfillmentType === 'pickup'}
        >
          <span className="rounded-full bg-[var(--color-gold)]/10 p-3 text-[var(--color-gold)]">
            <Package className="h-5 w-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-[var(--color-text)]">매장 픽업</p>
              {fulfillmentType === 'pickup' && (
                <span className="badge badge-outline border-[var(--color-gold)] text-[var(--color-gold)] badge-sm">
                  선택됨
                </span>
              )}
            </div>
            <p className="text-sm text-[var(--color-text)]/70">
              가까운 우동금 센터를 방문해 직접 수령할 수 있어요.
            </p>
            <p className="mt-1 text-xs text-[var(--color-text)]/50">
              추가 비용 없음 · 준비되면 알림
            </p>
          </div>
        </button>
      </div>

      <p className="mt-4 text-sm text-[var(--color-text)]/70">
        {fulfillmentType === 'delivery'
          ? '배송을 선택하면 아래에서 배송지 정보를 입력해주세요.'
          : '픽업을 선택하면 방문할 센터를 선택한 뒤 안내에 따라 수령해 주세요.'}
      </p>
    </section>
  );
}
