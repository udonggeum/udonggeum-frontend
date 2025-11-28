import { Link } from 'react-router-dom';
import { MapPin, Phone, Store as StoreIcon } from 'lucide-react';

interface StoreInfo {
  id: number;
  name: string;
  region?: string;
  district?: string;
  address?: string | null;
  phone_number?: string | null;
}

interface StoreInfoCardProps {
  store: StoreInfo | undefined;
  storeLocation?: string;
}

/**
 * StoreInfoCard Component
 *
 * Displays store information in a grid layout with icons.
 * Used in ProductDetailPage to show related store details.
 */
export default function StoreInfoCard({ store, storeLocation }: StoreInfoCardProps) {
  if (!store) {
    return (
      <div className="rounded-2xl bg-[var(--color-primary)] px-4 py-8 text-center border border-[var(--color-text)]/10">
        <p className="text-sm text-[var(--color-text)]/70">매장 정보를 불러올 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {/* Store Name */}
      <div className="flex items-start gap-3 rounded-2xl bg-[var(--color-primary)] px-4 py-3 border border-[var(--color-text)]/10">
        <div className="rounded-full bg-[var(--color-gold)]/10 p-2 text-[var(--color-gold)]">
          <StoreIcon className="h-4 w-4" />
        </div>
        <div className="text-sm">
          <p className="font-semibold text-[var(--color-text)]">매장명</p>
          {store.id ? (
            <Link
              to={`/stores/${store.id}`}
              className="text-[var(--color-gold)] hover:underline text-base font-medium"
            >
              {store.name}
            </Link>
          ) : (
            <p className="text-[var(--color-text)]/70">정보 없음</p>
          )}
        </div>
      </div>

      {/* Location */}
      <div className="flex items-start gap-3 rounded-2xl bg-[var(--color-primary)] px-4 py-3 border border-[var(--color-text)]/10">
        <div className="rounded-full bg-[var(--color-gold)]/10 p-2 text-[var(--color-gold)]">
          <MapPin className="h-4 w-4" />
        </div>
        <div className="text-sm">
          <p className="font-semibold text-[var(--color-text)]">위치</p>
          <p className="text-[var(--color-gold)]">{storeLocation ?? '지역 정보 없음'}</p>
        </div>
      </div>

      {/* Phone Number */}
      {store.phone_number && (
        <div className="flex items-start gap-3 rounded-2xl bg-[var(--color-primary)] px-4 py-3 sm:col-span-2 border border-[var(--color-text)]/10">
          <div className="rounded-full bg-[var(--color-gold)]/10 p-2 text-[var(--color-gold)]">
            <Phone className="h-4 w-4" />
          </div>
          <div className="text-sm flex-1">
            <p className="font-semibold text-[var(--color-text)]">연락처</p>
            <a
              href={`tel:${store.phone_number}`}
              className="text-[var(--color-gold)] hover:underline text-base"
            >
              {store.phone_number}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
