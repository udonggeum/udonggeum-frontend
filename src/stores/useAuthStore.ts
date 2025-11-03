import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, Tokens } from '@/schemas/auth';
import { STORAGE_KEYS } from '@/constants/api';

/**
 * Auth store state
 */
interface AuthState {
  user: User | null;
  tokens: Tokens | null;
  isAuthenticated: boolean;
}

/**
 * Auth store actions
 */
interface AuthActions {
  setAuth: (user: User, tokens: Tokens) => void;
  updateUser: (user: User) => void;
  updateTokens: (tokens: Tokens) => void;
  clearAuth: () => void;
}

/**
 * Auth store type
 */
type AuthStore = AuthState & AuthActions;

/**
 * Auth store
 *
 * Manages authentication state with persistence
 * - Persists user and tokens to localStorage
 * - Automatically rehydrates on app load
 * - Provides actions for login, logout, and user updates
 *
 * @example
 * // In components or hooks
 * const { user, isAuthenticated, setAuth, clearAuth } = useAuthStore();
 *
 * // In services or interceptors (without React)
 * const token = useAuthStore.getState().tokens?.access_token;
 * useAuthStore.getState().clearAuth();
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      tokens: null,
      isAuthenticated: false,

      // Actions
      setAuth: (user, tokens) =>
        set({
          user,
          tokens,
          isAuthenticated: true,
        }),

      updateUser: (user) =>
        set((state) => ({
          user,
          // Keep isAuthenticated if user is updated
          isAuthenticated: state.isAuthenticated,
        })),

      updateTokens: (tokens) =>
        set((state) => ({
          tokens,
          // Keep user and isAuthenticated when tokens are refreshed
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        })),

      clearAuth: () =>
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: STORAGE_KEYS.AUTH_STORE,
      storage: createJSONStorage(() => localStorage),
      // Only persist user and tokens (isAuthenticated is derived)
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
