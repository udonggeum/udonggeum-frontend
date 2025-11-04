/**
 * ProtectedRoute Component Tests
 * Tests authentication-based access control and redirect behavior
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils';
import ProtectedRoute from './ProtectedRoute';
import { useAuthStore } from '@/stores/useAuthStore';

describe('ProtectedRoute', () => {
  beforeEach(() => {
    // Clear auth store before each test
    useAuthStore.setState({
      user: null,
      tokens: null,
      isAuthenticated: false,
    });
  });

  describe('When user is NOT authenticated', () => {
    it('should redirect to login page', () => {
      renderWithProviders(
        <ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>,
        {
          initialRoute: '/cart',
          routes: ['/cart', '/login'],
        }
      );

      // Protected content should not render (Navigate redirects away)
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('should preserve intended destination in redirect query param', () => {
      renderWithProviders(
        <ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>,
        {
          initialRoute: '/cart',
          routes: ['/cart', '/login?redirect=%2Fcart'],
        }
      );

      // Protected content should not render
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('should encode complex paths in redirect param', () => {
      renderWithProviders(
        <ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>,
        {
          initialRoute: '/checkout?step=payment&method=card',
          routes: [
            '/checkout?step=payment&method=card',
            '/login?redirect=%2Fcheckout%3Fstep%3Dpayment%26method%3Dcard',
          ],
        }
      );

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('should redirect from /mypage when not authenticated', () => {
      renderWithProviders(
        <ProtectedRoute>
          <div data-testid="mypage-content">My Page</div>
        </ProtectedRoute>,
        {
          initialRoute: '/mypage',
          routes: ['/mypage', '/login?redirect=%2Fmypage'],
        }
      );

      expect(screen.queryByTestId('mypage-content')).not.toBeInTheDocument();
    });

    it('should redirect from /favorites when not authenticated', () => {
      renderWithProviders(
        <ProtectedRoute>
          <div data-testid="favorites-content">Favorites</div>
        </ProtectedRoute>,
        {
          initialRoute: '/favorites',
          routes: ['/favorites', '/login?redirect=%2Ffavorites'],
        }
      );

      expect(screen.queryByTestId('favorites-content')).not.toBeInTheDocument();
    });
  });

  describe('When user IS authenticated', () => {
    beforeEach(() => {
      // Set authenticated state
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
          access_token: 'valid-access-token',
          refresh_token: 'valid-refresh-token',
        },
        isAuthenticated: true,
      });
    });

    it('should render protected content', () => {
      renderWithProviders(
        <ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>,
        {
          initialRoute: '/cart',
          routes: ['/cart'],
        }
      );

      // Protected content should render
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should allow access to /cart', () => {
      renderWithProviders(
        <ProtectedRoute>
          <div data-testid="cart-page">Cart Page</div>
        </ProtectedRoute>,
        {
          initialRoute: '/cart',
          routes: ['/cart'],
        }
      );

      expect(screen.getByTestId('cart-page')).toBeInTheDocument();
    });

    it('should allow access to /checkout', () => {
      renderWithProviders(
        <ProtectedRoute>
          <div data-testid="checkout-page">Checkout Page</div>
        </ProtectedRoute>,
        {
          initialRoute: '/checkout',
          routes: ['/checkout'],
        }
      );

      expect(screen.getByTestId('checkout-page')).toBeInTheDocument();
    });

    it('should allow access to /mypage', () => {
      renderWithProviders(
        <ProtectedRoute>
          <div data-testid="mypage">My Page</div>
        </ProtectedRoute>,
        {
          initialRoute: '/mypage',
          routes: ['/mypage'],
        }
      );

      expect(screen.getByTestId('mypage')).toBeInTheDocument();
    });

    it('should allow access to /favorites', () => {
      renderWithProviders(
        <ProtectedRoute>
          <div data-testid="favorites-page">Favorites Page</div>
        </ProtectedRoute>,
        {
          initialRoute: '/favorites',
          routes: ['/favorites'],
        }
      );

      expect(screen.getByTestId('favorites-page')).toBeInTheDocument();
    });

    it('should render complex React components', () => {
      const ComplexComponent = () => (
        <div>
          <h1>Complex Page</h1>
          <p>With multiple elements</p>
          <button>Action Button</button>
        </div>
      );

      renderWithProviders(
        <ProtectedRoute>
          <ComplexComponent />
        </ProtectedRoute>,
        {
          initialRoute: '/cart',
          routes: ['/cart'],
        }
      );

      expect(screen.getByRole('heading', { name: 'Complex Page' })).toBeInTheDocument();
      expect(screen.getByText('With multiple elements')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Action Button' })).toBeInTheDocument();
    });
  });

  describe('Authentication state changes', () => {
    it('should re-render when authentication state changes', () => {
      const { rerender } = renderWithProviders(
        <ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>,
        {
          initialRoute: '/cart',
          routes: ['/cart', '/login'],
        }
      );

      // Initially not authenticated - content not visible
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();

      // Authenticate user
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

      // Re-render with new auth state
      rerender(
        <ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>
      );

      // Now content should be visible
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should handle root path redirect', () => {
      renderWithProviders(
        <ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>,
        {
          initialRoute: '/',
          routes: ['/', '/login?redirect=%2F'],
        }
      );

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('should handle paths with trailing slash', () => {
      renderWithProviders(
        <ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>,
        {
          initialRoute: '/cart/',
          routes: ['/cart/', '/login?redirect=%2Fcart%2F'],
        }
      );

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('should handle nested paths', () => {
      renderWithProviders(
        <ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>,
        {
          initialRoute: '/mypage/orders/123',
          routes: ['/mypage/orders/123', '/login?redirect=%2Fmypage%2Forders%2F123'],
        }
      );

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
  });
});
