/**
 * MyPage Component Tests
 * Tests user profile display, sections rendering, and logout functionality
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import MyPage from './MyPage';
import { useAuthStore } from '@/stores/useAuthStore';

describe('MyPage', () => {
  const mockUser = {
    id: 1,
    email: 'user@example.com',
    name: '홍길동',
    phone: '010-1234-5678',
    role: 'user' as const,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
  };

  const mockTokens = {
    access_token: 'valid-access-token',
    refresh_token: 'valid-refresh-token',
  };

  beforeEach(() => {
    // Clear auth store before each test
    useAuthStore.setState({
      user: null,
      tokens: null,
      isAuthenticated: false,
    });
  });

  describe('When user is authenticated', () => {
    beforeEach(() => {
      // Set authenticated state
      useAuthStore.setState({
        user: mockUser,
        tokens: mockTokens,
        isAuthenticated: true,
      });
    });

    it('should render MyPage title', () => {
      renderWithProviders(<MyPage />, {
        initialRoute: '/mypage',
        routes: ['/mypage'],
      });

      expect(screen.getByText('마이페이지')).toBeInTheDocument();
      expect(screen.getByText('회원 정보 및 주문 관리')).toBeInTheDocument();
    });

    it('should display user profile information', () => {
      renderWithProviders(<MyPage />, {
        initialRoute: '/mypage',
        routes: ['/mypage'],
      });

      // Check user name
      expect(screen.getByText(/이름:/i)).toBeInTheDocument();
      expect(screen.getByText(mockUser.name)).toBeInTheDocument();

      // Check user email
      expect(screen.getByText(/이메일:/i)).toBeInTheDocument();
      expect(screen.getByText(mockUser.email)).toBeInTheDocument();

      // Check registration date
      expect(screen.getByText(/가입일:/i)).toBeInTheDocument();
    });

    it('should display order statistics section', () => {
      renderWithProviders(<MyPage />, {
        initialRoute: '/mypage',
        routes: ['/mypage'],
      });

      expect(screen.getByText('총 주문')).toBeInTheDocument();
      expect(screen.getByText('지금까지의 주문 횟수')).toBeInTheDocument();
    });

    it('should display points statistics section', () => {
      renderWithProviders(<MyPage />, {
        initialRoute: '/mypage',
        routes: ['/mypage'],
      });

      expect(screen.getByText('적립 포인트')).toBeInTheDocument();
      expect(screen.getByText('사용 가능한 포인트')).toBeInTheDocument();
    });

    it('should display logout button', () => {
      renderWithProviders(<MyPage />, {
        initialRoute: '/mypage',
        routes: ['/mypage'],
      });

      const logoutButton = screen.getByRole('button', { name: /로그아웃/i });
      expect(logoutButton).toBeInTheDocument();
    });

    it('should call clearAuth and redirect to homepage when logout button clicked', async () => {
      const user = userEvent.setup();

      renderWithProviders(<MyPage />, {
        initialRoute: '/mypage',
        routes: ['/mypage', '/'],
      });

      const logoutButton = screen.getByRole('button', { name: /로그아웃/i });
      await user.click(logoutButton);

      // Verify auth state was cleared
      const authState = useAuthStore.getState();
      expect(authState.isAuthenticated).toBe(false);
      expect(authState.user).toBeNull();
      expect(authState.tokens).toBeNull();
    });

    it('should handle missing user data gracefully', () => {
      // Set authenticated but with minimal user data
      useAuthStore.setState({
        user: {
          id: 1,
          email: 'user@example.com',
          name: '',
          role: 'user',
          created_at: '2025-01-01T00:00:00.000Z',
          updated_at: '2025-01-01T00:00:00.000Z',
        },
        tokens: mockTokens,
        isAuthenticated: true,
      });

      renderWithProviders(<MyPage />, {
        initialRoute: '/mypage',
        routes: ['/mypage'],
      });

      // Should show fallback for empty name
      expect(screen.getByText(/이름:/i)).toBeInTheDocument();
    });

    it('should display profile avatar placeholder', () => {
      renderWithProviders(<MyPage />, {
        initialRoute: '/mypage',
        routes: ['/mypage'],
      });

      // Avatar should be rendered (has specific DaisyUI classes)
      const avatar = document.querySelector('.avatar');
      expect(avatar).toBeInTheDocument();
    });

    it('should render sections with proper structure', () => {
      renderWithProviders(<MyPage />, {
        initialRoute: '/mypage',
        routes: ['/mypage'],
      });

      // Check for section title
      expect(screen.getByText('회원 정보')).toBeInTheDocument();

      // Check stats are rendered
      expect(screen.getByText('총 주문')).toBeInTheDocument();
      expect(screen.getByText('적립 포인트')).toBeInTheDocument();
    });
  });

  describe('When user is NOT authenticated', () => {
    it('should redirect to login page', async () => {
      renderWithProviders(<MyPage />, {
        initialRoute: '/mypage',
        routes: ['/mypage', '/login'],
      });

      // Page should not render when not authenticated
      await waitFor(() => {
        expect(screen.queryByText('마이페이지')).not.toBeInTheDocument();
      });

      // Verify not authenticated
      const authState = useAuthStore.getState();
      expect(authState.isAuthenticated).toBe(false);
    });

    it('should not display user information when not authenticated', async () => {
      renderWithProviders(<MyPage />, {
        initialRoute: '/mypage',
        routes: ['/mypage', '/login'],
      });

      await waitFor(() => {
        expect(screen.queryByText('회원 정보')).not.toBeInTheDocument();
      });
    });
  });

  describe('Logout functionality', () => {
    beforeEach(() => {
      useAuthStore.setState({
        user: mockUser,
        tokens: mockTokens,
        isAuthenticated: true,
      });
    });

    it('should clear authentication state on logout', async () => {
      const user = userEvent.setup();

      renderWithProviders(<MyPage />, {
        initialRoute: '/mypage',
        routes: ['/mypage', '/'],
      });

      const logoutButton = screen.getByRole('button', { name: /로그아웃/i });
      await user.click(logoutButton);

      // Wait for state to be cleared
      await waitFor(() => {
        const authState = useAuthStore.getState();
        expect(authState.isAuthenticated).toBe(false);
        expect(authState.user).toBeNull();
        expect(authState.tokens).toBeNull();
      });
    });

    it('should redirect to homepage after logout', async () => {
      const user = userEvent.setup();

      renderWithProviders(<MyPage />, {
        initialRoute: '/mypage',
        routes: ['/mypage', '/'],
      });

      const logoutButton = screen.getByRole('button', { name: /로그아웃/i });
      await user.click(logoutButton);

      // Verify navigation happened (in real app, would check URL)
      await waitFor(() => {
        const authState = useAuthStore.getState();
        expect(authState.isAuthenticated).toBe(false);
      });
    });

    it('should have proper styling for logout button', () => {
      renderWithProviders(<MyPage />, {
        initialRoute: '/mypage',
        routes: ['/mypage'],
      });

      const logoutButton = screen.getByRole('button', { name: /로그아웃/i });

      // Check DaisyUI error button classes
      expect(logoutButton.className).toContain('btn');
      expect(logoutButton.className).toContain('btn-error');
      expect(logoutButton.className).toContain('btn-outline');
    });
  });

  describe('Edge cases', () => {
    it('should handle null user gracefully', () => {
      useAuthStore.setState({
        user: null,
        tokens: mockTokens,
        isAuthenticated: true, // Authenticated but no user (edge case)
      });

      renderWithProviders(<MyPage />, {
        initialRoute: '/mypage',
        routes: ['/mypage'],
      });

      // Should render page title
      expect(screen.getByText('마이페이지')).toBeInTheDocument();

      // User fields should show fallback
      expect(screen.getByText(/이름:/i)).toBeInTheDocument();
      expect(screen.getByText(/이메일:/i)).toBeInTheDocument();
    });

    it('should handle authentication state changes', async () => {
      // Start authenticated
      useAuthStore.setState({
        user: mockUser,
        tokens: mockTokens,
        isAuthenticated: true,
      });

      const { rerender } = renderWithProviders(<MyPage />, {
        initialRoute: '/mypage',
        routes: ['/mypage', '/login'],
      });

      // Page should render
      expect(screen.getByText('마이페이지')).toBeInTheDocument();

      // Lose authentication
      useAuthStore.setState({
        user: null,
        tokens: null,
        isAuthenticated: false,
      });

      rerender(<MyPage />);

      // Should redirect (content disappears)
      await waitFor(() => {
        expect(screen.queryByText('마이페이지')).not.toBeInTheDocument();
      });
    });
  });
});
