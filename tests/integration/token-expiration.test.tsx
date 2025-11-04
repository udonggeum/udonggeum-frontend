/**
 * Integration Test: Token Expiration Flow
 * Tests handling of completely expired sessions where both tokens are invalid
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { waitFor } from '@testing-library/react';
import { useAuthStore } from '@/stores/useAuthStore';
import { apiClient } from '@/api/client';
import { mockDB } from '@/mocks/utils/db';
import { STORAGE_KEYS } from '@/constants/api';

// Mock window.location
const mockLocation = {
  href: '/',
};

beforeEach(() => {
  Object.defineProperty(window, 'location', {
    value: mockLocation,
    writable: true,
  });
});

describe('Integration: Token Expiration Flow', () => {
  const validUser = {
    id: 1,
    email: 'user@example.com',
    name: '테스트 사용자',
    phone: '010-1234-5678',
    role: 'user' as const,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
  };

  const expiredTokens = {
    access_token: 'fully-expired-access-token',
    refresh_token: 'fully-expired-refresh-token',
  };

  beforeEach(() => {
    // Clear auth store
    useAuthStore.setState({
      user: null,
      tokens: null,
      isAuthenticated: false,
    });

    // Reset mock database
    mockDB.reset();

    // Clear localStorage
    localStorage.clear();

    // Reset location mock
    mockLocation.href = '/';

    // Create test user
    mockDB.createUser({
      email: 'user@example.com',
      password: 'password123',
      name: '테스트 사용자',
      phone: '010-1234-5678',
      role: 'user',
    });
  });

  afterEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should logout and clear auth state when refresh token is expired', async () => {
    // Set up authenticated state with expired tokens
    useAuthStore.setState({
      user: validUser,
      tokens: expiredTokens,
      isAuthenticated: true,
    });

    // Verify initial state
    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    // Simulate a scenario where refresh fails
    // Call clearAuth directly (as interceptor would do on refresh failure)
    useAuthStore.getState().clearAuth();

    // Verify auth state is cleared
    await waitFor(() => {
      const authState = useAuthStore.getState();
      expect(authState.isAuthenticated).toBe(false);
      expect(authState.user).toBeNull();
      expect(authState.tokens).toBeNull();
    });
  });

  it('should clear all user data when session expires', async () => {
    // Set up authenticated state with full user data
    const fullUserData = {
      id: 1,
      email: 'user@example.com',
      name: '테스트 사용자',
      phone: '010-1234-5678',
      role: 'user' as const,
      created_at: '2025-01-01T00:00:00.000Z',
      updated_at: '2025-01-01T00:00:00.000Z',
    };

    useAuthStore.setState({
      user: fullUserData,
      tokens: expiredTokens,
      isAuthenticated: true,
    });

    // Simulate session expiration
    useAuthStore.getState().clearAuth();

    await waitFor(() => {
      const authState = useAuthStore.getState();

      // All fields should be null
      expect(authState.user).toBeNull();
      expect(authState.tokens).toBeNull();
      expect(authState.isAuthenticated).toBe(false);

      // Verify no remnants
      expect(authState.user?.email).toBeUndefined();
      expect(authState.user?.name).toBeUndefined();
      expect(authState.tokens?.access_token).toBeUndefined();
      expect(authState.tokens?.refresh_token).toBeUndefined();
    });
  });

  it('should clear localStorage when session expires', async () => {
    // Set up authenticated state
    useAuthStore.setState({
      user: validUser,
      tokens: expiredTokens,
      isAuthenticated: true,
    });

    // Wait for state to persist
    await waitFor(() => {
      const stored = localStorage.getItem(STORAGE_KEYS.AUTH_STORE);
      expect(stored).toBeTruthy();
    }, { timeout: 2000 });

    // Simulate session expiration
    useAuthStore.getState().clearAuth();

    // Verify localStorage is cleared
    await waitFor(() => {
      const storedAuthState = localStorage.getItem(STORAGE_KEYS.AUTH_STORE);
      if (storedAuthState) {
        const parsedState = JSON.parse(storedAuthState);
        expect(parsedState.state.isAuthenticated).toBe(false);
        expect(parsedState.state.user).toBeNull();
        expect(parsedState.state.tokens).toBeNull();
      }
    }, { timeout: 2000 });
  });

  it('should handle missing refresh token gracefully', async () => {
    // Set up state with access token but no refresh token
    useAuthStore.setState({
      user: validUser,
      tokens: {
        access_token: 'expired-access-token',
        refresh_token: '',
      },
      isAuthenticated: true,
    });

    // Simulate what interceptor does when refresh token is missing
    const refreshToken = useAuthStore.getState().tokens?.refresh_token;

    if (!refreshToken) {
      useAuthStore.getState().clearAuth();
    }

    // Verify auth was cleared
    await waitFor(() => {
      const authState = useAuthStore.getState();
      expect(authState.isAuthenticated).toBe(false);
      expect(authState.user).toBeNull();
    });
  });

  it('should prevent access to protected resources after session expires', async () => {
    // Set up authenticated state
    useAuthStore.setState({
      user: validUser,
      tokens: expiredTokens,
      isAuthenticated: true,
    });

    // User should initially be authenticated
    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    // Simulate session expiration
    useAuthStore.getState().clearAuth();

    await waitFor(() => {
      // User should no longer be authenticated
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });

    // Attempt to make authenticated request would now fail
    // (ProtectedRoute would redirect to login)
    const authState = useAuthStore.getState();
    expect(authState.isAuthenticated).toBe(false);
    expect(authState.tokens).toBeNull();
  });

  it('should handle token expiration during active session', async () => {
    // User is actively using the app
    useAuthStore.setState({
      user: validUser,
      tokens: {
        access_token: 'active-token',
        refresh_token: 'active-refresh',
      },
      isAuthenticated: true,
    });

    // Verify active session
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().tokens?.access_token).toBe('active-token');

    // Simulate tokens expiring
    useAuthStore.setState({
      user: validUser,
      tokens: expiredTokens,
      isAuthenticated: true,
    });

    // Now simulate the refresh failure
    useAuthStore.getState().clearAuth();

    await waitFor(() => {
      const authState = useAuthStore.getState();
      expect(authState.isAuthenticated).toBe(false);
      expect(authState.user).toBeNull();
    });
  });

  it('should not persist expired session across page refresh', async () => {
    // Set up expired session
    useAuthStore.setState({
      user: validUser,
      tokens: expiredTokens,
      isAuthenticated: true,
    });

    // Clear it (as would happen on refresh failure)
    useAuthStore.getState().clearAuth();

    await waitFor(() => {
      const stored = localStorage.getItem(STORAGE_KEYS.AUTH_STORE);
      if (stored) {
        const parsedState = JSON.parse(stored);
        expect(parsedState.state.isAuthenticated).toBe(false);
      }
    }, { timeout: 2000 });

    // Simulate page refresh by reading from localStorage
    const storedAuthState = localStorage.getItem(STORAGE_KEYS.AUTH_STORE);
    if (storedAuthState) {
      const parsedState = JSON.parse(storedAuthState);

      // Should not have valid session
      expect(parsedState.state.isAuthenticated).toBe(false);
      expect(parsedState.state.user).toBeNull();
      expect(parsedState.state.tokens).toBeNull();
    }
  });

  it('should handle simultaneous token expirations gracefully', async () => {
    // Set up authenticated state
    useAuthStore.setState({
      user: validUser,
      tokens: expiredTokens,
      isAuthenticated: true,
    });

    // Simulate multiple requests failing due to expired tokens
    const failedRequests = [
      Promise.resolve().then(() => useAuthStore.getState().clearAuth()),
      Promise.resolve().then(() => useAuthStore.getState().clearAuth()),
      Promise.resolve().then(() => useAuthStore.getState().clearAuth()),
    ];

    await Promise.all(failedRequests);

    // State should be cleared (not corrupted by multiple clears)
    const authState = useAuthStore.getState();
    expect(authState.isAuthenticated).toBe(false);
    expect(authState.user).toBeNull();
    expect(authState.tokens).toBeNull();
  });

  it('should require re-authentication after session expires', async () => {
    // Set up expired session
    useAuthStore.setState({
      user: validUser,
      tokens: expiredTokens,
      isAuthenticated: true,
    });

    // Clear auth on expiration
    useAuthStore.getState().clearAuth();

    await waitFor(() => {
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });

    // User needs to login again
    // Simulate login
    const newTokens = {
      access_token: 'new-login-token',
      refresh_token: 'new-login-refresh',
    };

    useAuthStore.getState().setAuth(validUser, newTokens);

    await waitFor(() => {
      const authState = useAuthStore.getState();
      expect(authState.isAuthenticated).toBe(true);
      expect(authState.tokens?.access_token).toBe('new-login-token');
    });
  });

  it('should clean up all session data on expiration', async () => {
    // Set up comprehensive session data
    useAuthStore.setState({
      user: {
        ...validUser,
        phone: '010-9876-5432',
      },
      tokens: expiredTokens,
      isAuthenticated: true,
    });

    // Verify rich session data exists
    expect(useAuthStore.getState().user?.phone).toBe('010-9876-5432');

    // Clear on expiration
    useAuthStore.getState().clearAuth();

    await waitFor(() => {
      const authState = useAuthStore.getState();

      // Everything should be null
      expect(authState.user).toBeNull();
      expect(authState.tokens).toBeNull();
      expect(authState.isAuthenticated).toBe(false);

      // No data remnants
      expect(Object.keys(authState).filter(key =>
        authState[key as keyof typeof authState] !== null &&
        typeof authState[key as keyof typeof authState] !== 'function'
      ).length).toBe(1); // Only isAuthenticated (false) remains
    });
  });
});
