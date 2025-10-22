import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, ERROR_MESSAGES } from '@/constants/api';
import { ApiError, NetworkError } from '@/utils/errors';
import { useAuthStore } from '@/stores/useAuthStore';

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
 * Adds authorization token to all requests
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from Zustand auth store
    // Use getState() to access store outside React components
    const token = useAuthStore.getState().tokens?.access_token;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: unknown) => {
    // Ensure error is an Error instance
    return Promise.reject(error instanceof Error ? error : new Error(String(error)));
  }
);

/**
 * Response interceptor
 * Handles errors and transforms them to custom error types
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // Network error (no response from server)
    if (!error.response) {
      return Promise.reject(new NetworkError(ERROR_MESSAGES.NETWORK_ERROR));
    }

    const status = error.response.status;

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
