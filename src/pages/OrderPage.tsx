import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Navbar,
  Footer,
  LoadingSpinner,
  ErrorAlert,
} from '@/components';
import {
  OrderSummary,
  FulfillmentSelector,
  PickupInfo,
  OrderItemsList,
  ShippingForm,
} from '@/components/order';
import { NAV_ITEMS } from '@/constants/navigation';
import {
  useCart,
  useRemoveCartItem,
  useUpdateCartItem,
} from '@/hooks/queries/useCartQueries';
import { useCreateOrder } from '@/hooks/queries/useOrdersQueries';
import { useAddresses, useAddAddress } from '@/hooks/queries/useAddressQueries';
import { useAuthStore } from '@/stores/useAuthStore';
import { buildShippingAddress, formatCurrency } from '@/utils/formatting';
import {
  MAX_MEMO_LENGTH,
  ALERT_TIMEOUT,
  VALIDATION_PATTERNS,
  VALIDATION_MESSAGES,
  DELIVERY_FEE,
  type FulfillmentType,
  type OrderFieldName,
} from '@/constants/orderDefaults';
import type { CartItem } from '@/schemas/cart';
import type { Address } from '@/schemas/address';
import {
  AlertTriangle,
  ChevronRight,
  Info,
} from 'lucide-react';

interface OrderLocationState {
  selectedItemIds?: number[];
  directPurchase?: {
    product: CartItem['product'];
    product_option?: CartItem['product_option'];
    quantity: number;
  };
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

interface PickupStoreInfo {
  id?: number;
  name: string;
  address?: string | null;
  contact?: string | null;
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
  const directPurchase = locationState?.directPurchase;

  // 바로구매가 아닐 때만 장바구니 불러오기
  const {
    data: cartData,
    isLoading: isCartLoading,
    isFetching: isCartFetching,
    error: cartError,
    refetch: refetchCart,
  } = useCart({ enabled: !directPurchase });

  const { mutate: updateCartItem, isPending: isUpdatingCart } = useUpdateCartItem();
  const { mutate: removeCartItem, isPending: isRemovingCart } = useRemoveCartItem();
  const { mutate: createOrder, isPending: isSubmittingOrder } = useCreateOrder();

  // Fetch addresses from API
  const {
    data: addressesData,
    isLoading: isAddressesLoading,
    error: addressesError,
  } = useAddresses();

  // Add new address mutation
  const { mutate: addAddress, isPending: isAddingAddress } = useAddAddress();

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

  // Initialize with first address if available
  const initialAddressId = useMemo(() => {
    return savedAddresses.length > 0 ? savedAddresses[0].id : 'manual';
  }, [savedAddresses.length]);

  const [selectedAddressId, setSelectedAddressId] = useState<string>(initialAddressId);

  const [shippingForm, setShippingForm] = useState<ShippingFormState>({
    recipient: user?.name ?? '',
    phone: user?.phone ?? '',
    postalCode: '',
    address1: '',
    address2: '',
    saveAsDefault: false,
  });

  // Update selectedAddressId when addresses are loaded (only once on mount)
  useEffect(() => {
    if (savedAddresses.length > 0 && selectedAddressId === 'manual') {
      setSelectedAddressId(savedAddresses[0].id);
    }
  }, [savedAddresses.length]); // Only depend on length, not the array itself

  // Update form when selected address changes
  useEffect(() => {
    if (!selectedAddressId) return;

    if (selectedAddressId === 'manual') {
      // 새 배송지 입력 모드: 빈 폼으로 초기화
      setShippingForm({
        recipient: user?.name ?? '',
        phone: user?.phone ?? '',
        postalCode: '',
        address1: '',
        address2: '',
        saveAsDefault: false,
      });
      return;
    }

    // 저장된 배송지 선택: 해당 주소 정보로 채우기
    const matched = savedAddresses.find((address) => address.id === selectedAddressId);
    if (matched) {
      setShippingForm({
        recipient: matched.recipient,
        phone: matched.phone,
        postalCode: matched.postalCode,
        address1: matched.address1,
        address2: matched.address2,
        saveAsDefault: false,
      });
    }
  }, [selectedAddressId, savedAddresses, user?.name, user?.phone]);

  const filteredCartSelection = useMemo(() => {
    // 바로구매일 경우 임시 CartItem 생성
    if (directPurchase) {
      return [
        {
          id: 0, // 임시 ID (장바구니 아이템이 아니므로)
          quantity: directPurchase.quantity,
          product: directPurchase.product,
          product_option: directPurchase.product_option,
        } as CartItem,
      ];
    }

    // 장바구니에서 선택한 아이템 필터링
    if (!cartData?.cart_items) return [];
    if (!selectedItemIds || selectedItemIds.length === 0) {
      return cartData.cart_items;
    }
    return cartData.cart_items.filter((item) => selectedItemIds.includes(item.id));
  }, [directPurchase, cartData?.cart_items, selectedItemIds]);

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

  // Auto-dismissible alerts
  const [showDirectPurchaseAlert, setShowDirectPurchaseAlert] = useState(true);
  const [showNoSelectionAlert, setShowNoSelectionAlert] = useState(true);
  const [showLowStockAlert, setShowLowStockAlert] = useState(true);

  const itemsSubtotal = useMemo(() => {
    return orderItems.reduce((sum, item) => {
      const optionExtra = item.product_option?.additional_price ?? 0;
      const unitPrice = item.product.price + optionExtra;
      return sum + unitPrice * item.quantity;
    }, 0);
  }, [orderItems]);

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

  // Auto-dismiss alerts after delay
  useEffect(() => {
    if (directPurchase && showDirectPurchaseAlert) {
      const timer = setTimeout(() => {
        setShowDirectPurchaseAlert(false);
      }, ALERT_TIMEOUT.DIRECT_PURCHASE);
      return () => clearTimeout(timer);
    }
  }, [directPurchase, showDirectPurchaseAlert]);

  useEffect(() => {
    if (!directPurchase && !selectedItemIds?.length && showNoSelectionAlert) {
      const timer = setTimeout(() => {
        setShowNoSelectionAlert(false);
      }, ALERT_TIMEOUT.NO_SELECTION);
      return () => clearTimeout(timer);
    }
  }, [directPurchase, selectedItemIds, showNoSelectionAlert]);

  useEffect(() => {
    if (lowStockItems.length > 0 && showLowStockAlert) {
      const timer = setTimeout(() => {
        setShowLowStockAlert(false);
      }, ALERT_TIMEOUT.LOW_STOCK);
      return () => clearTimeout(timer);
    }
  }, [lowStockItems.length, showLowStockAlert]);

  const missingSelectionCount = selectedItemIds
    ? selectedItemIds.length - filteredCartSelection.length
    : 0;

  const validateField = (name: OrderFieldName, value: string) => {
    let message = '';
    if (name === 'recipient' && !value.trim()) {
      message = VALIDATION_MESSAGES.RECIPIENT_REQUIRED;
    }
    if (name === 'phone') {
      if (!value.trim()) {
        message = VALIDATION_MESSAGES.PHONE_REQUIRED;
      } else if (!VALIDATION_PATTERNS.PHONE.test(value.trim())) {
        message = VALIDATION_MESSAGES.PHONE_INVALID;
      }
    }
    if (name === 'postalCode') {
      if (!value.trim()) {
        message = VALIDATION_MESSAGES.POSTAL_CODE_REQUIRED;
      } else if (!VALIDATION_PATTERNS.POSTAL_CODE.test(value.trim())) {
        message = VALIDATION_MESSAGES.POSTAL_CODE_INVALID;
      }
    }
    if (name === 'address1' && !value.trim()) {
      message = VALIDATION_MESSAGES.ADDRESS1_REQUIRED;
    }

    setFormErrors((prev) => ({
      ...prev,
      [name]: message,
    }));
    return message === '';
  };

  const validateForm = () => {
    const fieldNames: OrderFieldName[] = ['recipient', 'phone', 'postalCode', 'address1'];
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
      validateField(name as OrderFieldName, value);
    }
  };

  const handleFieldBlur = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.currentTarget;
    setTouchedFields((prev) => ({
      ...prev,
      [name]: true,
    }));
    if (name === 'address2' || name === 'saveAsDefault') return;
    validateField(name as OrderFieldName, value);
  };

  const handleQuantityChange = (itemId: number, quantity: number) => {
    if (quantity < 1) return;

    // 바로구매일 경우 로컬 상태만 업데이트 (장바구니 API 호출 안 함)
    if (directPurchase) {
      setOrderItems((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, quantity } : item))
      );
      return;
    }

    // 장바구니 아이템일 경우 API 호출
    setOrderItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity } : item))
    );
    updateCartItem(
      {
        id: itemId,
        payload: { quantity },
      },
      {
        onError: () => {
          refetchCart();
        },
      }
    );
  };

  const handleRemoveItem = (itemId: number) => {
    // 바로구매일 경우 삭제 불가 (주문 페이지를 떠나야 함)
    if (directPurchase) {
      return;
    }

    const previousItems = orderItems;
    setOrderItems((prev) => prev.filter((item) => item.id !== itemId));
    removeCartItem(itemId, {
      onError: () => {
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
        onError: () => {
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
        onError: () => {
          refetchCart();
        },
      });
    });
    setMarkedItems({});
  };

  const handleMarkItem = (itemId: number) => {
    setMarkedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const handleMarkAll = (checked: boolean) => {
    const next: Record<number, boolean> = {};
    orderItems.forEach((item) => {
      next[item.id] = checked;
    });
    setMarkedItems(next);
  };

  const handleAddNewAddress = () => {
    setSubmitError(null);
    const isValid = validateForm();
    if (!isValid) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Add new address via API
    addAddress(
      {
        name: shippingForm.recipient, // 수령인 이름을 배송지 이름으로 사용
        recipient: shippingForm.recipient,
        phone: shippingForm.phone,
        zip_code: shippingForm.postalCode,
        address: shippingForm.address1,
        detail_address: shippingForm.address2,
        is_default: shippingForm.saveAsDefault,
      },
      {
        onSuccess: () => {
          alert('새 배송지가 추가되었습니다.');
          // 자동으로 새로 추가된 배송지가 선택되도록 처리 (리페치 후 첫 번째 항목)
        },
        onError: (error) => {
          setSubmitError(`배송지 추가 실패: ${error.message}`);
        },
      }
    );
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

    // 주문할 상품 목록 생성
    const items = orderItems.map((item) => ({
      product_id: item.product.id,
      quantity: item.quantity,
      product_option_id: item.product_option?.id,
    }));

    const payload =
      fulfillmentType === 'delivery'
        ? {
          items,
          fulfillment_type: 'delivery' as const,
          shipping_address: `${shippingForm.recipient} | ${shippingForm.phone} | ${buildShippingAddress(
            shippingForm.postalCode,
            shippingForm.address1,
            shippingForm.address2
          )}`,
        }
        : {
          items,
          fulfillment_type: 'pickup' as const,
          pickup_store_id: inferredPickupStoreId,
        };

    createOrder(
      payload,
      {
        onSuccess: (response) => {
          // Navigate to payment page to initiate Kakao Pay payment
          navigate(`/payment/${response.order.id}`, {
            replace: true,
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

  // Calculate total due (subtotal + delivery fee if applicable)
  const totalDue = itemsSubtotal + (fulfillmentType === 'delivery' ? DELIVERY_FEE : 0);

  const isCTAEnabled =
    orderItems.length > 0 &&
    !hasInsufficientStock &&
    (fulfillmentType === 'delivery' ? hasDeliveryAddress : true) &&
    !isSubmittingOrder;

  if (isCartLoading && orderItems.length === 0) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar navigationItems={NAV_ITEMS} />
        <main className="flex flex-1 items-center justify-center px-4">
          <LoadingSpinner message="주문 정보를 준비하고 있습니다..." />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col pb-28 md:pb-0">
      <Navbar navigationItems={NAV_ITEMS} />
      <main className="flex-1">
        <div className="container mx-auto max-w-6xl px-4 py-10">
          <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-[var(--color-text)]/70">
            {['홈', '장바구니', '주문', '결제'].map((label, index, arr) => {
              const isLast = index === arr.length - 1;
              const href =
                label === '홈' ? '/' : label === '장바구니' ? '/cart' : undefined;
              return (
                <div key={label} className="flex items-center gap-2">
                  {href ? (
                    <button
                      type="button"
                      className="text-[var(--color-text)]/70 hover:text-primary"
                      onClick={() => {
                        void navigate(href);
                      }}
                    >
                      {label}
                    </button>
                  ) : (
                    <span className={isLast ? 'font-semibold text-[var(--color-text)]' : ''}>
                      {label}
                    </span>
                  )}
                  {!isLast && <ChevronRight className="h-4 w-4 text-[var(--color-text)]/30" />}
                </div>
              );
            })}
          </div>

          <div className="mb-8 pb-6 border-b-2 border-[var(--color-gold)]/20">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <span className="badge badge-lg border-2 border-[var(--color-gold)] text-[var(--color-gold)] bg-[var(--color-gold)]/10 font-semibold">Order</span>
                <h1 className="text-4xl font-bold text-[var(--color-text)]">주문서 작성</h1>
                <p className="text-base text-[var(--color-text)]/70">
                  선택한 상품 정보를 확인하고 배송 또는 픽업 정보를 입력하세요.
                </p>
              </div>
            </div>
          </div>

          {/* Error Alerts */}
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

          {!directPurchase && !selectedItemIds?.length && showNoSelectionAlert && (
            <div className="alert bg-info/10 border-2 border-info/30 mb-6 animate-fade-in">
              <Info className="h-5 w-5 text-info" />
              <span className="text-[var(--color-text)]">장바구니에서 선택한 상품 정보가 없어 전체 상품을 불러왔습니다.</span>
              <button
                type="button"
                className="btn btn-ghost btn-sm btn-circle ml-auto hover:bg-info/20"
                onClick={() => setShowNoSelectionAlert(false)}
                aria-label="알림 닫기"
              >
                ✕
              </button>
            </div>
          )}

          {directPurchase && showDirectPurchaseAlert && (
            <div className="alert bg-success/10 border-2 border-success/30 mb-6 animate-fade-in">
              <Info className="h-5 w-5 text-success" />
              <span className="text-[var(--color-text)]">바로구매 상품입니다. 배송 정보를 입력하고 결제를 진행하세요.</span>
              <button
                type="button"
                className="btn btn-ghost btn-sm btn-circle ml-auto hover:bg-success/20"
                onClick={() => setShowDirectPurchaseAlert(false)}
                aria-label="알림 닫기"
              >
                ✕
              </button>
            </div>
          )}

          {missingSelectionCount > 0 && (
            <div className="alert bg-warning/10 border-2 border-warning/30 mb-6 animate-shake">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <span className="text-[var(--color-text)]">
                선택했던 상품 {missingSelectionCount}개를 찾을 수 없습니다. 장바구니 정보를
                새로고침해주세요.
              </span>
            </div>
          )}

          {lowStockItems.length > 0 && showLowStockAlert && (
            <div className="alert bg-warning/10 border-2 border-warning/30 mb-6 animate-fade-in">
              <Info className="h-5 w-5 text-warning" />
              <span className="text-[var(--color-text)]">
                <strong className="font-semibold">{lowStockItems.map((item) => item.product.name).join(', ')}</strong> 상품의 재고가 얼마 남지
                않았습니다.
              </span>
              <button
                type="button"
                className="btn btn-ghost btn-sm btn-circle ml-auto hover:bg-warning/20"
                onClick={() => setShowLowStockAlert(false)}
                aria-label="알림 닫기"
              >
                ✕
              </button>
            </div>
          )}

          {hasInsufficientStock && (
            <div className="alert bg-error/10 border-2 border-error/30 mb-6 animate-shake">
              <AlertTriangle className="h-5 w-5 text-error" />
              <span className="text-[var(--color-text)] font-semibold">일부 상품 수량이 재고보다 많습니다. 수량을 조정해주세요.</span>
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
            <div className="alert bg-warning/10 border-2 border-warning/30 mb-6">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <div className="text-[var(--color-text)]">
                <p className="font-semibold">저장된 배송지를 불러오지 못했습니다</p>
                <p className="text-sm text-[var(--color-text)]/70">{addressesError.message}</p>
                <p className="text-xs text-[var(--color-text)]/60 mt-1">직접 입력하거나 나중에 다시 시도해주세요.</p>
              </div>
            </div>
          )}

          {isAddressesLoading && (
            <div className="alert bg-info/10 border-2 border-info/30 mb-6">
              <Info className="h-5 w-5 text-info" />
              <span className="text-[var(--color-text)] flex items-center gap-2">
                <span className="loading loading-spinner loading-sm"></span>
                저장된 배송지 정보를 불러오는 중...
              </span>
            </div>
          )}

          <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
            <div className="space-y-8">
              {/* Order Items List */}
              <OrderItemsList
                orderItems={orderItems}
                markedItems={markedItems}
                fulfillmentType={fulfillmentType}
                isDirectPurchase={Boolean(directPurchase)}
                isUpdatingCart={isUpdatingCart}
                isRemovingCart={isRemovingCart}
                onMarkItem={handleMarkItem}
                onMarkAll={handleMarkAll}
                onQuantityChange={handleQuantityChange}
                onRemoveItem={handleRemoveItem}
                onRemoveSelected={handleRemoveSelected}
                onClearAll={handleClearAll}
              />

              {/* Fulfillment Selector */}
              <FulfillmentSelector
                fulfillmentType={fulfillmentType}
                onFulfillmentTypeChange={setFulfillmentType}
              />

              {/* Shipping Form (if delivery) */}
              {fulfillmentType === 'delivery' && (
                <ShippingForm
                  savedAddresses={savedAddresses}
                  selectedAddressId={selectedAddressId}
                  shippingForm={shippingForm}
                  formErrors={formErrors}
                  isAddingAddress={isAddingAddress}
                  onAddressSelect={setSelectedAddressId}
                  onInputChange={handleShippingInputChange}
                  onFieldBlur={handleFieldBlur}
                  onAddNewAddress={handleAddNewAddress}
                />
              )}

              {/* Pickup Info (if pickup) */}
              {fulfillmentType === 'pickup' && (
                <PickupInfo pickupStoreInfos={pickupStoreInfos} />
              )}

              {/* Order Memo */}
              <section className="pb-8">
                <div className="mb-4">
                  <label className="form-control w-full">
                    <span className="label-text text-sm text-[var(--color-text)]">배송 요청사항</span>
                    <input
                      type="text"
                      name="orderMemo"
                      className="input w-full bg-[var(--color-text)]/5 border-[var(--color-gold)]/30 focus:border-[var(--color-gold)] text-[var(--color-text)] placeholder:text-[var(--color-text)]/40"
                      placeholder="예) 부재 시 경비실에 맡겨주세요."
                      value={orderMemo}
                      onChange={(event) => {
                        if (event.target.value.length > MAX_MEMO_LENGTH) return;
                        setOrderMemo(event.target.value);
                      }}
                      maxLength={MAX_MEMO_LENGTH}
                    />
                    <span className="label-text-alt text-[var(--color-text)]/60">
                      {orderMemo.length}/{MAX_MEMO_LENGTH}자
                    </span>
                  </label>
                </div>
              </section>
            </div>

            {/* Order Summary (Sidebar) */}
            <div className="self-start lg:sticky lg:top-6">
              <OrderSummary
                itemsSubtotal={itemsSubtotal}
                fulfillmentType={fulfillmentType}
                isCartFetching={isCartFetching}
                isCTAEnabled={isCTAEnabled}
                isSubmittingOrder={isSubmittingOrder}
                onProceedToPayment={handleProceedToPayment}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Mobile CTA (Fixed Bottom Bar) */}
      {orderItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 border-t-2 border-[var(--color-gold)]/30 bg-gradient-to-t from-[var(--color-gold)]/5 to-[var(--color-primary)] px-4 py-4 md:hidden backdrop-blur-md z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.1)]">
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
            <div>
              <p className="text-xs text-[var(--color-text)]/60 mb-1">총 결제금액</p>
              <p className="text-2xl font-bold text-[var(--color-gold)]">
                {formatCurrency(totalDue)}
              </p>
            </div>
            <button
              type="button"
              className={`btn btn-md min-w-[140px] ${isCTAEnabled
                  ? 'bg-[var(--color-gold)] hover:bg-[var(--color-gold)]/80 text-[var(--color-primary)] border-[var(--color-gold)]'
                  : 'btn-disabled'
                }`}
              onClick={handleProceedToPayment}
              disabled={!isCTAEnabled || isSubmittingOrder}
              aria-label="결제 페이지로 이동"
            >
              {isSubmittingOrder ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  처리 중
                </>
              ) : (
                '결제하기'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
