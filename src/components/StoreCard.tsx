import { Link } from 'react-router-dom';
import { MapPin, Phone, PackageSearch, Clock, ArrowUpRight } from 'lucide-react';
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
    <div className="card card-side bg-base-100 shadow-xl transition-shadow hover:shadow-2xl">
      <Link
        to={`/stores/${store.id}`}
        className="group w-64 flex-shrink-0"
        aria-label={`${store.name} 상세 페이지로 이동`}
      >
        <figure className="h-full overflow-hidden bg-base-200">
          <FallbackImage
            src={store.imageUrl}
            alt={`${store.name} 매장 이미지`}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </figure>
      </Link>

      <div className="card-body flex-1 gap-3 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <h3 className="card-title text-xl">
              <Link to={`/stores/${store.id}`} className="link-hover">
                {store.name}
              </Link>
            </h3>

            {locationText && (
              <p className="flex items-center gap-2 text-sm text-base-content/70">
                <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
                <span>{locationText}</span>
              </p>
            )}

            {store.address && (
              <p className="text-sm text-base-content/70">
                {store.address}
              </p>
            )}
          </div>

          <Link
            to={`/stores/${store.id}`}
            className="btn btn-sm btn-outline"
            aria-label={`${store.name} 상세보기`}
          >
            상세보기
            <ArrowUpRight className="ml-1 h-4 w-4" aria-hidden="true" />
          </Link>
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

          {store.phone && (
            <span className="flex items-center gap-2">
              <Phone className="h-4 w-4" aria-hidden="true" />
              {store.phone}
            </span>
          )}

          {store.phone && sanitizedPhone && (
            <a
              href={`tel:${sanitizedPhone}`}
              className="btn btn-xs btn-primary"
              aria-label={`${store.name}에 전화하기`}
            >
              전화하기
            </a>
          )}
        </div>

        {displayedCategoryCounts.length > 0 && (
          <div className="flex flex-wrap gap-2 text-xs">
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
      </div>
    </div>
  );
}
