import { MapPin, Phone, PackageSearch, Clock } from 'lucide-react';
import FallbackImage from './FallbackImage';
import type { StoreSummary } from '@/types';

interface StoreCardProps {
  store: StoreSummary;
}

/**
 * StoreCard Component
 *
 * Displays store information such as location, contact, business hours, and product count.
 * Used on the stores listing page to present each market entry.
 */
export default function StoreCard({ store }: StoreCardProps) {
  const locationText = [store.region, store.district]
    .filter((value): value is string => Boolean(value))
    .join(' ');

  const totalProductCount =
    typeof store.productCount === 'number'
      ? store.productCount
      : store.categoryCounts?.reduce((sum, category) => sum + category.count, 0);

  const productCountLabel =
    typeof totalProductCount === 'number'
      ? `${totalProductCount.toLocaleString('ko-KR')}개 상품`
      : '상품 정보 준비 중';

  const sanitizedPhone = store.phone?.replace(/[^0-9+]/g, '');
  const displayedCategoryCounts = store.categoryCounts?.slice(0, 4) ?? [];
  const hiddenCategoryCount =
    (store.categoryCounts?.length ?? 0) - displayedCategoryCounts.length;

  return (
    <div className="card bg-base-100 shadow-xl transition-shadow hover:shadow-2xl">
      <figure className="aspect-video overflow-hidden bg-base-200">
        <FallbackImage
          src={store.imageUrl}
          alt={`${store.name} 매장 이미지`}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </figure>

      <div className="card-body gap-4">
        <div className="space-y-2">
          <h3 className="card-title text-xl">{store.name}</h3>

          {locationText && (
            <p className="flex items-center gap-2 text-sm text-base-content/70">
              <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
              <span>{locationText}</span>
            </p>
          )}

          {store.address && (
            <p className="rounded-lg bg-base-200/60 px-3 py-2 text-sm text-base-content/70">
              {store.address}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm text-base-content/70">
          <span className="badge badge-outline badge-primary gap-2 px-3 py-2">
            <PackageSearch className="h-4 w-4" aria-hidden="true" />
            {productCountLabel}
          </span>

          {store.businessHours && (
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4" aria-hidden="true" />
              {store.businessHours}
            </span>
          )}
        </div>

        {displayedCategoryCounts.length > 0 && (
          <div className="flex flex-wrap gap-2 text-xs text-base-content/70">
            {displayedCategoryCounts.map((category) => (
              <span
                key={`${store.id}-${category.id}`}
                className="badge badge-outline badge-sm gap-1 px-3 py-2"
              >
                {category.name}{' '}
                <span className="font-semibold text-base-content">
                  {category.count.toLocaleString('ko-KR')}개
                </span>
              </span>
            ))}
            {hiddenCategoryCount > 0 && (
              <span className="badge badge-outline badge-sm px-3 py-2">
                +{hiddenCategoryCount}개 카테고리
              </span>
            )}
          </div>
        )}

        <div className="card-actions mt-2 flex items-center justify-between">
          {store.phone ? (
            <>
              <span className="flex items-center gap-2 text-sm text-base-content/70">
                <Phone className="h-4 w-4" aria-hidden="true" />
                {store.phone}
              </span>
              {sanitizedPhone ? (
                <a
                  href={`tel:${sanitizedPhone}`}
                  className="btn btn-sm btn-primary"
                  aria-label={`${store.name}에 전화하기`}
                >
                  전화하기
                </a>
              ) : (
                <span className="text-xs text-base-content/50">전화 연결 불가</span>
              )}
            </>
          ) : (
            <span className="text-sm text-base-content/50">연락처 정보가 준비 중입니다.</span>
          )}
        </div>
      </div>
    </div>
  );
}
