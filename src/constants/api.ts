/**
 * API Base URL
 * Use environment variable or fallback to empty string (uses Vite proxy in development)
 */
export const API_URL = import.meta.env.VITE_API_URL || '';

/**
 * API Base URL (alias for compatibility)
 */
export const API_BASE_URL = API_URL;

/**
 * API Endpoints
 * Centralized endpoint definitions
 * All endpoints are prefixed with /api/v1
 */
export const ENDPOINTS = {
  AUTH: {
    REGISTER: '/api/v1/auth/register',
    LOGIN: '/api/v1/auth/login',
    LOGOUT: '/api/v1/auth/logout',
    REFRESH: '/api/v1/auth/refresh',
    ME: '/api/v1/auth/me',
    FORGOT_PASSWORD: '/api/v1/auth/forgot-password',
    RESET_PASSWORD: '/api/v1/auth/reset-password',
  },

  STORES: {
    LIST: '/api/v1/stores',
    LOCATIONS: '/api/v1/stores/locations',
    DETAIL: (id: number) => `/api/v1/stores/${id}`,
    CREATE: '/api/v1/stores',
    UPDATE: (id: number) => `/api/v1/stores/${id}`,
    DELETE: (id: number) => `/api/v1/stores/${id}`,
  },

  PRODUCTS: {
    LIST: '/api/v1/products',
    POPULAR: '/api/v1/products/popular',
    DETAIL: (id: number) => `/api/v1/products/${id}`,
    CREATE: '/api/v1/products',
    UPDATE: (id: number) => `/api/v1/products/${id}`,
    DELETE: (id: number) => `/api/v1/products/${id}`,
  },

  CART: {
    GET: '/api/v1/cart',
    ADD: '/api/v1/cart',
    UPDATE: (id: number) => `/api/v1/cart/${id}`,
    DELETE: (id: number) => `/api/v1/cart/${id}`,
    CLEAR: '/api/v1/cart',
  },

  ORDERS: {
    LIST: '/api/v1/orders',
    CREATE: '/api/v1/orders',
    DETAIL: (id: number) => `/api/v1/orders/${id}`,
    UPDATE_STATUS: (id: number) => `/api/v1/orders/${id}/status`,
    UPDATE_PAYMENT: (id: number) => `/api/v1/orders/${id}/payment`,
  },

  WISHLIST: {
    GET: '/api/v1/wishlist',
    ADD: '/api/v1/wishlist',
    DELETE: (productId: number) => `/api/v1/wishlist/${productId}`,
  },

  ADDRESSES: {
    LIST: '/api/v1/addresses',
    ADD: '/api/v1/addresses',
    UPDATE: (id: number) => `/api/v1/addresses/${id}`,
    DELETE: (id: number) => `/api/v1/addresses/${id}`,
    SET_DEFAULT: (id: number) => `/api/v1/addresses/${id}/default`,
  },

  SELLER: {
    DASHBOARD: '/api/v1/seller/dashboard',
    STORES: {
      LIST: '/api/v1/seller/stores',
      CREATE: '/api/v1/stores',
      UPDATE: (id: number) => `/api/v1/stores/${id}`,
      DELETE: (id: number) => `/api/v1/stores/${id}`,
      ORDERS: (storeId: number) => `/api/v1/seller/stores/${storeId}/orders`,
    },
    PRODUCTS: {
      LIST: (storeId: number) => `/api/v1/products?store_id=${storeId}`,
      CREATE: '/api/v1/products',
      UPDATE: (id: number) => `/api/v1/products/${id}`,
      DELETE: (id: number) => `/api/v1/products/${id}`,
    },
    ORDERS: {
      UPDATE_STATUS: (id: number) => `/api/v1/seller/orders/${id}/status`,
    },
  },

  IMAGES: {
    PRESIGNED_URL: '/api/v1/upload/presigned-url',
    OPTIMIZE: '/api/v1/images/optimize',
  },
} as const;

/**
 * Local storage keys
 * Used by Zustand persist middleware
 */
export const STORAGE_KEYS = {
  AUTH_STORE: 'udonggeum_auth',
} as const;

/**
 * Error messages
 * User-friendly Korean error messages
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '네트워크 연결을 확인해주세요.',
  UNAUTHORIZED: '로그인이 필요합니다.',
  FORBIDDEN: '접근 권한이 없습니다.',
  NOT_FOUND: '요청한 정보를 찾을 수 없습니다.',
  SERVER_ERROR: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  VALIDATION_ERROR: '입력값을 확인해주세요.',
} as const;
