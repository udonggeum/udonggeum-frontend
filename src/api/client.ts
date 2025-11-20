import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL, ERROR_MESSAGES, ENDPOINTS } from '@/constants/api';
import { ApiError, NetworkError } from '@/utils/errors';
import { AUTH_ERRORS } from '@/constants/errors';
import { useAuthStore } from '@/stores/useAuthStore';
import { apiLogger } from '@/utils/apiLogger';
import { TokensSchema } from '@/schemas/auth';

/**
 * Map backend error responses to Korean messages
 * This ensures consistent Korean error messages regardless of backend language
 */
function getKoreanErrorMessage(status: number, url: string, backendMessage?: string): string {
  // Authentication endpoints (login, register, etc.)
  if (url.includes(ENDPOINTS.AUTH.LOGIN)) {
    if (status === 401) return AUTH_ERRORS.INVALID_CREDENTIALS;
    if (status === 400) return AUTH_ERRORS.VALIDATION_ERROR;
  }

  if (url.includes(ENDPOINTS.AUTH.REGISTER)) {
    if (status === 409) return AUTH_ERRORS.EMAIL_IN_USE;
    if (status === 400) return AUTH_ERRORS.VALIDATION_ERROR;
  }

  if (url.includes(ENDPOINTS.AUTH.REFRESH)) {
    if (status === 401) return AUTH_ERRORS.SESSION_EXPIRED;
  }

  if (url.includes(ENDPOINTS.AUTH.ME)) {
    if (status === 401) return AUTH_ERRORS.UNAUTHORIZED;
  }

  // Generic error mapping by status code
  switch (status) {
    case 401:
      return AUTH_ERRORS.UNAUTHORIZED;
    case 403:
      return AUTH_ERRORS.FORBIDDEN;
    case 404:
      return AUTH_ERRORS.NOT_FOUND;
    case 409:
      return AUTH_ERRORS.EMAIL_IN_USE;
    case 500:
    case 502:
    case 503:
      return AUTH_ERRORS.SERVER_ERROR;
    default:
      // Fall back to backend message or generic error
      return backendMessage || ERROR_MESSAGES.SERVER_ERROR;
  }
}

// Extend Axios config to include metadata for tracking
declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    metadata?: {
      startTime: number;
    };
    _retry?: boolean; // Track if request has been retried
  }
}

// Token refresh state
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

/**
 * Axios client instance
 * Configured with base URL and default headers
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

/**
 * Request interceptor
 * Adds authorization token to all requests and logs request details
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Store start time for duration calculation
    config.metadata = { startTime: performance.now() };

    // Get token from Zustand auth store
    // Use getState() to access store outside React components
    const token = useAuthStore.getState().tokens?.access_token;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request
    apiLogger.logRequest(
      config.method?.toUpperCase() || 'UNKNOWN',
      config.url || '',
      config.data,
      config.headers as Record<string, string>
    );

    return config;
  },
  (error: unknown) => {
    // Ensure error is an Error instance
    return Promise.reject(error instanceof Error ? error : new Error(String(error)));
  }
);

/**
 * Response interceptor
 * Handles errors, transforms them to custom error types, and logs responses
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Calculate duration
    const duration = performance.now() - (response.config.metadata?.startTime || 0);

    // Log successful response
    apiLogger.logResponse(
      response.config.method?.toUpperCase() || 'UNKNOWN',
      response.config.url || '',
      response.status,
      response.statusText,
      response.data,
      duration
    );

    return response;
  },
  async (error: AxiosError) => {
    const duration = performance.now() - (error.config?.metadata?.startTime || 0);
    const method = error.config?.method?.toUpperCase() || 'UNKNOWN';
    const url = error.config?.url || '';

    // Network error (no response from server)
    if (!error.response) {
      apiLogger.logNetworkError(method, url, duration);
      return Promise.reject(new NetworkError(ERROR_MESSAGES.NETWORK_ERROR));
    }

    const status = error.response.status;

    // Log error response
    apiLogger.logError(
      method,
      url,
      error,
      status,
      duration
    );

    // 401 Unauthorized - Attempt token refresh
    // Skip token refresh for auth endpoints (login, register, refresh)
    const isAuthEndpoint =
      url.includes(ENDPOINTS.AUTH.LOGIN) ||
      url.includes(ENDPOINTS.AUTH.REGISTER) ||
      url.includes(ENDPOINTS.AUTH.REFRESH);

    if (status === 401 && error.config && !error.config._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        // Queue this request while refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            // Retry with new token
            if (!error.config) {
              return Promise.reject(new Error('No config available for retry'));
            }
            if (error.config.headers) {
              const token = useAuthStore.getState().tokens?.access_token;
              error.config.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(error.config);
          })
          .catch((err) => {
            const normalizedError = err instanceof Error ? err : new Error(String(err));
            return Promise.reject(normalizedError);
          });
      }

      error.config._retry = true;
      isRefreshing = true;

      const refreshToken = useAuthStore.getState().tokens?.refresh_token;

      if (!refreshToken) {
        // No refresh token available - if user was authenticated, force re-login
        const wasAuthenticated = useAuthStore.getState().isAuthenticated;
        useAuthStore.getState().clearAuth();
        if (wasAuthenticated) {
          window.location.href = '/login';
        }
        return Promise.reject(new ApiError(ERROR_MESSAGES.UNAUTHORIZED, status));
      }

      try {
        // Attempt to refresh token (call endpoint directly to avoid circular dependency)
        const response = await apiClient.post(ENDPOINTS.AUTH.REFRESH, {
          refresh_token: refreshToken,
        });

        // Validate and update tokens
        const newTokens = TokensSchema.parse(response.data);
        useAuthStore.getState().updateTokens(newTokens);

        // Process queued requests with new token
        failedQueue.forEach((prom) => prom.resolve());
        failedQueue = [];

        // Retry original request with new token
        if (error.config.headers) {
          error.config.headers.Authorization = `Bearer ${newTokens.access_token}`;
        }
        return apiClient(error.config);
      } catch (refreshError) {
        // Refresh failed - logout and reject all queued requests
        failedQueue.forEach((prom) => prom.reject(refreshError));
        failedQueue = [];

        useAuthStore.getState().clearAuth();
        window.location.href = '/login';
        return Promise.reject(
          new ApiError(AUTH_ERRORS.SESSION_EXPIRED, status)
        );
      } finally {
        isRefreshing = false;
      }
    }

    // Transform API error to ApiError class
    // Use Korean error mapping to ensure consistent Korean messages
    const backendMessage = (error.response.data as { error?: string })?.error;
    const koreanMessage = getKoreanErrorMessage(status, url, backendMessage);

    return Promise.reject(
      new ApiError(koreanMessage, status, error.response.data)
    );
  }
);
