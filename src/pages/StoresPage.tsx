import { useEffect, useMemo, useState } from 'react';
import {
  Navbar,
  Footer,
  Button,
  StoreCard,
  StoresLoadingSkeleton,
  PaginationControls,
  ErrorAlert,
  CategorySidebar,
} from '@/components';
import { useStores, useStoreLocations } from '@/hooks/queries/useStoresQueries';
import { useProductFilters } from '@/hooks/queries/useProductsQueries';
import { NAV_ITEMS } from '@/constants/navigation';
import { MOCK_CATEGORIES } from '@/constants/mockData';
import { uiCategoryToAPICategory } from '@/utils/apiAdapters';
import { buildCategoryLabelMap, mapStoreDetailToSummary } from '@/utils/storeAdapters';
import { adaptFiltersToCategories } from '@/utils/filterAdapters';
import type { StoreSummary } from '@/types';

const PAGE_SIZE = 12;

interface RegionOption {
  id: string;
  label: string;
  region?: string;
  district?: string;
}

function toSlug(value: string) {
  return value.toLowerCase().replace(/\s+/g, '-');
}

export default function StoresPage() {
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: locationsData,
  } = useStoreLocations();

  const { data: filtersData } = useProductFilters();

  const categories = useMemo(
    () => (filtersData ? adaptFiltersToCategories(filtersData) : MOCK_CATEGORIES),
    [filtersData]
  );

  const CATEGORY_LABEL_MAP = useMemo(
    () => buildCategoryLabelMap(categories),
    [categories]
  );

  const categoryOptions = useMemo(
    () =>
      [...categories].sort((a, b) => a.displayOrder - b.displayOrder),
    [categories]
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
    page: currentPage,
    page_size: PAGE_SIZE,
  });

  const stores: StoreSummary[] = useMemo(() => {
    if (!storesData?.stores) {
      return [];
    }

    let filteredStores = storesData.stores;

    // Filter by category on client-side using category_counts
    if (selectedCategoryId) {
      const apiCategory = uiCategoryToAPICategory(selectedCategoryId);
      if (apiCategory) {
        filteredStores = filteredStores.filter((store) => {
          // Check if store has products in the selected category
          const categoryCounts = store.category_counts;
          if (!categoryCounts) return false;

          // Handle both Record and Array formats
          if (Array.isArray(categoryCounts)) {
            return categoryCounts.some((cc) => cc.category === apiCategory && (cc.count ?? 0) > 0);
          }
          return (categoryCounts[apiCategory as keyof typeof categoryCounts] || 0) > 0;
        });
      }
    }

    return filteredStores.map((store) =>
      mapStoreDetailToSummary(store, CATEGORY_LABEL_MAP)
    );
  }, [storesData?.stores, selectedCategoryId]);

  const totalCount = storesData?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const isEmpty = !isLoading && !isFetching && stores.length === 0;

  const selectedRegionLabel = selectedRegion
    ? selectedRegion.label
    : '전체 지역';
  const selectedCategoryLabel = selectedCategoryId
    ? CATEGORY_LABEL_MAP.get(selectedCategoryId) ?? '선택된 카테고리'
    : '전체 카테고리';

  const handleRegionChange = (value: string | null) => {
    setSelectedRegionId(value);
  };

  const handleCategoryChange = (value: string | null) => {
    setSelectedCategoryId(value);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar navigationItems={NAV_ITEMS} />

      <main className="flex-grow">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
            {/* Sidebar */}
            <CategorySidebar
              regions={regionOptions}
              categories={categoryOptions}
              selectedRegionId={selectedRegionId}
              selectedCategoryId={selectedCategoryId}
              onRegionChange={handleRegionChange}
              onCategoryChange={handleCategoryChange}
            />

            {/* Main Content */}
            <div>
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold">전체 매장</h1>
                  <p className="text-sm text-[var(--color-text)]/70">
                    총 {totalCount.toLocaleString('ko-KR')}개의 매장이 있습니다.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--color-text)]/60">
                  <span>{selectedRegionLabel}</span>
                  <span className="text-[var(--color-text)]/40">·</span>
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
                <div className="flex flex-col items-center justify-center gap-4 rounded-xl bg-[var(--color-secondary)] py-20 text-center">
                  <h2 className="text-xl font-semibold">
                    조건에 맞는 매장이 없습니다
                  </h2>
                  <p className="text-[var(--color-text)]/70">
                    다른 지역이나 카테고리를 선택해보세요.
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => {
                      setSelectedRegionId(null);
                      setSelectedCategoryId(null);
                      setCurrentPage(1);
                    }}
                  >
                    전체 매장 보기
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-4">
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
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
