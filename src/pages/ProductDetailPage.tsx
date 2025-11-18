import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronDown,
  ChevronUp,
  CircleDollarSign,
  CreditCard,
  MapPin,
  Phone,
  ShoppingCart,
  Store as StoreIcon,
} from 'lucide-react';
import { Navbar, Footer, Button, ProductsError } from '@/components';
import { useProductDetail } from '@/hooks/queries/useProductsQueries';
import { transformProductFromAPI } from '@/utils/apiAdapters';
import { useAuthStore } from '@/stores/useAuthStore';
import { useAddToCart } from '@/hooks/queries/useCartQueries';
import { NAV_ITEMS } from '@/constants/navigation';
import FallbackImage from '@/components/FallbackImage';

function formatPrice(price?: number) {
  if (typeof price !== 'number') return '가격 정보 없음';
  return `₩${price.toLocaleString('ko-KR')}`;
}

function ProductDetailSkeleton() {
  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col gap-10 px-4 py-10">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="skeleton h-80 w-full rounded-2xl" />
        <div className="flex flex-col gap-6">
          <div className="skeleton h-10 w-3/4 rounded" />
          <div className="space-y-3">
            <div className="skeleton h-6 w-1/2 rounded" />
            <div className="skeleton h-6 w-1/3 rounded" />
          </div>
          <div className="space-y-4">
            <div className="skeleton h-12 w-full rounded" />
            <div className="skeleton h-12 w-full rounded" />
          </div>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="skeleton h-40 w-full rounded-2xl" />
        <div className="skeleton h-40 w-full rounded-2xl" />
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
  const [isStoreInfoOpen, setIsStoreInfoOpen] = useState(false);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const {
    mutate: addToCart,
    isPending: isAddingToCart,
    reset: resetAddToCartState,
  } = useAddToCart();

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
      <div className="flex min-h-screen flex-col bg-base-100">
        <Navbar navigationItems={NAV_ITEMS} />
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

  const renderOptions = () => {
    if (!productDetail?.options?.length) {
      return (
        <p className="rounded-2xl border border-dashed border-base-300 bg-base-200/60 px-4 py-5 text-sm text-base-content/70">
          옵션이 없는 단일 상품입니다.
        </p>
      );
    }

    const options = productDetail.options;
    const hasManyOptions = options.length > 6;
    const currentOption =
      options.find((option) => option.id === selectedOptionId) ?? null;

    if (hasManyOptions) {
      return (
        <div className="space-y-4">
          <label className="input input-bordered flex items-center gap-2">
            <span className="text-sm font-medium text-base-content">옵션 선택</span>
            <select
              className="select select-bordered w-full"
              value={selectedOptionId ?? ''}
              onChange={(event) => {
                const value = event.target.value;
                setSelectedOptionId(value ? Number(value) : null);
              }}
            >
              <option value="">옵션을 선택해 주세요</option>
              {options.map((option) => {
                const priceSuffix =
                  option.additional_price && option.additional_price > 0
                    ? ` (+₩${option.additional_price.toLocaleString('ko-KR')})`
                    : '';
                return (
                  <option key={option.id} value={option.id}>
                    {option.name} {option.value} {priceSuffix}
                  </option>
                );
              })}
            </select>
          </label>

          {currentOption ? (
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 text-sm text-base-content/80">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-semibold text-base-content">
                  {currentOption.name} {currentOption.value}
                </p>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  추가 금액{' '}
                  {currentOption.additional_price && currentOption.additional_price > 0
                    ? `+₩${currentOption.additional_price.toLocaleString('ko-KR')}`
                    : '없음'}
                </span>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <p className="rounded-xl bg-base-200/60 px-3 py-2 text-xs text-base-content/70">
                  재고{' '}
                  {currentOption.stock_quantity !== undefined
                    ? `${currentOption.stock_quantity}개`
                    : '정보 없음'}
                </p>
                <p className="rounded-xl bg-base-200/60 px-3 py-2 text-xs text-base-content/70">
                  기본 옵션 여부 {currentOption.is_default ? '예' : '아니요'}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-base-content/60">
              사용할 옵션을 선택해 주세요. 옵션별 추가 금액과 재고를 확인할 수 있습니다.
            </p>
          )}
        </div>
      );
    }

    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const hasAdditionalPrice =
            option.additional_price && option.additional_price > 0;

          const additionalText = hasAdditionalPrice
            ? `+₩${option.additional_price.toLocaleString('ko-KR')}`
            : '추가 금액 없음';

          const stockText =
            option.stock_quantity !== undefined
              ? `재고 ${option.stock_quantity}개`
              : '재고 정보 없음';

          const isSelected = selectedOptionId === option.id;

          return (
            <label
              key={option.id}
              className={`group flex cursor-pointer flex-col gap-3 rounded-2xl border p-4 transition-all ${
                isSelected
                  ? 'border-primary bg-primary/10 shadow-sm'
                  : 'border-base-200 hover:border-primary/60 hover:bg-base-200/40'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-base-content">
                    {option.name} {option.value}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-base-content/60">
                    <span
                      className={`rounded-full px-3 py-1 font-medium ${
                        hasAdditionalPrice
                          ? 'bg-primary/10 text-primary'
                          : 'bg-base-200 text-base-content/70'
                      }`}
                    >
                      {additionalText}
                    </span>
                    <span>{stockText}</span>
                  </div>
                </div>
                <input
                  type="radio"
                  name="product-option"
                  className="radio radio-primary"
                  checked={isSelected}
                  onChange={() => setSelectedOptionId(option.id)}
                />
              </div>
            </label>
          );
        })}
      </div>
    );
  };

  const renderLoginModal = () => {
    if (!isLoginModalOpen) return null;

    return (
      <dialog className="modal modal-open">
        <div className="modal-box">
          <h3 className="text-lg font-bold">로그인이 필요합니다</h3>
          <p className="py-3 text-sm text-base-content/70">
            장바구니 담기 기능을 이용하려면 먼저 로그인해 주세요.
          </p>
          <div className="modal-action flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                closeLoginModal();
              }}
            >
              취소
            </Button>
            <Button
              onClick={() => {
                closeLoginModal();
                void navigate('/login', { replace: false });
              }}
            >
              로그인하기
            </Button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button
            type="button"
            aria-label="모달 닫기"
            onClick={closeLoginModal}
          >
            닫기
          </button>
        </form>
      </dialog>
    );
  };

  const renderCartModal = () => {
    if (!isCartResultModalOpen) return null;

    return (
      <dialog className="modal modal-open">
        <div className="modal-box">
          <h3 className="text-lg font-bold">장바구니에 담았습니다</h3>
          <p className="py-3 text-sm text-base-content/70">
            계속 쇼핑하시겠어요, 아니면 장바구니를 확인하시겠어요?
          </p>
          <div className="modal-action flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                closeCartModal();
              }}
            >
              더 둘러보기
            </Button>
            <Button
              onClick={() => {
                closeCartModal();
                void navigate('/cart');
              }}
            >
              장바구니로 이동
            </Button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button
            type="button"
            aria-label="모달 닫기"
            onClick={closeCartModal}
          >
            닫기
          </button>
        </form>
      </dialog>
    );
  };

  const handleQuantityChange = (value: number) => {
    if (Number.isNaN(value) || value < 1) return;
    setQuantity(value);
  };

  return (
    <div className="flex min-h-screen flex-col bg-base-100">
      <Navbar navigationItems={NAV_ITEMS} />
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
            <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,520px)_1fr] xl:grid-cols-[minmax(0,580px)_1fr]">
              <div className="rounded-3xl bg-base-200/70 p-6 shadow-lg lg:self-start">
                <FallbackImage
                  src={uiProduct?.imageUrl}
                  alt={uiProduct?.imageAlt || '상품 이미지'}
                  className="h-[420px] w-full rounded-2xl object-cover shadow-md md:h-[480px] xl:h-[520px]"
                />
              </div>

              <div className="flex flex-col gap-6">
                <section className="rounded-3xl border border-base-200 bg-base-100 p-6 shadow-sm">
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-3">
                        <span className="badge badge-outline badge-primary">
                          {productDetail.category}
                        </span>
                        <h1 className="text-3xl font-bold leading-tight text-base-content">
                          {productDetail.name}
                        </h1>
                      </div>
                      <div className="shrink-0 rounded-full bg-primary/10 px-4 py-2 text-xl font-semibold text-primary">
                        {formatPrice(productDetail.price)}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-base-content/70">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span>{uiProduct?.storeLocation ?? '지역 정보 없음'}</span>
                      </div>
                      <span className="h-1 w-1 rounded-full bg-base-content/40" />
                      <span>재고 {productDetail.stock_quantity ?? 0}개</span>
                    </div>
                  </div>
                </section>

                <section className="rounded-3xl border border-base-200 bg-base-100 p-6 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold text-base-content">
                      구매 옵션
                    </h2>
                    <span className="badge badge-sm badge-outline text-xs">
                      {productDetail.options?.length ? '옵션 선택 필수' : '단일 상품'}
                    </span>
                  </div>
                  <div className="mt-4">{renderOptions()}</div>
                  {optionError && (
                    <p className="mt-3 text-sm text-error">{optionError}</p>
                  )}
                </section>

                <section className="rounded-3xl border border-base-200 bg-base-100 p-6 shadow-sm">
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <h2 className="text-lg font-semibold text-base-content">구매 수량</h2>
                      <div className="join rounded-full border border-base-200 bg-base-100">
                        <button
                          type="button"
                          className="btn join-item btn-outline"
                          onClick={() => handleQuantityChange(quantity - 1)}
                          disabled={quantity <= 1}
                          aria-label="수량 줄이기"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min={1}
                          value={quantity}
                          onChange={(event) =>
                            handleQuantityChange(Number(event.target.value))
                          }
                          className="join-item input input-bordered w-20 text-center font-semibold"
                          aria-label="구매 수량"
                        />
                        <button
                          type="button"
                          className="btn join-item btn-outline"
                          onClick={() => handleQuantityChange(quantity + 1)}
                          aria-label="수량 늘리기"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {feedbackMessage && (
                      <div className="rounded-2xl border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">
                        {feedbackMessage}
                      </div>
                    )}

                    <div className="grid gap-3 sm:grid-cols-2">
                      <Button
                        block
                        size="lg"
                        className="gap-2 sm:gap-3"
                        loading={isAddingToCart}
                        onClick={handleAddToCart}
                      >
                        <ShoppingCart className="h-5 w-5" />
                        장바구니 담기
                      </Button>
                      <Button
                        block
                        size="lg"
                        variant="secondary"
                        className="gap-2 sm:gap-3"
                        onClick={handleBuyNow}
                      >
                        <CreditCard className="h-5 w-5" />
                        바로 구매
                      </Button>
                    </div>
                  </div>
                </section>

                <section className="rounded-3xl border border-base-200 bg-base-100 p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-base-content">
                      <StoreIcon className="h-5 w-5 text-primary" />
                      매장 정보
                    </h2>
                    <button
                      type="button"
                      className="btn btn-sm btn-ghost text-sm"
                      onClick={() => setIsStoreInfoOpen((prev) => !prev)}
                      aria-expanded={isStoreInfoOpen}
                      aria-controls="product-store-info"
                    >
                      {isStoreInfoOpen ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {isStoreInfoOpen && (
                    <div
                      id="product-store-info"
                      className="mt-4 grid gap-3 sm:grid-cols-2"
                    >
                      <div className="flex items-start gap-3 rounded-2xl bg-base-200/60 px-4 py-3">
                        <div className="rounded-full bg-primary/10 p-2 text-primary">
                          <StoreIcon className="h-4 w-4" />
                        </div>
                        <div className="text-sm">
                          <p className="font-semibold text-base-content">매장명</p>
                          <p className="text-base-content/70">
                            {productDetail.store?.name ?? '정보 없음'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 rounded-2xl bg-base-200/60 px-4 py-3">
                        <div className="rounded-full bg-primary/10 p-2 text-primary">
                          <MapPin className="h-4 w-4" />
                        </div>
                        <div className="text-sm">
                          <p className="font-semibold text-base-content">위치</p>
                          <p className="text-base-content/70">
                            {uiProduct?.storeLocation ?? '지역 정보 없음'}
                          </p>
                        </div>
                      </div>
                      {productDetail.store?.phone_number && (
                        <div className="flex items-start gap-3 rounded-2xl bg-base-200/60 px-4 py-3 sm:col-span-2">
                          <div className="rounded-full bg-primary/10 p-2 text-primary">
                            <Phone className="h-4 w-4" />
                          </div>
                          <div className="text-sm">
                            <p className="font-semibold text-base-content">연락처</p>
                            <a
                              href={`tel:${productDetail.store.phone_number}`}
                              className="link link-primary text-base-content"
                            >
                              {productDetail.store.phone_number}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </section>

                <section className="rounded-3xl border border-base-200 bg-base-100 p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-base-content">
                      <CircleDollarSign className="h-5 w-5 text-primary" />
                      상품 정보
                    </h2>
                    <button
                      type="button"
                      className="btn btn-sm btn-ghost text-sm"
                      onClick={() => setIsDescriptionOpen((prev) => !prev)}
                      aria-expanded={isDescriptionOpen}
                      aria-controls="product-description"
                    >
                      {isDescriptionOpen ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {isDescriptionOpen && (
                    <div id="product-description">
                      <p className="mt-3 whitespace-pre-line text-sm leading-7 text-base-content/70">
                        {productDetail.description
                          ? productDetail.description
                          : '등록된 상품 설명이 없습니다.'}
                      </p>
                      <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        {productDetail.material && (
                          <div className="rounded-2xl bg-base-200/60 px-4 py-3">
                            <span className="text-xs font-semibold uppercase tracking-wide text-base-content/60">
                              소재
                            </span>
                            <p className="mt-1 text-sm text-base-content">
                              {productDetail.material}
                            </p>
                          </div>
                        )}
                        {productDetail.weight && (
                          <div className="rounded-2xl bg-base-200/60 px-4 py-3">
                            <span className="text-xs font-semibold uppercase tracking-wide text-base-content/60">
                              중량
                            </span>
                            <p className="mt-1 text-sm text-base-content">
                              {productDetail.weight}g
                            </p>
                          </div>
                        )}
                        {productDetail.purity && (
                          <div className="rounded-2xl bg-base-200/60 px-4 py-3">
                            <span className="text-xs font-semibold uppercase tracking-wide text-base-content/60">
                              순도
                            </span>
                            <p className="mt-1 text-sm text-base-content">
                              {productDetail.purity}
                            </p>
                          </div>
                        )}
                        <div className="rounded-2xl bg-base-200/60 px-4 py-3">
                          <span className="text-xs font-semibold uppercase tracking-wide text-base-content/60">
                            재고
                          </span>
                          <p className="mt-1 text-sm text-base-content">
                            {productDetail.stock_quantity ?? 0}개
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </section>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />

      {renderLoginModal()}
      {renderCartModal()}
    </div>
  );
}
