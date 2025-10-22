import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/auth';
import { useAuthStore } from '@/stores/useAuthStore';
import type { LoginRequest, RegisterRequest } from '@/schemas/auth';

/**
 * Auth Query Keys Factory
 * Centralized query key management for auth-related queries
 */
export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
};

/**
 * useLogin mutation
 * Logs in user and updates auth store on success
 *
 * @example
 * const { mutate: login, isPending } = useLogin();
 * login({ email: 'user@example.com', password: 'password123' });
 */
export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (response) => {
      // Update auth store with user and tokens
      setAuth(response.user, response.tokens);

      // Invalidate and refetch user data
      void queryClient.invalidateQueries({ queryKey: authKeys.me() });
    },
  });
}

/**
 * useRegister mutation
 * Registers new user and updates auth store on success
 *
 * @example
 * const { mutate: register, isPending } = useRegister();
 * register({ email: 'user@example.com', password: 'password123', name: '홍길동', phone: '010-1234-5678' });
 */
export function useRegister() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: (response) => {
      // Update auth store with user and tokens
      setAuth(response.user, response.tokens);

      // Invalidate and refetch user data
      void queryClient.invalidateQueries({ queryKey: authKeys.me() });
    },
  });
}

/**
 * useMe query
 * Fetches current authenticated user data
 * Only enabled when user is authenticated
 *
 * @example
 * const { data: user, isLoading } = useMe();
 */
export function useMe() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const updateUser = useAuthStore((state) => state.updateUser);

  const query = useQuery({
    queryKey: authKeys.me(),
    queryFn: async () => {
      const response = await authService.getMe();
      return response.user;
    },
    enabled: isAuthenticated, // Only fetch when authenticated
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Sync fetched user data to auth store
  // Using useEffect instead of deprecated onSuccess
  useEffect(() => {
    if (query.data) {
      updateUser(query.data);
    }
  }, [query.data, updateUser]);

  return query;
}

/**
 * useLogout mutation
 * Clears auth store and invalidates all queries
 *
 * @example
 * const { mutate: logout } = useLogout();
 * logout();
 */
export function useLogout() {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // No API call needed for logout in this implementation
      // If your backend has a logout endpoint, call it here:
      // await authService.logout();
    },
    onSuccess: () => {
      // Clear auth store
      clearAuth();

      // Clear all queries from cache
      queryClient.clear();
    },
  });
}
