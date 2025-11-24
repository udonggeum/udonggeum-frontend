import { Package } from 'lucide-react';

interface PickupStoreInfo {
  id?: number;
  name: string;
  address?: string | null;
  contact?: string | null;
}

interface PickupInfoProps {
  pickupStoreInfos: PickupStoreInfo[];
}

/**
 * PickupInfo component
 * Displays pickup store information when pickup fulfillment is selected
 *
 * Extracted from OrderPage.tsx lines 1189-1227
 */
export function PickupInfo({ pickupStoreInfos }: PickupInfoProps) {
  return (
    <section className="pb-8 border-b border-[var(--color-text)]/10">
      <div className="mb-4 flex items-center gap-2">
        <Package className="h-5 w-5 text-[var(--color-gold)]" />
        <div>
          <p className="text-sm text-[var(--color-text)]/60">픽업 안내</p>
          <h2 className="text-lg font-semibold text-[var(--color-text)]">상품별 매장 방문</h2>
        </div>
      </div>

      {pickupStoreInfos.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--color-text)]/20 p-4 text-sm text-[var(--color-text)]/70">
          선택한 상품의 픽업 매장을 찾을 수 없습니다. 잠시 후 다시 시도하거나 고객 센터에 문의해주세요.
        </div>
      ) : (
        <div className="space-y-3">
          {pickupStoreInfos.map((store) => (
            <div
              key={store.id ?? store.name}
              className="rounded-xl border border-[var(--color-text)]/10 p-4"
            >
              <p className="text-base font-semibold text-[var(--color-text)]">{store.name}</p>
              <p className="text-sm text-[var(--color-text)]/70">
                {store.address || '주소 정보가 업데이트될 예정입니다.'}
              </p>
              <p className="text-xs text-[var(--color-text)]/60">
                연락처 {store.contact || '매장 연락처 준비 중'}
              </p>
            </div>
          ))}
        </div>
      )}

      <p className="mt-4 text-xs text-[var(--color-text)]/60">
        각 상품이 속한 매장을 직접 방문해 수령해야 하며, 준비 완료 시 매장에서 별도로 안내드립니다.
        방문 시 주문자 본인 확인을 위한 신분증을 지참해주세요.
      </p>
    </section>
  );
}
