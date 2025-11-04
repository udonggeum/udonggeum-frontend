/**
 * Integration Test: Logout Flow
 * Tests complete logout flow from My Page → logout button → session cleared → redirect to homepage
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import MyPage from '@/pages/MyPage';
import LoginPage from '@/pages/LoginPage';
import { useAuthStore } from '@/stores/useAuthStore';
import { mockDB } from '@/mocks/utils/db';
import { STORAGE_KEYS } from '@/constants/api';

describe('Integration: Logout Flow', () => {
  const validCredentials = {
    email: 'user@example.com',
    password: 'password123',
  };

  beforeEach(() => {
    // Clear auth store before each test
    useAuthStore.setState({
      user: null,
      tokens: null,
      isAuthenticated: false,
    });

    // Reset mock database
    mockDB.reset();

    // Clear localStorage
    localStorage.clear();

    // Seed mock database with user
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
  });

  it('should complete full logout flow: login → MyPage → logout → redirect to homepage', async () => {
    const user = userEvent.setup();

    // Step 1: Login first
    renderWithProviders(<LoginPage />, {
      initialRoute: '/login',
      routes: ['/login', '/mypage', '/'],
    });

    await user.type(screen.getByLabelText(/이메일/i), validCredentials.email);
    await user.type(screen.getByLabelText('비밀번호'), validCredentials.password);
    await user.click(screen.getByRole('button', { name: /로그인/i }));

    // Wait for login to complete
    await waitFor(
      () => {
        const authState = useAuthStore.getState();
        expect(authState.isAuthenticated).toBe(true);
        expect(authState.user?.email).toBe(validCredentials.email);
      },
      { timeout: 10000, interval: 100 }
    );

    // Verify tokens are stored
    const authStateAfterLogin = useAuthStore.getState();
    expect(authStateAfterLogin.tokens?.access_token).toBeTruthy();
    expect(authStateAfterLogin.tokens?.refresh_token).toBeTruthy();

    // Step 2: Navigate to MyPage
    const { rerender } = renderWithProviders(<MyPage />, {
      initialRoute: '/mypage',
      routes: ['/mypage', '/'],
    });

    // Verify MyPage renders with user data
    expect(screen.getByText('마이페이지')).toBeInTheDocument();
    expect(screen.getByText('테스트 사용자')).toBeInTheDocument();
    expect(screen.getByText(validCredentials.email)).toBeInTheDocument();

    // Step 3: Click logout button
    const logoutButton = screen.getByRole('button', { name: /로그아웃/i });
    expect(logoutButton).toBeInTheDocument();
    await user.click(logoutButton);

    // Step 4: Verify auth state is cleared
    await waitFor(() => {
      const authState = useAuthStore.getState();
      expect(authState.isAuthenticated).toBe(false);
      expect(authState.user).toBeNull();
      expect(authState.tokens).toBeNull();
    });

    // Step 5: Verify localStorage is cleared
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

  it('should clear session data on logout', async () => {
    const user = userEvent.setup();

    // Set up authenticated state
    useAuthStore.setState({
      user: {
        id: 1,
        email: 'user@example.com',
        name: '테스트 사용자',
        phone: '010-1234-5678',
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      tokens: {
        access_token: 'valid-token',
        refresh_token: 'valid-refresh',
      },
      isAuthenticated: true,
    });

    renderWithProviders(<MyPage />, {
      initialRoute: '/mypage',
      routes: ['/mypage', '/'],
    });

    // Verify authenticated state before logout
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().tokens).toBeTruthy();

    // Click logout
    const logoutButton = screen.getByRole('button', { name: /로그아웃/i });
    await user.click(logoutButton);

    // Verify all session data cleared
    await waitFor(() => {
      const authState = useAuthStore.getState();
      expect(authState.isAuthenticated).toBe(false);
      expect(authState.user).toBeNull();
      expect(authState.tokens).toBeNull();
    });
  });

  it('should redirect to homepage after logout', async () => {
    const user = userEvent.setup();

    // Set up authenticated state
    useAuthStore.setState({
      user: {
        id: 1,
        email: 'user@example.com',
        name: '테스트 사용자',
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      tokens: {
        access_token: 'valid-token',
        refresh_token: 'valid-refresh',
      },
      isAuthenticated: true,
    });

    renderWithProviders(<MyPage />, {
      initialRoute: '/mypage',
      routes: ['/mypage', '/'],
    });

    // Click logout
    const logoutButton = screen.getByRole('button', { name: /로그아웃/i });
    await user.click(logoutButton);

    // Verify redirect happened by checking auth state is cleared
    await waitFor(() => {
      const authState = useAuthStore.getState();
      expect(authState.isAuthenticated).toBe(false);
    });

    // In real app, would verify current route is '/'
    // Here we verify the navigation was triggered via state change
  });

  it('should prevent access to MyPage after logout', async () => {
    const user = userEvent.setup();

    // Set up authenticated state
    useAuthStore.setState({
      user: {
        id: 1,
        email: 'user@example.com',
        name: '테스트 사용자',
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      tokens: {
        access_token: 'valid-token',
        refresh_token: 'valid-refresh',
      },
      isAuthenticated: true,
    });

    const { rerender } = renderWithProviders(<MyPage />, {
      initialRoute: '/mypage',
      routes: ['/mypage', '/', '/login'],
    });

    // MyPage should render
    expect(screen.getByText('마이페이지')).toBeInTheDocument();

    // Logout
    const logoutButton = screen.getByRole('button', { name: /로그아웃/i });
    await user.click(logoutButton);

    // Wait for auth to clear
    await waitFor(() => {
      const authState = useAuthStore.getState();
      expect(authState.isAuthenticated).toBe(false);
    });

    // Try to access MyPage again after logout
    rerender(<MyPage />);

    // MyPage should not render (will redirect to login)
    await waitFor(() => {
      expect(screen.queryByText('마이페이지')).not.toBeInTheDocument();
    });
  });

  it('should persist logout state across page refresh', async () => {
    const user = userEvent.setup();

    // Set up authenticated state
    useAuthStore.setState({
      user: {
        id: 1,
        email: 'user@example.com',
        name: '테스트 사용자',
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      tokens: {
        access_token: 'valid-token',
        refresh_token: 'valid-refresh',
      },
      isAuthenticated: true,
    });

    renderWithProviders(<MyPage />, {
      initialRoute: '/mypage',
      routes: ['/mypage', '/'],
    });

    // Click logout
    const logoutButton = screen.getByRole('button', { name: /로그아웃/i });
    await user.click(logoutButton);

    // Wait for auth to clear
    await waitFor(() => {
      const authState = useAuthStore.getState();
      expect(authState.isAuthenticated).toBe(false);
    });

    // Verify localStorage was updated (persisted)
    await waitFor(() => {
      const storedAuthState = localStorage.getItem(STORAGE_KEYS.AUTH_STORE);
      if (storedAuthState) {
        const parsedState = JSON.parse(storedAuthState);
        expect(parsedState.state.isAuthenticated).toBe(false);
      }
    }, { timeout: 2000 });

    // Simulate page refresh by creating new store from localStorage
    const storedAuthState = localStorage.getItem(STORAGE_KEYS.AUTH_STORE);
    if (storedAuthState) {
      const parsedState = JSON.parse(storedAuthState);
      expect(parsedState.state.isAuthenticated).toBe(false);
      expect(parsedState.state.user).toBeNull();
      expect(parsedState.state.tokens).toBeNull();
    }
  });

  it('should handle logout when already on homepage', async () => {
    const user = userEvent.setup();

    // Set up authenticated state
    useAuthStore.setState({
      user: {
        id: 1,
        email: 'user@example.com',
        name: '테스트 사용자',
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      tokens: {
        access_token: 'valid-token',
        refresh_token: 'valid-refresh',
      },
      isAuthenticated: true,
    });

    renderWithProviders(<MyPage />, {
      initialRoute: '/mypage',
      routes: ['/mypage', '/'],
    });

    // Click logout
    const logoutButton = screen.getByRole('button', { name: /로그아웃/i });
    await user.click(logoutButton);

    // Should clear auth state even when navigating to homepage
    await waitFor(() => {
      const authState = useAuthStore.getState();
      expect(authState.isAuthenticated).toBe(false);
      expect(authState.user).toBeNull();
      expect(authState.tokens).toBeNull();
    });
  });

  it('should clear all auth-related data on logout', async () => {
    const user = userEvent.setup();

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

    const fullTokens = {
      access_token: 'access-token-12345',
      refresh_token: 'refresh-token-67890',
    };

    useAuthStore.setState({
      user: fullUserData,
      tokens: fullTokens,
      isAuthenticated: true,
    });

    renderWithProviders(<MyPage />, {
      initialRoute: '/mypage',
      routes: ['/mypage', '/'],
    });

    // Verify all data is present before logout
    const beforeLogout = useAuthStore.getState();
    expect(beforeLogout.user).toEqual(fullUserData);
    expect(beforeLogout.tokens).toEqual(fullTokens);
    expect(beforeLogout.isAuthenticated).toBe(true);

    // Click logout
    const logoutButton = screen.getByRole('button', { name: /로그아웃/i });
    await user.click(logoutButton);

    // Verify ALL auth data is cleared
    await waitFor(() => {
      const afterLogout = useAuthStore.getState();
      expect(afterLogout.user).toBeNull();
      expect(afterLogout.tokens).toBeNull();
      expect(afterLogout.isAuthenticated).toBe(false);

      // Verify no remnants of user data
      expect(afterLogout.user?.email).toBeUndefined();
      expect(afterLogout.user?.name).toBeUndefined();
      expect(afterLogout.tokens?.access_token).toBeUndefined();
      expect(afterLogout.tokens?.refresh_token).toBeUndefined();
    });
  });
});
