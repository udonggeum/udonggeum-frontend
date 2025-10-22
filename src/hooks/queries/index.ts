/**
 * TanStack Query Hooks
 * Barrel export for all query and mutation hooks
 */

// Auth hooks
export {
  useLogin,
  useRegister,
  useMe,
  useLogout,
  authKeys,
} from './useAuthQueries';

// Products hooks
export {
  useProducts,
  useProductDetail,
  usePopularProducts,
  productsKeys,
} from './useProductsQueries';

// Cart hooks
export {
  useCart,
  useAddToCart,
  useUpdateCartItem,
  useRemoveCartItem,
  useClearCart,
  cartKeys,
} from './useCartQueries';

// Orders hooks
export {
  useOrders,
  useOrderDetail,
  useCreateOrder,
  ordersKeys,
} from './useOrdersQueries';

// Stores hooks
export {
  useStores,
  useStoreLocations,
  useStoreDetail,
  storesKeys,
} from './useStoresQueries';
