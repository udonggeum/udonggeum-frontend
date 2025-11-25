import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, PackageSearch, Clock } from 'lucide-react';
import FallbackImage from './FallbackImage';
import { useThemeStore } from '@/stores/useThemeStore';
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
  const navigate = useNavigate();
  const mode = useThemeStore((state) => state.mode);
  const theme = useThemeStore((state) => state.theme);

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

  const bgColor = mode === 'light' ? '#FAFAFA' : theme.secondary;

  const handleCardClick = () => {
    navigate(`/stores/${store.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="card card-side border border-[var(--color-text)]/10 transition-shadow hover:shadow-lg flex group cursor-pointer"
      style={{
        backgroundColor: bgColor,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)'
      }}
    >
      {/* 왼쪽: 이미지 (축소) */}
      <div className="w-40 flex-shrink-0">
        <figure className="h-full overflow-hidden bg-[var(--color-primary)]">
          <FallbackImage
            src={store.imageUrl}
            alt={`${store.name} 매장 이미지`}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </figure>
      </div>

      {/* 중앙: 매장 정보 */}
      <div className="flex-1 p-4 flex flex-col justify-between" style={{ lineHeight: '1.4' }}>
        <div className="space-y-2">
          {/* 상호명 (크게) */}
          <h3 className="text-[19px] font-bold text-[var(--color-text)]" style={{ lineHeight: '1.3' }}>
            {store.name}
          </h3>

          {/* 지역 + 주소 한 줄 */}
          <div className="flex items-center gap-2 text-sm text-[var(--color-text)]/70">
            <MapPin className="h-3.5 w-3.5 text-[var(--color-gold)] flex-shrink-0" aria-hidden="true" />
            <span>
              {locationText && <span className="font-medium">{locationText}</span>}
              {locationText && store.address && <span className="mx-1">·</span>}
              {store.address && <span>{store.address}</span>}
            </span>
          </div>

          {/* 영업시간 */}
          {store.businessHours && (
            <div className="flex items-center gap-2 text-sm text-[var(--color-text)]/70">
              <Clock className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
              <span>{store.businessHours}</span>
            </div>
          )}

          {/* 전화번호 */}
          {store.phone && (
            <div className="flex items-center gap-2 text-sm text-[var(--color-text)]/70">
              <Phone className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
              <span>{store.phone}</span>
            </div>
          )}
        </div>
      </div>

      {/* 오른쪽: 상품 정보 & 전화하기 버튼 */}
      <div className="p-4 flex flex-col justify-between items-end min-w-[180px]">
        {/* 상단: 상품 개수 & 카테고리 */}
        <div className="flex flex-col items-end gap-2">
          {/* 전체 상품 개수 */}
          <span className="badge border-[var(--color-gold)] text-[var(--color-gold)] gap-1.5 px-2.5 py-1.5 bg-transparent text-xs">
            <PackageSearch className="h-3.5 w-3.5" aria-hidden="true" />
            {productCountLabel}
          </span>

          {/* 카테고리별 상품 수 */}
          {displayedCategoryCounts.length > 0 && (
            <div className="flex flex-wrap gap-1.5 text-xs justify-end max-w-[160px]">
              {displayedCategoryCounts.map((category) => (
                <span
                  key={`${store.id}-${category.id}`}
                  className="badge badge-outline badge-sm gap-1 px-2 py-1 border-[var(--color-text)]/30 text-[var(--color-text)]"
                >
                  {category.name}{' '}
                  <span className="font-semibold">
                    {category.count.toLocaleString('ko-KR')}
                  </span>
                </span>
              ))}
              {hiddenCategoryCount > 0 && (
                <span className="badge badge-outline badge-sm px-2 py-1 border-[var(--color-text)]/30 text-[var(--color-text)]">
                  +{hiddenCategoryCount}
                </span>
              )}
            </div>
          )}
        </div>

        {/* 하단: 전화하기 버튼 */}
        {store.phone && sanitizedPhone && (
          <a
            href={`tel:${sanitizedPhone}`}
            className="btn btn-sm bg-[var(--color-gold)] hover:bg-[var(--color-gold)]/80 text-[var(--color-primary)] border-[var(--color-gold)] mt-2"
            aria-label={`${store.name}에 전화하기`}
            onClick={(e) => e.stopPropagation()}
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            전화하기
          </a>
        )}
      </div>
    </div>
  );
}
