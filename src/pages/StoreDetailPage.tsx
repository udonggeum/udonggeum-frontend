import { useMemo, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Navbar,
  Footer,
  Button,
  LoadingSpinner,
  ErrorAlert,
  ProductCard,
  ProductsLoadingSkeleton,
  FallbackImage,
} from '@/components';
import { MapPin, Phone, Clock, PackageSearch, ArrowLeft, ExternalLink } from 'lucide-react';
import { useStoreDetail } from '@/hooks/queries/useStoresQueries';
import { useStoreProducts } from '@/hooks/queries/useProductsQueries';
import { NAV_ITEMS } from '@/constants/navigation';
import { MOCK_CATEGORIES } from '@/constants/mockData';
import {
  buildCategoryLabelMap,
  mapStoreDetailToSummary,
} from '@/utils/storeAdapters';
import { transformProductsFromAPI } from '@/utils/apiAdapters';
import type { StoreSummary, Product } from '@/types';

const CATEGORY_LABEL_MAP = buildCategoryLabelMap(MOCK_CATEGORIES);

export default function StoreDetailPage() {
  const navigate = useNavigate();
  const params = useParams<{ storeId: string }>();

  const storeId = useMemo(() => {
    if (!params.storeId) return undefined;
    const parsed = Number(params.storeId);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
  }, [params.storeId]);

  const {
    data: storeDetail,
    isLoading,
    error,
    refetch,
  } = useStoreDetail(storeId ?? 0, true, {
    enabled: Boolean(storeId),
  });

  const storeSummary: StoreSummary | null = useMemo(() => {
    if (!storeDetail) return null;
    return mapStoreDetailToSummary(storeDetail, CATEGORY_LABEL_MAP);
  }, [storeDetail]);

  const {
    data: storeProductsData,
    isLoading: productsLoading,
    isFetching: isFetchingProducts,
    error: productsError,
    refetch: refetchProducts,
  } = useStoreProducts(storeId, {
    include_options: true,
    page_size: 24,
  });

  const categoryCounts = storeSummary?.categoryCounts ?? [];
  const totalProductCount = storeProductsData?.count ?? storeSummary?.productCount;

  const products: Product[] = useMemo(() => {
    if (!storeProductsData?.products) {
      return [];
    }
    try {
      return transformProductsFromAPI(storeProductsData.products);
    } catch (transformError) {
      console.error('Failed to transform store products', transformError);
      return [];
    }
  }, [storeProductsData?.products]);

  const locationText = useMemo(() => {
    if (!storeSummary) return '';
    return [storeSummary.region, storeSummary.district]
      .filter((value): value is string => Boolean(value))
      .join(' ');
  }, [storeSummary]);

  const sanitizedPhone = useMemo(() => {
    if (!storeSummary?.phone) return '';
    return storeSummary.phone.replace(/[^0-9+]/g, '');
  }, [storeSummary?.phone]);

  const mapSearchQuery = useMemo(() => {
    if (!storeSummary) return '';
    return (
      storeSummary.address?.trim() ||
      `${locationText} ${storeSummary.name}`.trim()
    );
  }, [storeSummary, locationText]);

  const mapUrl = mapSearchQuery
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapSearchQuery)}`
    : undefined;

  const handleBack = () => {
    void navigate(-1);
  };

  const handleRetry = () => {
    void refetch();
  };

  const handleGoStores = () => {
    void navigate('/stores');
  };

  const isInvalidId = !storeId;

  if (isInvalidId) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar navigationItems={NAV_ITEMS} />
        <main className="flex-grow">
          <section className="container mx-auto px-4 py-16">
            <ErrorAlert
              title="잘못된 접근입니다"
              message="유효하지 않은 매장 ID입니다. 매장 목록에서 다시 선택해주세요."
              onRetry={handleGoStores}
            />
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  let mainContent: ReactNode;

  if (isLoading) {
    mainContent = (
      <section className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner message="매장 정보를 불러오는 중입니다..." />
      </section>
    );
  } else if (error) {
    mainContent = (
      <section className="container mx-auto px-4 py-16">
        <ErrorAlert
          title="매장을 불러오지 못했습니다"
          message={
            error instanceof Error
              ? error.message
              : '매장 정보를 불러오는 중 문제가 발생했습니다.'
          }
          onRetry={handleRetry}
          error={error instanceof Error ? error : undefined}
        />
      </section>
    );
  } else if (!storeSummary) {
    mainContent = (
      <section className="container mx-auto px-4 py-16">
        <div className="rounded-xl bg-[var(--color-secondary)] py-16 text-center text-[var(--color-text)]/70">
          매장 정보를 찾을 수 없습니다. 다른 매장을 선택해주세요.
        </div>
      </section>
    );
  } else {
    mainContent = (
      <>
        <section className="bg-[var(--color-secondary)] py-10">
          <div className="container mx-auto px-4">
            <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-[var(--color-text)]/70">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBack}
              >
                <ArrowLeft className="h-4 w-4" />
                이전으로
              </Button>
              <span className="hidden sm:block">|</span>
              <span>
                {storeSummary.region ?? '지역 정보 없음'} ·{' '}
                {storeSummary.district ?? '세부 지역 정보 없음'}
              </span>
            </div>

            <div className="grid gap-10 lg:grid-cols-[2fr_3fr]">
              <div className="overflow-hidden rounded-2xl bg-[var(--color-primary)] shadow-xl border border-[var(--color-text)]/10">
                <FallbackImage
                  src={storeSummary.imageUrl}
                  alt={`${storeSummary.name} 매장 이미지`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>

              <div className="flex flex-col justify-between gap-6">
                <div className="space-y-4">
                  <span className="badge badge-outline border-[var(--color-gold)] text-[var(--color-gold)]">매장 정보</span>
                  <h1 className="text-4xl font-bold leading-tight text-[var(--color-text)]">
                    {storeSummary.name}
                  </h1>
                  {storeSummary.description && (
                    <p className="text-lg text-[var(--color-text)]/80 leading-relaxed">
                      {storeSummary.description}
                    </p>
                  )}
                  <p className="flex items-start gap-2 text-base text-[var(--color-text)]/70">
                    <MapPin className="mt-1 h-5 w-5 text-[var(--color-gold)]" />
                    <span>
                      {[locationText, storeSummary.address]
                        .filter((value): value is string => Boolean(value))
                        .join(' ')}
                    </span>
                  </p>
                </div>

                {categoryCounts.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {categoryCounts.map((category) => (
                      <span
                        key={category.id}
                        className="badge badge-lg gap-2 bg-[var(--color-gold)]/10 border-[var(--color-gold)] text-[var(--color-gold)] shadow-sm"
                      >
                        {category.name}
                        <span className="text-sm font-semibold">
                          {category.count.toLocaleString('ko-KR')}개
                        </span>
                      </span>
                    ))}
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-[var(--color-primary)] p-5 shadow-sm border border-[var(--color-text)]/10">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-[var(--color-gold)]/10 p-2 text-[var(--color-gold)]">
                        <PackageSearch className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[var(--color-text)]/60">등록 상품</p>
                        <p className="text-xl font-semibold text-[var(--color-text)]">
                          {typeof totalProductCount === 'number'
                            ? `${totalProductCount.toLocaleString('ko-KR')}개`
                            : '정보 준비 중'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-[var(--color-primary)] p-5 shadow-sm border border-[var(--color-text)]/10">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-[var(--color-gold)]/10 p-2 text-[var(--color-gold)]">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[var(--color-text)]/60">영업시간</p>
                        <p className="text-lg font-semibold text-[var(--color-text)]">
                          {storeSummary.businessHours ?? '정보 준비 중'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-[var(--color-primary)] p-5 shadow-sm border border-[var(--color-text)]/10">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-[var(--color-gold)]/10 p-2 text-[var(--color-gold)]">
                        <Phone className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[var(--color-text)]/60">연락처</p>
                        <p className="text-lg font-semibold text-[var(--color-text)]">
                          {storeSummary.phone ?? '정보 준비 중'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-[var(--color-primary)] p-5 shadow-sm border border-[var(--color-text)]/10">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-[var(--color-gold)]/10 p-2 text-[var(--color-gold)]">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[var(--color-text)]/60">지역</p>
                        <p className="text-lg font-semibold text-[var(--color-text)]">
                          {locationText || '정보 준비 중'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {sanitizedPhone ? (
                    <a
                      href={`tel:${sanitizedPhone}`}
                      className="btn bg-[var(--color-gold)] hover:bg-[var(--color-gold)]/80 text-[var(--color-primary)] border-[var(--color-gold)]"
                      aria-label={`${storeSummary.name}에 전화하기`}
                    >
                      <Phone className="h-5 w-5" />
                      전화 연결
                    </a>
                  ) : (
                    <Button variant="ghost" className="border-[var(--color-text)]/20 text-[var(--color-text)]/50" disabled>
                      연락처 정보 준비 중
                    </Button>
                  )}

                  {mapUrl ? (
                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn border-[var(--color-gold)] text-[var(--color-gold)] hover:bg-[var(--color-gold)] hover:text-[var(--color-primary)]"
                    >
                      <ExternalLink className="h-5 w-5" />
                      지도에서 보기
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[var(--color-text)]">매장 상품</h2>
              <p className="text-sm text-[var(--color-text)]/60">
                {typeof totalProductCount === 'number'
                  ? `총 ${totalProductCount.toLocaleString('ko-KR')}개의 상품이 등록되어 있습니다.`
                  : '등록된 상품 정보를 불러오고 있습니다.'}
              </p>
            </div>
            {isFetchingProducts && (
              <span className="text-sm text-[var(--color-gold)]">데이터 새로고침 중...</span>
            )}
          </div>

          {productsError ? (
            <ErrorAlert
              title="상품을 불러오지 못했습니다"
              message={
                productsError instanceof Error
                  ? productsError.message
                  : '상품 정보를 불러오는 중 문제가 발생했습니다.'
              }
              onRetry={() => {
                void refetchProducts();
              }}
              error={productsError instanceof Error ? productsError : undefined}
            />
          ) : productsLoading ? (
            <ProductsLoadingSkeleton count={8} />
          ) : products.length === 0 ? (
            <div className="rounded-xl bg-[var(--color-secondary)] py-16 text-center text-[var(--color-text)]/70">
              아직 등록된 상품이 없습니다. 곧 업데이트될 예정입니다.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar navigationItems={NAV_ITEMS} />
      <main className="flex-grow">{mainContent}</main>
      <Footer />
    </div>
  );
}
