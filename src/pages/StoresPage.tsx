import { useEffect, useMemo, useState } from 'react';
import {
  Navbar,
  Footer,
  Button,
  StoreCard,
  StoresLoadingSkeleton,
  PaginationControls,
  ErrorAlert,
} from '@/components';
import { useStores, useStoreLocations } from '@/hooks/queries/useStoresQueries';
import { NAV_ITEMS } from '@/constants/navigation';
import { mapStoreDetailToSummary } from '@/utils/storeAdapters';
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
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: locationsData,
  } = useStoreLocations();

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

  const regionGroups = useMemo(() => {
    if (!locationsData) {
      return [];
    }

    return locationsData.regions.map((regionGroup) => {
      const regionSlug = toSlug(regionGroup.region);
      return {
        region: regionGroup.region,
        regionId: `${regionSlug}-all`,
        districts: regionGroup.districts.map((district) => ({
          id: `${regionSlug}-${toSlug(district)}`,
          label: district,
          region: regionGroup.region,
          district,
        })),
      };
    });
  }, [locationsData]);

  const selectedRegion = regionOptions.find(
    (option) => option.id === selectedRegionId
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedRegionId]);

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

    return storesData.stores.map((store) =>
      mapStoreDetailToSummary(store, new Map())
    );
  }, [storesData?.stores]);

  const totalCount = storesData?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const isEmpty = !isLoading && !isFetching && stores.length === 0;

  const handleRegionChange = (value: string | null) => {
    setSelectedRegionId(value);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar navigationItems={NAV_ITEMS} />

      <main className="flex-grow">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
            {/* Sidebar */}
            <aside className="space-y-6">
              {/* Region Filter */}
              <div className="rounded-xl bg-[var(--color-secondary)] p-4 shadow-sm">
                <h3 className="mb-3 text-sm font-semibold text-[var(--color-text)]">지역</h3>
                <div className="space-y-1">
                  {/* 전체 지역 */}
                  <button
                    type="button"
                    onClick={() => handleRegionChange(null)}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      selectedRegionId === null
                        ? 'bg-[var(--color-gold)] text-[var(--color-primary)] font-semibold'
                        : 'text-[var(--color-text)] hover:bg-[var(--color-primary)]'
                    }`}
                  >
                    전체 지역
                  </button>

                  {/* 지역별 그룹 */}
                  {regionGroups.map((group) => (
                    <div key={group.regionId} className="space-y-1">
                      {/* 지역 전체 (예: 서울 전체) */}
                      <button
                        type="button"
                        onClick={() => handleRegionChange(group.regionId)}
                        className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                          selectedRegionId === group.regionId
                            ? 'bg-[var(--color-gold)] text-[var(--color-primary)] font-semibold'
                            : 'text-[var(--color-text)] hover:bg-[var(--color-primary)]'
                        }`}
                      >
                        {group.region}
                      </button>

                      {/* 하위 지역 (예: 강남구, 서초구) */}
                      {group.districts.map((district) => (
                        <button
                          key={district.id}
                          type="button"
                          onClick={() => handleRegionChange(district.id)}
                          className={`w-full rounded-lg px-3 py-2 pl-6 text-left text-sm transition-colors ${
                            selectedRegionId === district.id
                              ? 'bg-[var(--color-gold)] text-[var(--color-primary)] font-semibold'
                              : 'text-[var(--color-text)]/80 hover:bg-[var(--color-primary)]'
                          }`}
                        >
                          {district.label}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-bold">전체 매장</h1>
                <p className="text-sm text-[var(--color-text)]/70">
                  총 {totalCount.toLocaleString('ko-KR')}개의 매장이 있습니다.
                </p>
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
                    다른 지역을 선택해보세요.
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => {
                      setSelectedRegionId(null);
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
