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
import { OptionChangeModal, CartSummary, type OptionSelection } from '@/components/cart';
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
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

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

  // Clear checkout error when selection changes
  useEffect(() => {
    setCheckoutError(null);
  }, [selectedSummary.count]);

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
        onError: () => {
          setOptionModalError('옵션 변경에 실패했습니다. 다시 시도해주세요.');
        },
      }
    );
  };

  const handleQuantityChange = useCallback((id: number, nextQuantity: number) => {
    if (nextQuantity < 1) return;
    updateCartItem({ id, payload: { quantity: nextQuantity } });
  }, [updateCartItem]);

  const handleRemoveItem = useCallback((id: number) => {
    removeCartItem(id);
  }, [removeCartItem]);

  const handleRemoveSelected = useCallback(() => {
    selectedCartItems.forEach((item) => {
      removeCartItem(item.id);
    });
    setSelectedItems({});
  }, [selectedCartItems, removeCartItem]);

  const handleProceedToCheckout = useCallback(() => {
    if (selectedSummary.count === 0) {
      setCheckoutError('결제할 상품을 선택해주세요.');
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

              <CartSummary
                selectedCount={selectedSummary.count}
                selectedTotal={selectedSummary.total}
                onCheckout={handleProceedToCheckout}
                onContinueShopping={() => {
                  void navigate('/products');
                }}
                checkoutError={checkoutError}
              />
            </div>
          )}
        </div>
      </main>
      <Footer />

      <OptionChangeModal
        item={optionModalItem}
        selection={optionModalSelection}
        error={optionModalError}
        isUpdating={isUpdating}
        onSelectionChange={setOptionModalSelection}
        onClose={closeOptionModal}
        onApply={handleApplyOptionChange}
      />
    </div>
  );
}
