import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  AlertTriangle,
  CircleDollarSign,
  CreditCard,
  Heart,
  ShoppingCart,
  Store as StoreIcon,
} from 'lucide-react';
import { Navbar, Footer, Button, ProductsError, QuantitySelector } from '@/components';
import {
  LoginRequiredModal,
  CartSuccessModal,
  OptionSelector,
  StoreInfoCard,
  PriceDisplay,
} from '@/components/product';
import { useProductDetail } from '@/hooks/queries/useProductsQueries';
import { transformProductFromAPI } from '@/utils/apiAdapters';
import { useAuthStore } from '@/stores/useAuthStore';
import { useAddToCart } from '@/hooks/queries/useCartQueries';
import { useWishlist, useAddToWishlist, useRemoveFromWishlist } from '@/hooks/queries/useWishlistQueries';
import { NAVIGATION_ITEMS } from '@/constants/navigation';
import FallbackImage from '@/components/FallbackImage';

function ProductDetailSkeleton() {
  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col gap-10 px-4 py-10">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="skeleton h-80 w-full rounded-2xl bg-[var(--color-secondary)]" />
        <div className="flex flex-col gap-6">
          <div className="skeleton h-10 w-3/4 rounded bg-[var(--color-secondary)]" />
          <div className="space-y-3">
            <div className="skeleton h-6 w-1/2 rounded bg-[var(--color-secondary)]" />
            <div className="skeleton h-6 w-1/3 rounded bg-[var(--color-secondary)]" />
          </div>
          <div className="space-y-4">
            <div className="skeleton h-12 w-full rounded bg-[var(--color-secondary)]" />
            <div className="skeleton h-12 w-full rounded bg-[var(--color-secondary)]" />
          </div>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="skeleton h-40 w-full rounded-2xl bg-[var(--color-secondary)]" />
        <div className="skeleton h-40 w-full rounded-2xl bg-[var(--color-secondary)]" />
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();

  const numericProductId = useMemo(() => {
    const parsed = Number(productId);
    return Number.isFinite(parsed) ? parsed : null;
  }, [productId]);

  const {
    data: productDetail,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useProductDetail(numericProductId ?? 0, {
    enabled: numericProductId !== null,
  });

  const uiProduct = useMemo(
    () => (productDetail ? transformProductFromAPI(productDetail) : null),
    [productDetail]
  );

  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [optionError, setOptionError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isCartResultModalOpen, setIsCartResultModalOpen] = useState(false);
  const [shouldShake, setShouldShake] = useState(false);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const {
    mutate: addToCart,
    isPending: isAddingToCart,
    reset: resetAddToCartState,
  } = useAddToCart();

  const { data: wishlistData } = useWishlist(isAuthenticated);
  const { mutate: addToWishlist, isPending: isAddingToWishlist } = useAddToWishlist();
  const { mutate: removeFromWishlist, isPending: isRemovingFromWishlist } = useRemoveFromWishlist();

  const isInWishlist = useMemo(() => {
    if (!productDetail || !wishlistData?.wishlist_items) return false;
    return wishlistData.wishlist_items.some(
      (item) => item.product_id === productDetail.id
    );
  }, [productDetail, wishlistData]);

  useEffect(() => {
    if (!productDetail?.options?.length) {
      setSelectedOptionId(null);
      return;
    }

    const defaultOption = productDetail.options.find((option) => option.is_default);
    if (defaultOption) {
      setSelectedOptionId(defaultOption.id);
    } else {
      setSelectedOptionId(null);
    }
  }, [productDetail]);

  useEffect(() => {
    setOptionError(null);
    setFeedbackMessage(null);
  }, [selectedOptionId]);

  useEffect(() => {
    setFeedbackMessage(null);
  }, [quantity]);

  if (numericProductId === null) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar navigationItems={NAVIGATION_ITEMS} />
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-20">
            <ProductsError
              error={new Error('잘못된 상품 ID입니다.')}
              onRetry={() => {
                void navigate('/products');
              }}
            />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleRequireLogin = () => {
    setIsLoginModalOpen(true);
  };

  const handleAddToCart = () => {
    if (!productDetail) {
      setFeedbackMessage('상품 정보를 불러오지 못했습니다.');
      return;
    }

    if (productDetail.options?.length && !selectedOptionId) {
      setOptionError('옵션을 선택해 주세요.');
      // Shake 애니메이션 트리거
      setShouldShake(true);
      setTimeout(() => setShouldShake(false), 500);
      return;
    }

    if (!isAuthenticated) {
      handleRequireLogin();
      return;
    }

    addToCart(
      {
        product_id: productDetail.id,
        product_option_id: selectedOptionId ?? undefined,
        quantity,
      },
      {
        onSuccess: () => {
          setIsCartResultModalOpen(true);
          setFeedbackMessage(null);
          resetAddToCartState();
        },
        onError: (mutationError) => {
          setFeedbackMessage(
            mutationError instanceof Error
              ? mutationError.message
              : '장바구니 담기에 실패했습니다. 다시 시도해 주세요.'
          );
        },
      }
    );
  };

  const handleBuyNow = () => {
    if (!productDetail) {
      setFeedbackMessage('상품 정보를 불러오지 못했습니다.');
      return;
    }

    if (productDetail.options?.length && !selectedOptionId) {
      setOptionError('옵션을 선택해 주세요.');
      // Shake 애니메이션 트리거
      setShouldShake(true);
      setTimeout(() => setShouldShake(false), 500);
      return;
    }

    if (!isAuthenticated) {
      handleRequireLogin();
      return;
    }

    // 바로구매: 장바구니를 거치지 않고 주문 페이지로 직접 이동
    const selectedOption = productDetail.options?.find(
      (opt) => opt.id === selectedOptionId
    );

    void navigate('/order', {
      state: {
        directPurchase: {
          product: productDetail,
          product_option: selectedOption,
          quantity,
        },
      },
    });
  };

  const closeLoginModal = () => setIsLoginModalOpen(false);
  const closeCartModal = () => setIsCartResultModalOpen(false);

  const handleQuantityChange = (value: number) => {
    if (Number.isNaN(value) || value < 1) return;
    setQuantity(value);
  };

  const handleToggleWishlist = () => {
    if (!productDetail) return;

    if (!isAuthenticated) {
      handleRequireLogin();
      return;
    }

    if (isInWishlist) {
      removeFromWishlist(productDetail.id);
    } else {
      addToWishlist(productDetail.id);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar navigationItems={NAVIGATION_ITEMS} />
      <main className="flex-grow">
        {isLoading || isFetching ? (
          <ProductDetailSkeleton />
        ) : error ? (
          <div className="container mx-auto px-4 py-20">
            <ProductsError
              error={
                error instanceof Error
                  ? error
                  : new Error('상품을 불러오지 못했습니다.')
              }
              onRetry={() => {
                void refetch();
              }}
            />
          </div>
        ) : !productDetail ? (
          <div className="container mx-auto px-4 py-20">
            <ProductsError
              error={new Error('상품 정보를 찾을 수 없습니다.')}
              onRetry={() => {
                void navigate('/products');
              }}
            />
          </div>
        ) : (
          <div className="container mx-auto max-w-7xl px-4 py-10">
            {/* Back Button */}
            <div className="mb-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="h-4 w-4" />
                이전으로
              </Button>
            </div>

            <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,520px)_1fr] xl:grid-cols-[minmax(0,580px)_1fr]">
              <div className="rounded-3xl bg-[var(--color-secondary)] p-6 shadow-lg lg:self-start border border-[var(--color-text)]/10 relative">
                <FallbackImage
                  src={uiProduct?.imageUrl}
                  alt={uiProduct?.imageAlt || '상품 이미지'}
                  className="h-[420px] w-full rounded-2xl object-cover shadow-md md:h-[480px] xl:h-[520px]"
                />
                {/* Wishlist Button on Image */}
                <Button
                  variant="ghost"
                  size="md"
                  className="btn-circle absolute bottom-10 right-10 bg-[var(--color-primary)]/80 backdrop-blur-sm hover:bg-[var(--color-primary)] shadow-lg"
                  onClick={handleToggleWishlist}
                  disabled={isAddingToWishlist || isRemovingFromWishlist}
                  aria-label={isInWishlist ? '찜 취소' : '찜하기'}
                >
                  <Heart
                    className={`w-6 h-6 ${
                      isInWishlist
                        ? 'fill-[var(--color-gold)] text-[var(--color-gold)]'
                        : 'text-[var(--color-text)]'
                    }`}
                  />
                </Button>
              </div>

              <div className="flex flex-col gap-6">
                <section className="rounded-3xl border border-[var(--color-text)]/10 bg-[var(--color-secondary)] p-6 shadow-sm">
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="badge badge-outline border-[var(--color-gold)] text-[var(--color-gold)]">
                            {productDetail.category}
                          </span>
                          {productDetail.stock_quantity === 0 && (
                            <span className="badge badge-lg bg-error/10 text-error border-error/30 border font-semibold">
                              품절
                            </span>
                          )}
                        </div>
                        <h1 className="text-3xl font-bold leading-tight text-[var(--color-text)]">
                          {productDetail.name}
                        </h1>
                      </div>
                      <div className="shrink-0 rounded-full bg-[var(--color-gold)]/10 px-4 py-2">
                        <PriceDisplay price={productDetail.price} size="xl" />
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--color-text)]/70">
                      <div className="flex items-center gap-1">
                        <StoreIcon className="h-4 w-4 text-[var(--color-gold)]" />
                        {productDetail.store?.id ? (
                          <Link
                            to={`/stores/${productDetail.store.id}`}
                            className="text-[var(--color-gold)] hover:underline"
                          >
                            {productDetail.store.name}
                          </Link>
                        ) : (
                          <span>매장 정보 없음</span>
                        )}
                      </div>
                      <span className="h-1 w-1 rounded-full bg-[var(--color-text)]/40" />
                      <span className={productDetail.stock_quantity === 0 ? 'text-error font-semibold' : ''}>
                        재고 {productDetail.stock_quantity ?? 0}개
                      </span>
                    </div>
                  </div>
                </section>

                {/* 옵션 선택 섹션 - 강조 스타일 */}
                <section className={`rounded-3xl border-2 border-[var(--color-gold)] bg-gradient-to-br from-[var(--color-gold)]/10 to-transparent p-6 shadow-md ${shouldShake ? 'animate-shake' : ''}`}>
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <h2 className="text-xl font-bold text-[var(--color-text)] flex items-center gap-2">
                      구매 옵션
                      {productDetail.options && productDetail.options.length > 0 && (
                        <span className="text-error text-2xl">*</span>
                      )}
                    </h2>
                    {productDetail.options && productDetail.options.length > 0 && (
                      <span className="badge badge-lg badge-error gap-1.5 font-semibold">
                        <AlertTriangle className="w-4 h-4" />
                        필수 선택
                      </span>
                    )}
                  </div>
                  <OptionSelector
                    options={productDetail.options}
                    selectedOptionId={selectedOptionId}
                    onOptionChange={setSelectedOptionId}
                  />
                  {optionError && (
                    <div role="alert" className="alert alert-error mt-4 shadow-lg">
                      <AlertTriangle className="w-5 h-5" />
                      <div>
                        <h3 className="font-bold">옵션을 선택해주세요</h3>
                        <div className="text-sm">{optionError}</div>
                      </div>
                    </div>
                  )}
                </section>

                {/* 수량 선택 및 CTA 버튼 - 모바일에서 Sticky */}
                <section className="rounded-3xl border border-[var(--color-text)]/10 bg-[var(--color-secondary)] shadow-sm lg:p-6 lg:static lg:border-[var(--color-text)]/10">
                  <div className="flex flex-col gap-6 lg:block">
                    <div className="flex flex-wrap items-center justify-between gap-4 p-6 lg:p-0 lg:mb-6">
                      <h2 className="text-lg font-semibold text-[var(--color-text)]">구매 수량</h2>
                      <QuantitySelector
                        quantity={quantity}
                        onDecrease={() => handleQuantityChange(quantity - 1)}
                        onIncrease={() => handleQuantityChange(quantity + 1)}
                        onChange={handleQuantityChange}
                      />
                    </div>

                    {feedbackMessage && (
                      <div className="rounded-2xl border border-error/40 bg-error/10 px-4 py-3 text-sm text-error mx-6 lg:mx-0 lg:mb-6">
                        {feedbackMessage}
                      </div>
                    )}

                    {productDetail.stock_quantity === 0 && (
                      <div className="rounded-2xl border border-error/40 bg-error/10 px-4 py-3 text-sm text-error font-semibold text-center mx-6 lg:mx-0 lg:mb-6">
                        죄송합니다. 이 상품은 현재 품절되었습니다.
                      </div>
                    )}

                    {/* CTA 버튼 - 모바일에서 sticky bottom */}
                    <div className="sticky bottom-0 bg-[var(--color-secondary)] p-4 border-t border-[var(--color-text)]/10 lg:static lg:border-none lg:p-0 shadow-[0_-4px_12px_rgba(0,0,0,0.1)] lg:shadow-none">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Button
                          block
                          size="lg"
                          className="gap-2 sm:gap-3"
                          loading={isAddingToCart}
                          onClick={handleAddToCart}
                          disabled={productDetail.stock_quantity === 0}
                        >
                          <ShoppingCart className="h-5 w-5" />
                          {productDetail.stock_quantity === 0 ? '품절' : '장바구니 담기'}
                        </Button>
                        <Button
                          variant="outline"
                          size="lg"
                          block
                          onClick={handleBuyNow}
                          disabled={productDetail.stock_quantity === 0}
                        >
                          <CreditCard className="h-5 w-5" />
                          {productDetail.stock_quantity === 0 ? '품절' : '바로 구매'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 매장 정보 - 항상 펼쳐진 상태 */}
                <section className="rounded-3xl border border-[var(--color-text)]/10 bg-[var(--color-secondary)] p-6 shadow-sm">
                  <h2 className="flex items-center gap-2 text-xl font-bold text-[var(--color-text)] mb-4">
                    <StoreIcon className="h-5 w-5 text-[var(--color-gold)]" />
                    매장 안내
                  </h2>
                  <StoreInfoCard store={productDetail.store} storeLocation={uiProduct?.storeLocation} />
                </section>

                {/* 상품 상세 정보 - 항상 펼쳐진 상태 */}
                <section className="rounded-3xl border border-[var(--color-text)]/10 bg-[var(--color-secondary)] p-6 shadow-sm">
                  <h2 className="flex items-center gap-2 text-xl font-bold text-[var(--color-text)] mb-4">
                    <CircleDollarSign className="h-5 w-5 text-[var(--color-gold)]" />
                    상품 상세
                  </h2>
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-line text-sm leading-7 text-[var(--color-text)]/70">
                      {productDetail.description
                        ? productDetail.description
                        : '등록된 상품 설명이 없습니다.'}
                    </p>
                  </div>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {productDetail.material && (
                      <div className="rounded-2xl bg-[var(--color-primary)] px-4 py-3 border border-[var(--color-text)]/10">
                        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text)]/60">
                          소재
                        </span>
                        <p className="mt-1 text-sm text-[var(--color-text)]">
                          {productDetail.material}
                        </p>
                      </div>
                    )}
                    {productDetail.weight && (
                      <div className="rounded-2xl bg-[var(--color-primary)] px-4 py-3 border border-[var(--color-text)]/10">
                        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text)]/60">
                          중량
                        </span>
                        <p className="mt-1 text-sm text-[var(--color-text)]">
                          {productDetail.weight}g
                        </p>
                      </div>
                    )}
                    {productDetail.purity && (
                      <div className="rounded-2xl bg-[var(--color-primary)] px-4 py-3 border border-[var(--color-text)]/10">
                        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text)]/60">
                          순도
                        </span>
                        <p className="mt-1 text-sm text-[var(--color-text)]">
                          {productDetail.purity}
                        </p>
                      </div>
                    )}
                    <div className="rounded-2xl bg-[var(--color-primary)] px-4 py-3 border border-[var(--color-text)]/10">
                      <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text)]/60">
                        재고
                      </span>
                      <p className="mt-1 text-sm text-[var(--color-text)]">
                        {productDetail.stock_quantity ?? 0}개
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />

      <LoginRequiredModal
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
        onLogin={() => {
          closeLoginModal();
          void navigate('/login', { replace: false });
        }}
      />

      <CartSuccessModal
        isOpen={isCartResultModalOpen}
        onClose={closeCartModal}
        onGoToCart={() => {
          closeCartModal();
          void navigate('/cart');
        }}
      />
    </div>
  );
}
