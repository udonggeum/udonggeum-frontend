import { useEffect, useMemo, useState } from 'react';
import {
  Navbar,
  Footer,
  StoreCard,
  StoresLoadingSkeleton,
  PaginationControls,
  ErrorAlert,
} from '@/components';
import { useStores, useStoreLocations } from '@/hooks/queries/useStoresQueries';
import { NAV_ITEMS } from '@/constants/navigation';
import { MOCK_CATEGORIES } from '@/constants/mockData';
import { uiCategoryToAPICategory, apiCategoryToUICategory } from '@/utils/apiAdapters';
import type { StoreSummary, StoreCategoryCount } from '@/types';
import type { StoreDetail } from '@/services/stores';

const PAGE_SIZE = 12;

const CATEGORY_LABEL_MAP = new Map(
  MOCK_CATEGORIES.map((category) => [category.id, category.name])
);

interface RegionOption {
  id: string;
  label: string;
  region?: string;
  district?: string;
}

function toSlug(value: string) {
  return value.toLowerCase().replace(/\s+/g, '-');
}

function extractCategoryCounts(
  rawCounts: StoreDetail['category_counts']
): StoreCategoryCount[] | undefined {
  if (!rawCounts) {
    return undefined;
  }

  const entries: Array<[string, number]> = [];

  if (Array.isArray(rawCounts)) {
    rawCounts.forEach((item) => {
      if (!item || typeof item !== 'object') {
        return;
      }

      const key =
        (typeof item.category === 'string' && item.category) ||
        (typeof item.name === 'string' && item.name) ||
        (typeof item.key === 'string' && item.key) ||
        (typeof item.code === 'string' && item.code);

      const value =
        typeof item.count === 'number'
          ? item.count
          : typeof item.total === 'number'
            ? item.total
            : undefined;

      if (key && typeof value === 'number') {
        entries.push([key, value]);
      }
    });
  } else if (typeof rawCounts === 'object') {
    Object.entries(rawCounts).forEach(([key, value]) => {
      if (typeof value === 'number') {
        entries.push([key, value]);
      }
    });
  }

  const normalized = entries
    .map(([key, value]) => {
      const uiId = apiCategoryToUICategory(key);
      if (!uiId || value <= 0) {
        return null;
      }
      const name = CATEGORY_LABEL_MAP.get(uiId) ?? key;
      return { id: uiId, name, count: value };
    })
    .filter((entry): entry is StoreCategoryCount => Boolean(entry))
    .sort((a, b) => b.count - a.count);

  return normalized.length > 0 ? normalized : undefined;
}

function mapStoreToSummary(store: StoreDetail): StoreSummary {
  const categoryCounts = extractCategoryCounts(store.category_counts);
  const productCount =
    typeof store.product_count === 'number'
      ? store.product_count
      : Array.isArray(store.products)
        ? store.products.length
        : categoryCounts?.reduce((sum, item) => sum + item.count, 0);

  return {
    id: store.id,
    name: store.name,
    region: store.region,
    district: store.district,
    address: store.address,
    phone: store.phone ?? store.phone_number,
    businessHours: store.business_hours,
    productCount,
    imageUrl: store.image_url ?? store.logo_url ?? store.thumbnail_url,
    categoryCounts,
  };
}

export default function StoresPage() {
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: locationsData,
    isLoading: locationsLoading,
  } = useStoreLocations();

  const categoryOptions = useMemo(
    () =>
      [...MOCK_CATEGORIES].sort((a, b) => a.displayOrder - b.displayOrder),
    []
  );

  const regionOptions: RegionOption[] = useMemo(() => {
    if (!locationsData) {
      return [];
    }

    return locationsData.regions.flatMap((regionGroup) => {
      const regionSlug = toSlug(regionGroup.region);
      const regionOption: RegionOption = {
        id: `${regionSlug}-all`,
        label: `${regionGroup.region} 전체`,
        region: regionGroup.region,
      };

      const districtOptions = regionGroup.districts.map((district) => ({
        id: `${regionSlug}-${toSlug(district)}`,
        label: `${regionGroup.region} ${district}`,
        region: regionGroup.region,
        district,
      }));

      return [regionOption, ...districtOptions];
    });
  }, [locationsData]);

  const selectedRegion = regionOptions.find(
    (option) => option.id === selectedRegionId
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedRegionId, selectedCategoryId]);

  const {
    data: storesData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useStores({
    region: selectedRegion?.region,
    district: selectedRegion?.district,
    category: uiCategoryToAPICategory(selectedCategoryId),
    page: currentPage,
    page_size: PAGE_SIZE,
  });

  const stores: StoreSummary[] = useMemo(() => {
    if (!storesData?.stores) {
      return [];
    }
    return storesData.stores.map(mapStoreToSummary);
  }, [storesData?.stores]);

  const totalCount = storesData?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const isEmpty = !isLoading && !isFetching && stores.length === 0;

  const selectedRegionLabel = selectedRegion
    ? selectedRegion.label
    : '전체 지역';
  const selectedCategoryLabel = selectedCategoryId
    ? CATEGORY_LABEL_MAP.get(selectedCategoryId) ?? '선택된 카테고리'
    : '전체 카테고리';

  const handleRegionChange = (value: string) => {
    setSelectedRegionId(value || null);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategoryId(value || null);
  };

  return (
    <div className="flex min-h-screen flex-col bg-base-100">
      <Navbar navigationItems={NAV_ITEMS} />

      <main className="flex-grow">
        <section className="bg-base-200 py-6" aria-label="매장 필터">
          <div className="container mx-auto px-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="flex w-full flex-col gap-4 md:flex-row md:items-end md:gap-4">
                <label className="form-control w-full md:w-60">
                  <div className="label">
                    <span className="label-text text-sm font-semibold">
                      지역 선택
                    </span>
                  </div>
                  <select
                    className="select select-bordered"
                    value={selectedRegionId ?? ''}
                    onChange={(event) => handleRegionChange(event.target.value)}
                    disabled={locationsLoading}
                  >
                    <option value="">전체 지역</option>
                    {regionOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="form-control w-full md:w-60">
                  <div className="label">
                    <span className="label-text text-sm font-semibold">
                      카테고리 선택
                    </span>
                  </div>
                  <select
                    className="select select-bordered"
                    value={selectedCategoryId ?? ''}
                    onChange={(event) => handleCategoryChange(event.target.value)}
                  >
                    <option value="">전체 카테고리</option>
                    {categoryOptions.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="flex gap-2 md:self-end">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setSelectedRegionId(null);
                    setSelectedCategoryId(null);
                    setCurrentPage(1);
                  }}
                  disabled={
                    !selectedRegionId && !selectedCategoryId && !isFetching
                  }
                >
                  필터 초기화
                </button>
              </div>
            </div>
            {locationsLoading && (
              <p className="mt-3 text-sm text-base-content/60">
                지역 정보를 불러오는 중입니다...
              </p>
            )}
          </div>
        </section>

        <section className="container mx-auto px-4 py-10">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold">전체 매장</h1>
              <p className="text-sm text-base-content/70">
                총 {totalCount.toLocaleString('ko-KR')}개의 매장이 있습니다.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-base-content/60">
              <span>{selectedRegionLabel}</span>
              <span className="text-base-content/40">·</span>
              <span>{selectedCategoryLabel}</span>
              {isFetching && (
                <span className="ml-2 text-primary">데이터 새로고침 중...</span>
              )}
            </div>
          </div>

          {isLoading ? (
            <StoresLoadingSkeleton count={PAGE_SIZE} />
          ) : error ? (
            <ErrorAlert
              title="매장을 불러오지 못했습니다"
              message={
                error instanceof Error
                  ? error.message
                  : '매장 데이터를 불러오는 중 문제가 발생했습니다.'
              }
              onRetry={() => {
                void refetch();
              }}
              error={error instanceof Error ? error : undefined}
            />
          ) : isEmpty ? (
            <div className="flex flex-col items-center justify-center gap-4 rounded-xl bg-base-200 py-20 text-center">
              <h2 className="text-xl font-semibold">
                조건에 맞는 매장이 없습니다
              </h2>
              <p className="text-base-content/70">
                다른 지역이나 카테고리를 선택하거나 필터를 초기화해보세요.
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setSelectedRegionId(null);
                  setSelectedCategoryId(null);
                  setCurrentPage(1);
                }}
              >
                전체 매장 보기
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {stores.map((store) => (
                  <StoreCard key={store.id} store={store} />
                ))}
              </div>

              <div className="mt-10 flex justify-center">
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => setCurrentPage(page)}
                />
              </div>
            </>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
