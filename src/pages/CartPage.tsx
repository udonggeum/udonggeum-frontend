import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Navbar,
  Footer,
  Button,
  LoadingSpinner,
  ProductsError,
  CartItem as CartItemComponent,
} from '@/components';
import { NAV_ITEMS } from '@/constants/navigation';
import {
  useCart,
  useRemoveCartItem,
  useUpdateCartItem,
} from '@/hooks/queries/useCartQueries';
import { useAuthStore } from '@/stores/useAuthStore';
import type { CartItem, UpdateCartItemRequest } from '@/schemas/cart';
import { ShoppingBag, ShoppingCart, Trash2, Undo2 } from 'lucide-react';

interface SelectedState {
  [cartItemId: number]: boolean;
}

type OptionSelection = 'keep' | 'none' | number;

function formatCurrency(amount: number | undefined) {
  if (!amount || Number.isNaN(amount)) {
    return '₩0';
  }
  return `₩${amount.toLocaleString('ko-KR')}`;
}

export default function CartPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const {
    data: cartData,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useCart();

  const { mutate: removeCartItem, isPending: isRemoving } = useRemoveCartItem();
  const { mutate: updateCartItem, isPending: isUpdating } = useUpdateCartItem();

  const cartItems = useMemo(() => cartData?.cart_items ?? [], [cartData?.cart_items]);

  const [selectedItems, setSelectedItems] = useState<SelectedState>({});
  const [optionModalItem, setOptionModalItem] = useState<CartItem | null>(null);
  const [optionModalSelection, setOptionModalSelection] = useState<OptionSelection>('keep');
  const [optionModalError, setOptionModalError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedItems((prev) => {
      const next: SelectedState = {};
      cartItems.forEach((item) => {
        if (prev[item.id]) {
          next[item.id] = true;
        }
      });
      return next;
    });
  }, [cartItems]);

  const allSelected = cartItems.length > 0 && cartItems.every((item) => selectedItems[item.id]);

  const selectedCartItems = useMemo(
    () => cartItems.filter((item) => selectedItems[item.id]),
    [cartItems, selectedItems]
  );

  const selectedSummary = useMemo(() => {
    const total = selectedCartItems.reduce((sum, item) => {
      const optionExtra = item.product_option?.additional_price ?? 0;
      const unitPrice = item.product.price + optionExtra;
      return sum + unitPrice * item.quantity;
    }, 0);

    return {
      count: selectedCartItems.length,
      total,
    };
  }, [selectedCartItems]);

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedItems({});
      return;
    }

    const next: SelectedState = {};
    cartItems.forEach((item) => {
      next[item.id] = true;
    });
    setSelectedItems(next);
  };

  const toggleItemSelection = (id: number) => {
    setSelectedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const openOptionModal = (item: CartItem) => {
    if (!item.product.options || item.product.options.length === 0) {
      return;
    }
    setOptionModalItem(item);
    setOptionModalSelection('keep');
    setOptionModalError(null);
  };

  const closeOptionModal = () => {
    setOptionModalItem(null);
    setOptionModalSelection('keep');
    setOptionModalError(null);
  };

  const handleApplyOptionChange = () => {
    if (!optionModalItem) return;

    // API 규칙: product_option_id 생략 → 기존 옵션 유지, null → 옵션 제거, 값 → 해당 옵션으로 변경
    if (optionModalSelection === 'keep') {
      closeOptionModal();
      return;
    }

    const payload: UpdateCartItemRequest = {
      quantity: optionModalItem.quantity,
    };

    if (optionModalSelection === 'none') {
      payload.product_option_id = null;
    } else {
      payload.product_option_id = optionModalSelection;
    }

    updateCartItem(
      {
        id: optionModalItem.id,
        payload,
      },
      {
        onSuccess: () => {
          closeOptionModal();
        },
        onError: (mutationError) => {
          console.error('장바구니 옵션 변경 실패', mutationError);
          setOptionModalError('옵션 변경에 실패했습니다. 다시 시도해주세요.');
        },
      }
    );
  };

  const handleQuantityChange = useCallback((id: number, nextQuantity: number) => {
    if (nextQuantity < 1) return;

    updateCartItem(
      { id, payload: { quantity: nextQuantity } },
      {
        onError: (mutationError) => {
          console.error('장바구니 수량 업데이트 실패', mutationError);
        },
      }
    );
  }, [updateCartItem]);

  const handleRemoveItem = useCallback((id: number) => {
    removeCartItem(id, {
      onError: (mutationError) => {
        console.error('장바구니 항목 삭제 실패', mutationError);
      },
    });
  }, [removeCartItem]);

  const handleRemoveSelected = useCallback(() => {
    selectedCartItems.forEach((item) => {
      removeCartItem(item.id);
    });
    setSelectedItems({});
  }, [selectedCartItems, removeCartItem]);

  const handleProceedToCheckout = useCallback(() => {
    if (selectedSummary.count === 0) {
      alert('결제할 상품을 선택해주세요.');
      return;
    }
    const selectedIds = selectedCartItems.map((item) => item.id);
    void navigate('/order', {
      state: { selectedItemIds: selectedIds },
    });
  }, [selectedSummary.count, selectedCartItems, navigate]);

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar navigationItems={NAV_ITEMS} />
        <main className="flex-grow">
          <div className="container mx-auto max-w-4xl px-4 py-20 text-center">
            <div className="rounded-3xl border border-[var(--color-text)]/10 bg-[var(--color-secondary)] p-12 shadow-sm">
              <ShoppingCart className="mx-auto h-14 w-14 text-[var(--color-gold)]" />
              <h1 className="mt-4 text-2xl font-bold text-[var(--color-text)]">로그인이 필요합니다</h1>
              <p className="mt-2 text-base text-[var(--color-text)]/70">
                장바구니를 확인하려면 먼저 로그인해주세요. 로그인 후 선택한 상품을 확인할 수 있습니다.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <Button
                  onClick={() => {
                    void navigate('/login');
                  }}
                >
                  로그인하기
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    void navigate('/products');
                  }}
                >
                  상품 둘러보기
                </Button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isLoading || isFetching) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar navigationItems={NAV_ITEMS} />
        <main className="flex flex-1 items-center justify-center">
          <LoadingSpinner size="lg" message="장바구니를 불러오는 중입니다." />
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar navigationItems={NAV_ITEMS} />
        <main className="flex-grow">
          <div className="container mx-auto max-w-4xl px-4 py-20">
            <ProductsError
              error={error instanceof Error ? error : new Error('장바구니를 불러오지 못했습니다.')}
              onRetry={() => {
                void refetch();
              }}
            />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isCartEmpty = cartItems.length === 0;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar navigationItems={NAV_ITEMS} />
      <main className="flex-grow">
        <div className="container mx-auto max-w-6xl px-4 py-10">
          <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[var(--color-text)]">장바구니</h1>
              <p className="text-sm text-[var(--color-text)]/70">
                총 {cartData?.count ?? 0}개의 상품이 담겨 있습니다.
              </p>
            </div>
            {!isCartEmpty && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  void refetch();
                }}
              >
                <Undo2 className="h-4 w-4" />
                새로고침
              </Button>
            )}
          </header>

          {isCartEmpty ? (
            <section className="flex flex-col items-center justify-center gap-6 rounded-3xl border border-dashed border-[var(--color-text)]/20 bg-[var(--color-secondary)] py-20 text-center">
              <ShoppingBag className="h-16 w-16 text-[var(--color-text)]/40" />
              <div>
                <h2 className="text-xl font-semibold text-[var(--color-text)]">장바구니가 비어있어요</h2>
                <p className="mt-2 text-sm text-[var(--color-text)]/70">
                  마음에 드는 제품을 장바구니에 담아보세요. 다양한 제품이 기다리고 있어요!
                </p>
              </div>
              <Button
                size="lg"
                onClick={() => {
                  void navigate('/products');
                }}
              >
                상품 보러가기
              </Button>
            </section>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <section className="flex flex-col gap-5">
                <div className="flex items-center justify-between rounded-2xl border border-[var(--color-text)]/10 bg-[var(--color-secondary)] p-4 shadow-sm">
                  <label className="flex items-center gap-3 text-sm font-medium text-[var(--color-text)]">
                    <input
                      type="checkbox"
                      className="checkbox border-[var(--color-gold)] checked:bg-[var(--color-gold)] checked:border-[var(--color-gold)]"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                    />
                    전체 선택 ({selectedSummary.count}/{cartItems.length})
                  </label>
                  <div className="flex items-center gap-3 text-sm text-[var(--color-text)]/70">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={handleRemoveSelected}
                      disabled={selectedSummary.count === 0 || isRemoving}
                    >
                      <Trash2 className="h-4 w-4" />
                      선택 삭제
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <CartItemComponent
                      key={item.id}
                      item={item}
                      isSelected={Boolean(selectedItems[item.id])}
                      isUpdating={isUpdating}
                      isRemoving={isRemoving}
                      onToggleSelection={toggleItemSelection}
                      onQuantityChange={handleQuantityChange}
                      onOpenOptionModal={openOptionModal}
                      onRemove={handleRemoveItem}
                    />
                  ))}
                </div>
              </section>

              <aside className="flex flex-col gap-4">
                <section className="rounded-3xl border border-[var(--color-text)]/10 bg-[var(--color-secondary)] p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-[var(--color-text)]">주문 요약</h2>
                  <div className="mt-4 space-y-3 text-sm text-[var(--color-text)]/70">
                    <div className="flex items-center justify-between">
                      <span>선택 상품 수</span>
                      <span className="font-semibold text-[var(--color-text)]">{selectedSummary.count}개</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>선택 상품 합계</span>
                      <span className="text-base font-semibold text-[var(--color-text)]">
                        {formatCurrency(selectedSummary.total)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t border-[var(--color-text)]/10 pt-3 text-base font-semibold">
                      <span>총 결제 예상 금액</span>
                      <span className="text-[var(--color-gold)]">{formatCurrency(selectedSummary.total)}</span>
                    </div>
                  </div>
                  <Button
                    block
                    size="lg"
                    className="mt-5"
                    onClick={handleProceedToCheckout}
                    disabled={selectedSummary.count === 0}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    선택 상품 결제하기
                  </Button>
                  <Button
                    block
                    size="lg"
                    variant="ghost"
                    className="mt-2"
                    onClick={() => {
                      void navigate('/products');
                    }}
                  >
                    계속 쇼핑하기
                  </Button>
                </section>

                <section className="rounded-3xl border border-[var(--color-text)]/10 bg-[var(--color-secondary)] p-5 text-sm text-[var(--color-text)]/70">
                  <h3 className="text-base font-semibold text-[var(--color-text)]">안내 사항</h3>
                  <ul className="mt-3 space-y-2">
                    <li>장바구니 상품은 최대 30일까지 보관됩니다.</li>
                    <li>상품 가격과 재고는 주문 시점에 확정됩니다.</li>
                    <li>옵션 변경 시 상품 상세 페이지에서 수정 후 다시 담아주세요.</li>
                  </ul>
                </section>
              </aside>
            </div>
          )}
        </div>
      </main>
      <Footer />

      {optionModalItem && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="text-lg font-semibold text-[var(--color-text)]">옵션 변경</h3>
            <p className="mt-2 text-sm text-[var(--color-text)]/70">
              {optionModalItem.product.name}의 옵션을 선택해주세요.
            </p>

            {optionModalItem.product.options && optionModalItem.product.options.length > 0 ? (
              <div className="mt-5 space-y-4">
                <p className="rounded-2xl bg-[var(--color-secondary)]/60 px-4 py-3 text-xs text-[var(--color-text)]/60">
                  옵션을 변경하지 않으면 기존 설정이 유지되며, 옵션 제거를 선택하면 옵션이 삭제됩니다.
                </p>

                {optionModalItem.product.options.length > 6 ? (
                  (() => {
                    const existingOption = optionModalItem.product_option;
                    const selectValue =
                      optionModalSelection === 'keep'
                        ? '__KEEP__'
                        : optionModalSelection === 'none'
                          ? '__NONE__'
                          : String(optionModalSelection);

                    return (
                      <label className="form-control w-full">
                        <span className="label-text text-sm text-[var(--color-text)]">옵션 목록</span>
                        <select
                          className="select select-bordered"
                          value={selectValue}
                          onChange={(event) => {
                            const { value } = event.target;
                            if (value === '__KEEP__') {
                              setOptionModalSelection('keep');
                            } else if (value === '__NONE__') {
                              setOptionModalSelection('none');
                            } else {
                              setOptionModalSelection(Number(value));
                            }
                            setOptionModalError(null);
                          }}
                        >
                          <option value="__KEEP__">
                            현재 옵션 유지 (
                            {existingOption
                              ? `${existingOption.name} · ${existingOption.value}`
                              : '옵션 없음'}
                            )
                          </option>
                          {existingOption && <option value="__NONE__">옵션 제거 (옵션 없이 담기)</option>}
                          {optionModalItem.product.options.map((option) => {
                            const additionalText =
                              option.additional_price && option.additional_price > 0
                                ? `(+₩${option.additional_price.toLocaleString('ko-KR')})`
                                : '';
                            return (
                              <option key={option.id} value={option.id}>
                                {option.name} {option.value} {additionalText}
                              </option>
                            );
                          })}
                        </select>
                      </label>
                    );
                  })()
                ) : (
                  (() => {
                    const existingOption = optionModalItem.product_option;
                    const keepSelected = optionModalSelection === 'keep';
                    const noneSelected = optionModalSelection === 'none';

                    return (
                      <div className="space-y-3">
                        <label
                          className={`flex cursor-pointer flex-col gap-2 rounded-2xl border p-4 transition-all ${
                            keepSelected
                              ? 'border-primary bg-primary/10 shadow-sm'
                              : 'border-base-200 hover:border-primary/60 hover:bg-[var(--color-secondary)]/40'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="space-y-1 text-sm">
                              <p className="font-semibold text-[var(--color-text)]">현재 옵션 유지</p>
                              <p className="text-xs text-[var(--color-text)]/60">
                                {existingOption
                                  ? `${existingOption.name} · ${existingOption.value}`
                                  : '현재 옵션 없음'}
                              </p>
                            </div>
                            <input
                              type="radio"
                              name="cart-option"
                              className="radio radio-primary"
                              checked={keepSelected}
                              onChange={() => {
                                setOptionModalSelection('keep');
                                setOptionModalError(null);
                              }}
                            />
                          </div>
                        </label>

                        {existingOption && (
                          <label
                            className={`flex cursor-pointer flex-col gap-2 rounded-2xl border p-4 transition-all ${
                              noneSelected
                                ? 'border-primary bg-primary/10 shadow-sm'
                                : 'border-base-200 hover:border-primary/60 hover:bg-[var(--color-secondary)]/40'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div className="space-y-1 text-sm">
                                <p className="font-semibold text-[var(--color-text)]">옵션 제거</p>
                                <p className="text-xs text-[var(--color-text)]/60">옵션 없이 담기</p>
                              </div>
                              <input
                                type="radio"
                                name="cart-option"
                                className="radio radio-primary"
                                checked={noneSelected}
                                onChange={() => {
                                  setOptionModalSelection('none');
                                  setOptionModalError(null);
                                }}
                              />
                            </div>
                          </label>
                        )}

                        {optionModalItem.product.options.map((option) => {
                          const isSelected = optionModalSelection === option.id;
                          const additionalText =
                            option.additional_price && option.additional_price > 0
                              ? `+₩${option.additional_price.toLocaleString('ko-KR')}`
                              : '추가 금액 없음';
                          const stockText =
                            option.stock_quantity !== undefined
                              ? `재고 ${option.stock_quantity}개`
                              : '재고 정보 없음';

                          return (
                            <label
                              key={option.id}
                              className={`flex cursor-pointer flex-col gap-2 rounded-2xl border p-4 transition-all ${
                                isSelected
                                  ? 'border-primary bg-primary/10 shadow-sm'
                                  : 'border-base-200 hover:border-primary/60 hover:bg-[var(--color-secondary)]/40'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-4">
                                <div className="space-y-1 text-sm">
                                  <p className="font-semibold text-[var(--color-text)]">
                                    {option.name} {option.value}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-text)]/60">
                                    <span
                                      className={`rounded-full px-3 py-1 font-medium ${
                                        option.additional_price && option.additional_price > 0
                                          ? 'bg-primary/10 text-primary'
                                          : 'bg-[var(--color-secondary)] text-[var(--color-text)]/70'
                                      }`}
                                    >
                                      {additionalText}
                                    </span>
                                    <span>{stockText}</span>
                                  </div>
                                </div>
                                <input
                                  type="radio"
                                  name="cart-option"
                                  className="radio radio-primary"
                                  checked={isSelected}
                                  onChange={() => {
                                    setOptionModalSelection(option.id);
                                    setOptionModalError(null);
                                  }}
                                />
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    );
                  })()
                )}
              </div>
            ) : (
              <p className="mt-5 rounded-2xl bg-[var(--color-secondary)]/60 px-4 py-5 text-sm text-[var(--color-text)]/70">
                변경 가능한 옵션이 없습니다.
              </p>
            )}

            {optionModalError && (
              <p className="mt-4 text-sm text-error">{optionModalError}</p>
            )}

            <div className="modal-action">
              <Button variant="ghost" onClick={closeOptionModal} disabled={isUpdating}>
                취소
              </Button>
              <Button onClick={handleApplyOptionChange} loading={isUpdating} disabled={isUpdating}>
                적용하기
              </Button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button type="button" onClick={closeOptionModal} aria-label="옵션 변경 닫기">
              닫기
            </button>
          </form>
        </dialog>
      )}
    </div>
  );
}
