/**
 * API Base URL
 * Use environment variable or fallback to empty string (uses Vite proxy in development)
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || '';

/**
 * API Endpoints
 * Centralized endpoint definitions
 * All endpoints are prefixed with /api/v1
 */
export const ENDPOINTS = {
  AUTH: {
    REGISTER: '/api/v1/auth/register',
    LOGIN: '/api/v1/auth/login',
    ME: '/api/v1/auth/me',
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
