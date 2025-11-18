import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Navbar,
  Footer,
  Button,
  LoadingSpinner,
  ErrorAlert,
  FallbackImage,
} from '@/components';
import { NAV_ITEMS } from '@/constants/navigation';
import {
  useCart,
  useRemoveCartItem,
  useUpdateCartItem,
} from '@/hooks/queries/useCartQueries';
import { useCreateOrder } from '@/hooks/queries/useOrdersQueries';
import { useAddresses } from '@/hooks/queries/useAddressQueries';
import { useAuthStore } from '@/stores/useAuthStore';
import type { CartItem } from '@/schemas/cart';
import type { Address } from '@/schemas/address';
import {
  AlertTriangle,
  ChevronRight,
  Info,
  MapPin,
  Package,
  ShoppingBag,
  Trash2,
  Truck,
} from 'lucide-react';

interface OrderLocationState {
  selectedItemIds?: number[];
}

interface ShippingFormState {
  recipient: string;
  phone: string;
  postalCode: string;
  address1: string;
  address2: string;
  saveAsDefault: boolean;
}

interface SavedAddress extends ShippingFormState {
  id: string;
  label: string;
}

type FulfillmentType = 'delivery' | 'pickup';

type FieldName = 'recipient' | 'phone' | 'postalCode' | 'address1';
interface PickupStoreInfo {
  id?: number;
  name: string;
  address?: string | null;
  contact?: string | null;
}

const DELIVERY_FEE = 3000;
const MAX_MEMO_LENGTH = 200;

function formatCurrency(amount: number) {
  if (!Number.isFinite(amount)) {
    return '₩0';
  }
  return `₩${amount.toLocaleString('ko-KR')}`;
}

function buildShippingAddress(form: ShippingFormState) {
  return `(${form.postalCode}) ${form.address1} ${form.address2}`.trim();
}

/**
 * Transform API Address to OrderPage SavedAddress format
 * Maps backend fields (zip_code, address, detail_address) to UI fields
 */
function transformAddressToSavedAddress(address: Address): SavedAddress {
  return {
    id: address.id.toString(),
    label: address.name,
    recipient: address.recipient,
    phone: address.phone,
    postalCode: address.zip_code,
    address1: address.address,
    address2: address.detail_address,
    saveAsDefault: address.is_default,
  };
}

export default function OrderPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const locationState = location.state as OrderLocationState | undefined;
  const selectedItemIds = locationState?.selectedItemIds;

  const {
    data: cartData,
    isLoading: isCartLoading,
    isFetching: isCartFetching,
    error: cartError,
    refetch: refetchCart,
  } = useCart();

  const { mutate: updateCartItem, isPending: isUpdatingCart } = useUpdateCartItem();
  const { mutate: removeCartItem, isPending: isRemovingCart } = useRemoveCartItem();
  const { mutate: createOrder, isPending: isSubmittingOrder } = useCreateOrder();

  // Fetch addresses from API
  const {
    data: addressesData,
    isLoading: isAddressesLoading,
    error: addressesError,
  } = useAddresses();

  // Transform API addresses to SavedAddress format
  const savedAddresses = useMemo<SavedAddress[]>(() => {
    if (addressesData?.addresses && addressesData.addresses.length > 0) {
      return addressesData.addresses.map(transformAddressToSavedAddress);
    }

    // Fallback: create a default address from user data if no saved addresses
    if (user?.name && user?.phone) {
      return [
        {
          id: 'user-default',
          label: '기본 정보',
          recipient: user.name,
          phone: user.phone,
          postalCode: '',
          address1: '',
          address2: '',
          saveAsDefault: false,
        },
      ];
    }

    // Empty array if no user data
    return [];
  }, [addressesData?.addresses, user?.name, user?.phone]);

  const defaultAddress = savedAddresses[0];
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    defaultAddress?.id ?? 'manual'
  );

  const [shippingForm, setShippingForm] = useState<ShippingFormState>({
    recipient: defaultAddress?.recipient ?? user?.name ?? '',
    phone: defaultAddress?.phone ?? user?.phone ?? '',
    postalCode: defaultAddress?.postalCode ?? '',
    address1: defaultAddress?.address1 ?? '',
    address2: defaultAddress?.address2 ?? '',
    saveAsDefault: false,
  });

  useEffect(() => {
    if (!selectedAddressId || selectedAddressId === 'manual') return;
    const matched = savedAddresses.find((address) => address.id === selectedAddressId);
    if (matched) {
      setShippingForm((prev) => ({
        ...prev,
        recipient: matched.recipient,
        phone: matched.phone,
        postalCode: matched.postalCode,
        address1: matched.address1,
        address2: matched.address2,
      }));
    }
  }, [savedAddresses, selectedAddressId]);

  const filteredCartSelection = useMemo(() => {
    if (!cartData?.cart_items) return [];
    if (!selectedItemIds || selectedItemIds.length === 0) {
      return cartData.cart_items;
    }
    return cartData.cart_items.filter((item) => selectedItemIds.includes(item.id));
  }, [cartData?.cart_items, selectedItemIds]);

  const [orderItems, setOrderItems] = useState<CartItem[]>(filteredCartSelection);

  useEffect(() => {
    setOrderItems(filteredCartSelection);
  }, [filteredCartSelection]);

  const [markedItems, setMarkedItems] = useState<Record<number, boolean>>({});
  useEffect(() => {
    setMarkedItems((prev) => {
      const next: Record<number, boolean> = {};
      orderItems.forEach((item) => {
        next[item.id] = prev[item.id] ?? false;
      });
      return next;
    });
  }, [orderItems]);

  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>('delivery');
  const [orderMemo, setOrderMemo] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const itemsSubtotal = useMemo(() => {
    return orderItems.reduce((sum, item) => {
      const optionExtra = item.product_option?.additional_price ?? 0;
      const unitPrice = item.product.price + optionExtra;
      return sum + unitPrice * item.quantity;
    }, 0);
  }, [orderItems]);

  const shippingFee = fulfillmentType === 'delivery' ? DELIVERY_FEE : 0;
  const totalDue = Math.max(itemsSubtotal + shippingFee, 0);

  const lowStockItems = orderItems.filter(
    (item) => item.product.stock_quantity > 0 && item.product.stock_quantity <= 3
  );
  const hasInsufficientStock = orderItems.some(
    (item) => item.product.stock_quantity < item.quantity
  );

  const pickupStoreInfos = useMemo<PickupStoreInfo[]>(() => {
    const map = new Map<number | undefined, PickupStoreInfo>();
    orderItems.forEach((item) => {
      const store = item.product.store;
      const key = store?.id ?? item.product.store_id;
      if (!map.has(key)) {
        map.set(key, {
          id: key,
          name: store?.name ?? `매장 #${key ?? '미확인'}`,
          address: store?.address,
          contact: store?.phone_number,
        });
      }
    });
    return Array.from(map.values());
  }, [orderItems]);

  const markedCount = useMemo(
    () => Object.values(markedItems).filter(Boolean).length,
    [markedItems]
  );

  const missingSelectionCount = selectedItemIds
    ? selectedItemIds.length - filteredCartSelection.length
    : 0;

  const validateField = (name: FieldName, value: string) => {
    let message = '';
    if (name === 'recipient' && !value.trim()) {
      message = '수령인을 입력해주세요.';
    }
    if (name === 'phone') {
      if (!value.trim()) {
        message = '연락처를 입력해주세요.';
      } else if (!/^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/.test(value.trim())) {
        message = '010-1234-5678 형식으로 입력해주세요.';
      }
    }
    if (name === 'postalCode') {
      if (!value.trim()) {
        message = '우편번호를 입력해주세요.';
      } else if (!/^\d{5}$/.test(value.trim())) {
        message = '5자리 우편번호를 입력해주세요.';
      }
    }
    if (name === 'address1' && !value.trim()) {
      message = '도로명 주소를 입력해주세요.';
    }

    setFormErrors((prev) => ({
      ...prev,
      [name]: message,
    }));
    return message === '';
  };

  const validateForm = () => {
    const fieldNames: FieldName[] = ['recipient', 'phone', 'postalCode', 'address1'];
    let isValid = true;

    if (fulfillmentType === 'delivery') {
      fieldNames.forEach((field) => {
        const result = validateField(field, shippingForm[field]);
        if (!result) {
          isValid = false;
        }
      });
    } else {
      // 픽업일 경우 배송지 필수값 초기화
      setFormErrors((prev) => ({
        ...prev,
        recipient: '',
        phone: '',
        postalCode: '',
        address1: '',
      }));
    }

    return isValid;
  };

  const handleShippingInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const target = event.currentTarget;
    const { name, value } = target;
    const isCheckbox =
      target instanceof HTMLInputElement && target.type === 'checkbox';

    setShippingForm((prev) => ({
      ...prev,
      [name]: isCheckbox ? target.checked : value,
    }));

    if (touchedFields[name]) {
      if (name === 'address2' || name === 'saveAsDefault') return;
      validateField(name as FieldName, value);
    }
  };

  const handleFieldBlur = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.currentTarget;
    setTouchedFields((prev) => ({
      ...prev,
      [name]: true,
    }));
    if (name === 'address2' || name === 'saveAsDefault') return;
    validateField(name as FieldName, value);
  };

  const handleQuantityChange = (itemId: number, quantity: number) => {
    if (quantity < 1) return;
    setOrderItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity } : item))
    );
    updateCartItem(
      {
        id: itemId,
        payload: { quantity },
      },
      {
        onError: (mutationError) => {
          console.error('주문 페이지 수량 변경 실패', mutationError);
          refetchCart();
        },
      }
    );
  };

  const handleRemoveItem = (itemId: number) => {
    const previousItems = orderItems;
    setOrderItems((prev) => prev.filter((item) => item.id !== itemId));
    removeCartItem(itemId, {
      onError: (mutationError) => {
        console.error('주문 페이지 상품 삭제 실패', mutationError);
        setOrderItems(previousItems);
      },
    });
  };

  const handleRemoveSelected = () => {
    const targets = orderItems.filter((item) => markedItems[item.id]);
    if (targets.length === 0) return;
    const remaining = orderItems.filter((item) => !markedItems[item.id]);
    setOrderItems(remaining);
    targets.forEach((item) => {
      removeCartItem(item.id, {
        onError: (mutationError) => {
          console.error('선택 삭제 실패', mutationError);
          refetchCart();
        },
      });
    });
    setMarkedItems({});
  };

  const handleClearAll = () => {
    if (orderItems.length === 0) return;
    setOrderItems([]);
    orderItems.forEach((item) => {
      removeCartItem(item.id, {
        onError: (mutationError) => {
          console.error('전체 삭제 실패', mutationError);
          refetchCart();
        },
      });
    });
    setMarkedItems({});
  };

  const handleProceedToPayment = () => {
    setSubmitError(null);
    const isValid = validateForm();
    if (!isValid || hasInsufficientStock || orderItems.length === 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (fulfillmentType === 'pickup' && pickupStoreInfos.length === 0) {
      setSubmitError('픽업 가능한 매장 정보를 찾을 수 없습니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    const inferredPickupStoreId = pickupStoreInfos[0]?.id;

    const payload =
      fulfillmentType === 'delivery'
        ? {
            fulfillment_type: 'delivery' as const,
            shipping_address: `${shippingForm.recipient} | ${shippingForm.phone} | ${buildShippingAddress(shippingForm)}`,
          }
        : {
            fulfillment_type: 'pickup' as const,
            pickup_store_id: inferredPickupStoreId,
          };

    createOrder(
      payload,
      {
        onSuccess: (response) => {
          navigate('/cart', {
            replace: true,
            state: {
              orderId: response.order.id,
              totalDue,
            },
          });
        },
        onError: (error) => {
          setSubmitError(error.message);
        },
      }
    );
  };

  const hasDeliveryAddress = Boolean(
    shippingForm.recipient &&
      shippingForm.phone &&
      shippingForm.postalCode &&
      shippingForm.address1
  );

  const isCTAEnabled =
    orderItems.length > 0 &&
    !hasInsufficientStock &&
    (fulfillmentType === 'delivery' ? hasDeliveryAddress : true) &&
    !isSubmittingOrder;

  if (isCartLoading && orderItems.length === 0) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F7F8FA]">
        <Navbar navigationItems={NAV_ITEMS} />
        <main className="flex flex-1 items-center justify-center px-4">
          <LoadingSpinner message="주문 정보를 준비하고 있습니다..." />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F7F8FA] pb-28 md:pb-0">
      <Navbar navigationItems={NAV_ITEMS} />
      <main className="flex-1">
        <div className="container mx-auto max-w-6xl px-4 py-10">
          <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-base-content/70">
            {['홈', '장바구니', '주문', '결제'].map((label, index, arr) => {
              const isLast = index === arr.length - 1;
              const href =
                label === '홈' ? '/' : label === '장바구니' ? '/cart' : undefined;
              return (
                <div key={label} className="flex items-center gap-2">
                  {href ? (
                    <button
                      type="button"
                      className="text-base-content/70 hover:text-primary"
                      onClick={() => {
                        void navigate(href);
                      }}
                    >
                      {label}
                    </button>
                  ) : (
                    <span className={isLast ? 'font-semibold text-base-content' : ''}>
                      {label}
                    </span>
                  )}
                  {!isLast && <ChevronRight className="h-4 w-4 text-base-content/30" />}
                </div>
              );
            })}
          </div>

          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-wide text-primary">Order</p>
              <h1 className="mt-1 text-3xl font-bold text-base-content">주문</h1>
              <p className="text-sm text-base-content/70">
                선택한 상품 정보를 확인하고 배송 또는 픽업 정보를 입력하세요.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-base-100 px-4 py-3 text-sm shadow-sm">
              <Truck className="h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold text-base-content">결제 단계 전 확인</p>
                <p className="text-xs text-base-content/60">
                  모든 정보가 정확한지 확인 후 결제하기로 이동합니다.
                </p>
              </div>
            </div>
          </div>

          {cartError && (
            <div className="mb-6">
              <ErrorAlert
                title="장바구니 정보를 불러오지 못했습니다"
                message={cartError.message}
                onRetry={() => {
                  void refetchCart();
                }}
              />
            </div>
          )}

          {!selectedItemIds?.length && (
            <div className="alert alert-info mb-6">
              <Info className="h-5 w-5" />
              <span>장바구니에서 선택한 상품 정보가 없어 전체 상품을 불러왔습니다.</span>
            </div>
          )}

          {missingSelectionCount > 0 && (
            <div className="alert alert-warning mb-6">
              <AlertTriangle className="h-5 w-5" />
              <span>
                선택했던 상품 {missingSelectionCount}개를 찾을 수 없습니다. 장바구니 정보를
                새로고침해주세요.
              </span>
            </div>
          )}

          {lowStockItems.length > 0 && (
            <div className="alert alert-info mb-6">
              <Package className="h-5 w-5" />
              <span>
                {lowStockItems.map((item) => item.product.name).join(', ')} 상품의 재고가 얼마 남지
                않았습니다.
              </span>
            </div>
          )}

          {hasInsufficientStock && (
            <div className="alert alert-error mb-6">
              <AlertTriangle className="h-5 w-5" />
              <span>일부 상품 수량이 재고보다 많습니다. 수량을 조정해주세요.</span>
            </div>
          )}

          {submitError && (
            <div className="mb-6">
              <ErrorAlert
                title="주문을 생성하지 못했습니다"
                message={submitError}
                onRetry={handleProceedToPayment}
              />
            </div>
          )}

          {addressesError && (
            <div className="alert alert-warning mb-6">
              <AlertTriangle className="h-5 w-5" />
              <div>
                <p className="font-semibold">저장된 배송지를 불러오지 못했습니다</p>
                <p className="text-sm">{addressesError.message}</p>
                <p className="text-xs mt-1">직접 입력하거나 나중에 다시 시도해주세요.</p>
              </div>
            </div>
          )}

          {isAddressesLoading && (
            <div className="alert alert-info mb-6">
              <Info className="h-5 w-5" />
              <span>저장된 배송지 정보를 불러오는 중...</span>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
            <div className="space-y-6">
              <section className="rounded-3xl border border-base-200 bg-base-100 p-6 shadow-sm">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-base-content/60">주문 상품</p>
                    <h2 className="text-xl font-semibold text-base-content">
                      총 {orderItems.length}개
                    </h2>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm checkbox-primary"
                        checked={
                          orderItems.length > 0 &&
                          orderItems.every((item) => markedItems[item.id])
                        }
                        onChange={(event) => {
                          const checked = event.target.checked;
                          const next: Record<number, boolean> = {};
                          orderItems.forEach((item) => {
                            next[item.id] = checked;
                          });
                          setMarkedItems(next);
                        }}
                      />
                      <span>전체 선택</span>
                    </label>
                    <span className="text-base-content/40">|</span>
                    <button
                      type="button"
                      className="btn btn-link btn-xs text-base-content/70"
                      onClick={handleClearAll}
                      disabled={orderItems.length === 0 || isRemovingCart}
                    >
                      전체 삭제
                    </button>
                    <button
                      type="button"
                      className="btn btn-link btn-xs text-base-content/70"
                      onClick={handleRemoveSelected}
                      disabled={markedCount === 0 || isRemovingCart}
                    >
                      선택 삭제 ({markedCount})
                    </button>
                  </div>
                </div>

                {orderItems.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-base-300 bg-base-200/50 p-10 text-center">
                    <ShoppingBag className="mx-auto h-12 w-12 text-base-content/40" />
                    <p className="mt-4 text-base font-semibold text-base-content">
                      주문할 상품이 없습니다
                    </p>
                    <p className="mt-2 text-sm text-base-content/60">
                      장바구니에서 상품을 선택한 뒤 다시 시도해주세요.
                    </p>
                    <Button
                      className="mt-4"
                      onClick={() => {
                        void navigate('/cart');
                      }}
                    >
                      장바구니로 이동
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orderItems.map((item) => {
                      const optionExtra = item.product_option?.additional_price ?? 0;
                      const unitPrice = item.product.price + optionExtra;
                      const itemTotal = unitPrice * item.quantity;
                      const remainingStock = item.product.stock_quantity;
                      const isLowStock = remainingStock > 0 && remainingStock <= 3;
                      const insufficient = remainingStock < item.quantity;
                      return (
                        <article
                          key={item.id}
                          className="rounded-3xl border border-base-200 bg-base-50 p-4 shadow-sm"
                        >
                          <div className="flex flex-col gap-4 md:flex-row md:items-start">
                            <div className="flex items-start gap-3">
                              <input
                                type="checkbox"
                                className="checkbox checkbox-primary mt-2"
                                checked={Boolean(markedItems[item.id])}
                                onChange={() =>
                                  setMarkedItems((prev) => ({
                                    ...prev,
                                    [item.id]: !prev[item.id],
                                  }))
                                }
                                aria-label="삭제 대상 선택"
                              />
                              <div className="h-24 w-24 overflow-hidden rounded-2xl border border-base-200">
                                <FallbackImage
                                  src={item.product.image_url}
                                  alt={item.product.name}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            </div>

                            <div className="flex flex-1 flex-col gap-3">
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                  <p className="text-lg font-semibold text-base-content">
                                    {item.product.name}
                                  </p>
                                  <p className="text-sm text-base-content/60">
                                    {item.product_option
                                      ? `${item.product_option.name} · ${item.product_option.value}`
                                      : '옵션 없음'}
                                  </p>
                                  {item.product.store?.name && (
                                    <p className="text-xs text-base-content/50">
                                      {item.product.store.name}
                                    </p>
                                  )}
                                </div>
                                <div className="text-right">
                                  <p className="text-lg font-semibold text-primary">
                                    {formatCurrency(unitPrice)}
                                  </p>
                                  <p className="text-xs text-base-content/60">
                                    수량 {item.quantity}개 · 소계 {formatCurrency(itemTotal)}
                                  </p>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-3">
                                <div className="join rounded-full border border-base-200 bg-base-100">
                                  <button
                                    type="button"
                                    className="btn join-item btn-sm btn-outline"
                                    onClick={() =>
                                      handleQuantityChange(item.id, item.quantity - 1)
                                    }
                                    disabled={item.quantity <= 1 || isUpdatingCart}
                                  >
                                    -
                                  </button>
                                  <span className="join-item px-4 text-sm font-semibold">
                                    {item.quantity}
                                  </span>
                                  <button
                                    type="button"
                                    className="btn join-item btn-sm btn-outline"
                                    onClick={() =>
                                      handleQuantityChange(item.id, item.quantity + 1)
                                    }
                                    disabled={isUpdatingCart}
                                  >
                                    +
                                  </button>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveItem(item.id)}
                                  disabled={isRemovingCart}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  삭제
                                </Button>
                              </div>

                              <div className="flex flex-wrap gap-3 text-xs text-base-content/60">
                                <span className="badge badge-outline border-dashed">
                                  {fulfillmentType === 'delivery'
                                    ? '배송 준비: 평균 2~3일'
                                    : '픽업 준비: 준비 완료 시 알림'}
                                </span>
                                {isLowStock && !insufficient && (
                                  <span className="flex items-center gap-1 text-warning">
                                    <AlertTriangle className="h-3 w-3" />
                                    남은 재고 {remainingStock}개
                                  </span>
                                )}
                                {insufficient && (
                                  <span className="flex items-center gap-1 text-error">
                                    <AlertTriangle className="h-3 w-3" />
                                    재고 부족
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}

              </section>

              <section className="rounded-3xl border border-base-200 bg-base-100 p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <Truck className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-base-content/60">수령 방법</p>
                    <h2 className="text-lg font-semibold text-base-content">배송 또는 픽업 선택</h2>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <button
                    type="button"
                    className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${
                      fulfillmentType === 'delivery'
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-base-200 hover:border-base-300'
                    }`}
                    onClick={() => setFulfillmentType('delivery')}
                    aria-pressed={fulfillmentType === 'delivery'}
                  >
                    <span className="rounded-full bg-primary/10 p-3 text-primary">
                      <Truck className="h-5 w-5" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-base-content">배송 받기</p>
                        {fulfillmentType === 'delivery' && (
                          <span className="badge badge-primary badge-outline badge-sm">선택됨</span>
                        )}
                      </div>
                      <p className="text-sm text-base-content/70">
                        집이나 회사 등 원하는 주소로 안전하게 배송됩니다.
                      </p>
                      <p className="mt-1 text-xs text-base-content/50">
                        기본 배송비 {formatCurrency(DELIVERY_FEE)} · 평균 2~3일 소요
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${
                      fulfillmentType === 'pickup'
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-base-200 hover:border-base-300'
                    }`}
                    onClick={() => setFulfillmentType('pickup')}
                    aria-pressed={fulfillmentType === 'pickup'}
                  >
                    <span className="rounded-full bg-primary/10 p-3 text-primary">
                      <Package className="h-5 w-5" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-base-content">매장 픽업</p>
                        {fulfillmentType === 'pickup' && (
                          <span className="badge badge-primary badge-outline badge-sm">선택됨</span>
                        )}
                      </div>
                      <p className="text-sm text-base-content/70">
                        가까운 우동금 센터를 방문해 직접 수령할 수 있어요.
                      </p>
                      <p className="mt-1 text-xs text-base-content/50">추가 비용 없음 · 준비되면 알림</p>
                    </div>
                  </button>
                </div>

                <p className="mt-4 text-sm text-base-content/70">
                  {fulfillmentType === 'delivery'
                    ? '배송을 선택하면 아래에서 배송지 정보를 입력해주세요.'
                    : '픽업을 선택하면 방문할 센터를 선택한 뒤 안내에 따라 수령해 주세요.'}
                </p>
              </section>

              {fulfillmentType === 'delivery' && (
                <section className="rounded-3xl border border-base-200 bg-base-100 p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-base-content/60">배송지</p>
                    <h2 className="text-lg font-semibold text-base-content">배송지 정보</h2>
                  </div>
                </div>

                {/* 저장된 배송지가 없을 때 */}
                {(!addressesData?.addresses || addressesData.addresses.length === 0) && (
                  <div className="mb-4 rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-4">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-semibold text-base-content">저장된 배송지가 없습니다</p>
                        <p className="text-sm text-base-content/70 mt-1">
                          아래 양식을 작성하여 새로운 배송지를 입력해주세요.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 저장된 배송지가 있을 때만 선택 UI 표시 */}
                {addressesData?.addresses && addressesData.addresses.length > 0 && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="form-control">
                      <span className="label-text text-sm text-base-content">저장된 배송지</span>
                      <select
                        className="select select-bordered"
                        value={selectedAddressId}
                        onChange={(event) => setSelectedAddressId(event.target.value)}
                      >
                        {savedAddresses.map((address) => (
                          <option key={address.id} value={address.id}>
                            {address.label}
                          </option>
                        ))}
                        <option value="manual">직접 입력하기</option>
                      </select>
                    </label>
                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full"
                        onClick={() => {
                          setSelectedAddressId('manual');
                          setShippingForm({
                            recipient: '',
                            phone: '',
                            postalCode: '',
                            address1: '',
                            address2: '',
                            saveAsDefault: false,
                          });
                        }}
                      >
                        새 배송지 추가
                      </Button>
                    </div>
                  </div>
                )}

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <label className="form-control">
                    <span className="label-text text-sm text-base-content">수령인</span>
                    <input
                      type="text"
                      name="recipient"
                      className={`input input-bordered ${formErrors.recipient ? 'input-error' : ''}`}
                      placeholder="홍길동"
                      value={shippingForm.recipient}
                      onChange={handleShippingInputChange}
                      onBlur={handleFieldBlur}
                      aria-describedby="recipient-error"
                    />
                    {formErrors.recipient && (
                      <span id="recipient-error" className="label-text-alt text-error">
                        {formErrors.recipient}
                      </span>
                    )}
                  </label>
                  <label className="form-control">
                    <span className="label-text text-sm text-base-content">연락처</span>
                    <input
                      type="tel"
                      name="phone"
                      className={`input input-bordered ${formErrors.phone ? 'input-error' : ''}`}
                      placeholder="010-1234-5678"
                      value={shippingForm.phone}
                      onChange={handleShippingInputChange}
                      onBlur={handleFieldBlur}
                      aria-describedby="phone-error"
                    />
                    {formErrors.phone && (
                      <span id="phone-error" className="label-text-alt text-error">
                        {formErrors.phone}
                      </span>
                    )}
                  </label>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-[180px_auto]">
                  <label className="form-control">
                    <span className="label-text text-sm text-base-content">우편번호</span>
                    <input
                      type="text"
                      name="postalCode"
                      className={`input input-bordered ${formErrors.postalCode ? 'input-error' : ''}`}
                      placeholder="00000"
                      value={shippingForm.postalCode}
                      onChange={handleShippingInputChange}
                      onBlur={handleFieldBlur}
                      aria-describedby="postal-error"
                    />
                    {formErrors.postalCode && (
                      <span id="postal-error" className="label-text-alt text-error">
                        {formErrors.postalCode}
                      </span>
                    )}
                  </label>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        alert('우편번호 검색 서비스는 추후 연동 예정입니다.');
                      }}
                    >
                      우편번호 검색
                    </Button>
                  </div>
                </div>

                <label className="form-control mt-4">
                  <span className="label-text text-sm text-base-content">도로명 주소</span>
                  <input
                    type="text"
                    name="address1"
                    className={`input input-bordered ${formErrors.address1 ? 'input-error' : ''}`}
                    placeholder="도로명 주소"
                    value={shippingForm.address1}
                    onChange={handleShippingInputChange}
                    onBlur={handleFieldBlur}
                    aria-describedby="address1-error"
                  />
                  {formErrors.address1 && (
                    <span id="address1-error" className="label-text-alt text-error">
                      {formErrors.address1}
                    </span>
                  )}
                </label>

                <label className="form-control mt-4">
                  <span className="label-text text-sm text-base-content">상세 주소</span>
                  <input
                    type="text"
                    name="address2"
                    className="input input-bordered"
                    placeholder="동/호수, 배송 참고사항"
                    value={shippingForm.address2}
                    onChange={handleShippingInputChange}
                  />
                </label>

                <label className="mt-4 flex items-center gap-2 text-sm text-base-content/80">
                  <input
                    type="checkbox"
                    name="saveAsDefault"
                    className="checkbox checkbox-primary"
                    checked={shippingForm.saveAsDefault}
                    onChange={handleShippingInputChange}
                  />
                  기본 배송지로 저장
                </label>
                </section>
              )}

              {fulfillmentType === 'pickup' && (
                <section className="rounded-3xl border border-base-200 bg-base-100 p-6 shadow-sm">
                  <div className="mb-4 flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-base-content/60">픽업 안내</p>
                      <h2 className="text-lg font-semibold text-base-content">상품별 매장 방문</h2>
                    </div>
                  </div>

                  {pickupStoreInfos.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-base-300 bg-base-200/40 p-4 text-sm text-base-content/70">
                      선택한 상품의 픽업 매장을 찾을 수 없습니다. 잠시 후 다시 시도하거나 고객 센터에 문의해주세요.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pickupStoreInfos.map((store) => (
                        <div
                          key={store.id ?? store.name}
                          className="rounded-2xl border border-base-200 p-4"
                        >
                          <p className="text-base font-semibold text-base-content">{store.name}</p>
                          <p className="text-sm text-base-content/70">
                            {store.address || '주소 정보가 업데이트될 예정입니다.'}
                          </p>
                          <p className="text-xs text-base-content/60">
                            연락처 {store.contact || '매장 연락처 준비 중'}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="mt-4 text-xs text-base-content/60">
                    각 상품이 속한 매장을 직접 방문해 수령해야 하며, 준비 완료 시 매장에서 별도로 안내드립니다.
                    방문 시 주문자 본인 확인을 위한 신분증을 지참해주세요.
                  </p>
                </section>
              )}

              <section className="rounded-3xl border border-base-200 bg-base-100 p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-base-content/60">주문 메모</p>
                    <h2 className="text-lg font-semibold text-base-content">배송 요청사항</h2>
                  </div>
                </div>
                <textarea
                  name="orderMemo"
                  className="textarea textarea-bordered min-h-[120px]"
                  placeholder="예) 부재 시 경비실에 맡겨주세요."
                  value={orderMemo}
                  onChange={(event) => {
                    if (event.target.value.length > MAX_MEMO_LENGTH) return;
                    setOrderMemo(event.target.value);
                  }}
                />
                <div className="mt-2 text-right text-xs text-base-content/60">
                  {orderMemo.length}/{MAX_MEMO_LENGTH}자
                </div>
              </section>
            </div>

            <div className="self-start lg:sticky lg:top-6">
              <section className="rounded-3xl border border-base-200 bg-base-100 p-6 shadow-lg">
                <h2 className="text-lg font-semibold text-base-content">주문 요약</h2>
                <div className="mt-4 space-y-3 text-sm text-base-content/70">
                  <div className="flex items-center justify-between">
                    <span>상품 합계</span>
                    <strong className="text-base-content">{formatCurrency(itemsSubtotal)}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{fulfillmentType === 'delivery' ? '배송비' : '픽업 수수료'}</span>
                    <strong className="text-base-content">
                      {shippingFee === 0 ? '무료' : `+ ${formatCurrency(shippingFee)}`}
                    </strong>
                  </div>
                </div>

                <div className="mt-5 border-t border-base-200 pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-base-content/60">총 결제금액</p>
                      <p className="text-2xl font-bold text-base-content">
                        {formatCurrency(totalDue)}
                      </p>
                    </div>
                    {isCartFetching && (
                      <span className="text-xs text-primary">금액 새로고침 중...</span>
                    )}
                  </div>
                </div>

                <Button
                  block
                  size="lg"
                  className="mt-6"
                  onClick={handleProceedToPayment}
                  disabled={!isCTAEnabled}
                  loading={isSubmittingOrder}
                >
                  결제하기로 이동
                </Button>
                {!isCTAEnabled && (
                  <p className="mt-3 text-xs text-error">
                    필수 입력값을 모두 채우고 배송/픽업 정보를 확인해주세요.
                  </p>
                )}
                <p className="mt-4 text-xs text-base-content/60">
                  주문 제출 시{' '}
                  <a href="/" className="link link-primary">
                    이용약관
                  </a>
                  에 동의한 것으로 간주됩니다.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {orderItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 border-t border-base-300 bg-base-100 px-4 py-4 shadow-2xl md:hidden">
          <div className="mx-auto flex max-w-4xl items-center justify-between">
            <div>
              <p className="text-xs text-base-content/60">총 결제금액</p>
              <p className="text-xl font-bold text-base-content">{formatCurrency(totalDue)}</p>
            </div>
            <Button
              size="sm"
              className="min-w-[140px]"
              onClick={handleProceedToPayment}
              disabled={!isCTAEnabled}
              loading={isSubmittingOrder}
            >
              결제하기로 이동
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
