import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL, ERROR_MESSAGES } from '@/constants/api';
import { ApiError, NetworkError } from '@/utils/errors';
import { useAuthStore } from '@/stores/useAuthStore';
import { apiLogger } from '@/utils/apiLogger';

// Extend Axios config to include metadata for tracking
declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    metadata?: {
      startTime: number;
    };
  }
}

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

    // 401 Unauthorized - Clear auth and redirect to login
    if (status === 401) {
      // Clear auth store
      useAuthStore.getState().clearAuth();

      window.location.href = '/login';
      return Promise.reject(
        new ApiError(ERROR_MESSAGES.UNAUTHORIZED, status)
      );
    }

    // Transform API error to ApiError class
    const message =
      (error.response.data as { error?: string })?.error ||
      error.message ||
      ERROR_MESSAGES.SERVER_ERROR;

    return Promise.reject(
      new ApiError(message, status, error.response.data)
    );
  }
);
