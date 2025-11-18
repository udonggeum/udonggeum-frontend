import { useMemo, useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Navbar,
  Footer,
  ProductCard,
  ProductsLoadingSkeleton,
  ProductsError,
  ProductsFilterBar,
  PaginationControls,
} from '@/components';
import { useProducts } from '@/hooks/queries/useProductsQueries';
import { useStoreLocations } from '@/hooks/queries/useStoresQueries';
import {
  apiCategoryToUICategory,
  transformProductsFromAPI,
  uiCategoryToAPICategory,
} from '@/utils/apiAdapters';
import { MOCK_CATEGORIES } from '@/constants/mockData';
import { NAV_ITEMS } from '@/constants/navigation';
import type { Product } from '@/types';
import { findRegionIdByNames, getRegionOptions, type RegionOption } from '@/utils/regionOptions';

const PAGE_SIZE = 12;

const SORT_OPTIONS = [
  { id: 'latest', label: '신상품순', value: 'latest' as const },
  { id: 'popularity', label: '인기순', value: 'popularity' as const },
  { id: 'wishlist', label: '찜많은순', value: 'wishlist' as const },
  { id: 'views', label: '조회순', value: 'views' as const },
  { id: 'price_asc', label: '낮은 가격순', value: 'price_asc' as const },
  { id: 'price_desc', label: '높은 가격순', value: 'price_desc' as const },
];

export default function ProductsPage() {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const regionParam = searchParams.get('region');
  const districtParam = searchParams.get('district');
  const regionIdParam = searchParams.get('regionId') ?? searchParams.get('region_id');

  const [selectedSort, setSelectedSort] = useState<(typeof SORT_OPTIONS)[number]['value']>('latest');
  const [currentPage, setCurrentPage] = useState(1);

  const { data: locationsData } = useStoreLocations();

  const regionOptions: RegionOption[] = useMemo(
    () => getRegionOptions(locationsData),
    [locationsData]
  );

  const resolvedRegionIdFromParams = useMemo(
    () => findRegionIdByNames(regionOptions, regionParam, districtParam, regionIdParam ?? null),
    [regionOptions, regionParam, districtParam, regionIdParam]
  );

  const resolvedCategoryIdFromParams = useMemo(
    () => mapCategoryParamToId(categoryParam),
    [categoryParam]
  );

  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(resolvedRegionIdFromParams);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    resolvedCategoryIdFromParams
  );

  const lastRegionParamRef = useRef(resolvedRegionIdFromParams);
  const lastCategoryParamRef = useRef(resolvedCategoryIdFromParams);

  useEffect(() => {
    if (lastRegionParamRef.current !== resolvedRegionIdFromParams) {
      lastRegionParamRef.current = resolvedRegionIdFromParams;
      setSelectedRegionId(resolvedRegionIdFromParams);
    }
  }, [resolvedRegionIdFromParams]);

  useEffect(() => {
    if (lastCategoryParamRef.current !== resolvedCategoryIdFromParams) {
      lastCategoryParamRef.current = resolvedCategoryIdFromParams;
      setSelectedCategoryId(resolvedCategoryIdFromParams);
    }
  }, [resolvedCategoryIdFromParams]);

  const selectedRegion = regionOptions.find((region) => region.id === selectedRegionId);

  const {
    data: productsData,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useProducts({
    page: currentPage,
    page_size: PAGE_SIZE,
    category: uiCategoryToAPICategory(selectedCategoryId),
    sort: selectedSort,
    region: selectedRegion?.region,
    district: selectedRegion?.district,
  });

  const products: Product[] = useMemo(() => {
    if (!productsData) {
      return [];
    }
    return transformProductsFromAPI(productsData.products);
  }, [productsData]);

  const pageSizeFromResponse = productsData?.page_size ?? PAGE_SIZE;

  const totalPages = useMemo(() => {
    const totalCount = productsData?.count ?? 0;
    return Math.max(1, Math.ceil(totalCount / pageSizeFromResponse));
  }, [productsData?.count, pageSizeFromResponse]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedRegionId, selectedCategoryId, selectedSort]);

  const handleWishlist = (productId: string) => {
    console.log('Wishlist toggle requested for product', productId);
  };

  const handleAddToCart = (productId: string) => {
    console.log('Add to cart requested for product', productId);
  };

  const isEmpty = !isLoading && !isFetching && products.length === 0;

  return (
    <div className="flex min-h-screen flex-col bg-base-100">
      <Navbar navigationItems={NAV_ITEMS} />
      <main className="flex-grow">
        <ProductsFilterBar
          regions={regionOptions}
          categories={MOCK_CATEGORIES}
          selectedRegionId={selectedRegionId}
          selectedCategoryId={selectedCategoryId}
          onRegionChange={(regionId) => setSelectedRegionId(regionId)}
          onCategoryChange={(categoryId) => setSelectedCategoryId(categoryId)}
        />

        <section className="container mx-auto px-4 py-10">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold">전체 상품</h1>
              <p className="text-sm text-base-content/70">
                총 {products.length}개의 상품이 있습니다.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm text-base-content/60">
                {selectedRegion ? selectedRegion.label : '전체 지역'} ·{' '}
                {selectedCategoryId
                  ? MOCK_CATEGORIES.find((category) => category.id === selectedCategoryId)?.name ?? '전체 상품'
                  : '전체 상품'}
              </div>
              <div className="dropdown dropdown-end">
                <label tabIndex={0} className="btn btn-sm btn-outline gap-1">
                  {SORT_OPTIONS.find((opt) => opt.value === selectedSort)?.label ?? '정렬'}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-4 w-4"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </label>
                <ul
                  tabIndex={0}
                  className="menu dropdown-content z-[1] mt-2 w-40 rounded-box bg-base-100 p-2 shadow-lg"
                >
                  {SORT_OPTIONS.map((option) => (
                    <li key={option.id}>
                      <button
                        type="button"
                        className={selectedSort === option.value ? 'active' : ''}
                        onClick={() => setSelectedSort(option.value)}
                      >
                        {option.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {isLoading ? (
            <ProductsLoadingSkeleton count={PAGE_SIZE} />
          ) : error ? (
            <ProductsError
              error={error instanceof Error ? error : new Error('상품을 불러오지 못했습니다.')}
              onRetry={() => {
                void refetch();
              }}
            />
          ) : isEmpty ? (
            <div className="flex flex-col items-center justify-center gap-4 rounded-xl bg-base-200 py-20 text-center">
              <h2 className="text-xl font-semibold">조건에 맞는 상품이 없습니다</h2>
              <p className="text-base-content/70">
                다른 지역이나 카테고리를 선택하여 다시 검색해보세요.
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setSelectedRegionId(null);
                  setSelectedCategoryId(null);
                  setSelectedSort('latest');
                }}
              >
                필터 초기화
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onWishlist={handleWishlist}
                    onAddToCart={handleAddToCart}
                  />
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

const CATEGORY_ID_SET = new Set(MOCK_CATEGORIES.map((category) => category.id));

function mapCategoryParamToId(paramValue: string | null): string | null {
  if (!paramValue) {
    return null;
  }

  const trimmed = paramValue.trim();
  if (!trimmed) {
    return null;
  }

  if (CATEGORY_ID_SET.has(trimmed)) {
    return trimmed;
  }

  const converted = apiCategoryToUICategory(trimmed);
  return converted ?? null;
}
