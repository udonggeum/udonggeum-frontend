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
  useForgotPassword,
  useResetPassword,
  authKeys,
} from './useAuthQueries';

// Products hooks
export {
  useProducts,
  useProductDetail,
  usePopularProducts,
  useStoreProducts,
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

// Wishlist hooks
export {
  useWishlist,
  useAddToWishlist,
  useRemoveFromWishlist,
  useToggleWishlist,
  useIsInWishlist,
  wishlistKeys,
} from './useWishlistQueries';

// Address hooks
export {
  useAddresses,
  useAddAddress,
  useUpdateAddress,
  useDeleteAddress,
  useSetDefaultAddress,
  addressKeys,
} from './useAddressQueries';

// Seller hooks
export {
  useDashboardStats,
  useSellerStores,
  useCreateStore,
  useUpdateStore,
  useDeleteStore,
  useStoreProducts as useSellerStoreProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useSellerOrders,
  useUpdateOrderStatus,
  sellerKeys,
} from './useSellerQueries';
