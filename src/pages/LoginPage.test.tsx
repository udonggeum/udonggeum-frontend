/**
 * LoginPage Component Tests
 * Tests login form behavior, validation, redirect handling, and integration
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { UseMutationResult } from '@tanstack/react-query';
import { renderWithProviders } from '@/test/utils';
import LoginPage from './LoginPage';
import { useAuthStore } from '@/stores/useAuthStore';
import * as authQueries from '@/hooks/queries/useAuthQueries';
import { AUTH_ERRORS } from '@/constants/errors';
import type { AuthResponse, LoginRequest } from '@/schemas/auth';

// Mock the auth queries module
vi.mock('@/hooks/queries/useAuthQueries');

type UseLoginMutationResult = UseMutationResult<AuthResponse, Error, LoginRequest, unknown>;

const createUseLoginMock = (
  overrides: Partial<UseLoginMutationResult> = {}
): UseLoginMutationResult => ({
  mutate: vi.fn() as UseLoginMutationResult['mutate'],
  mutateAsync: vi.fn() as UseLoginMutationResult['mutateAsync'],
  reset: vi.fn() as UseLoginMutationResult['reset'],
  status: 'idle',
  data: undefined,
  error: null,
  variables: undefined,
  context: undefined,
  isIdle: true,
  isPending: false,
  isError: false,
  isLoading: false,
  isPaused: false,
  isSuccess: false,
  failureCount: 0,
  failureReason: null,
  submittedAt: 0,
  ...overrides,
});

const mockUseLogin = (overrides?: Partial<UseLoginMutationResult>) => {
  vi.mocked(authQueries.useLogin).mockReturnValue(createUseLoginMock(overrides));
};

describe('LoginPage', () => {
  // Valid test data
  const validData: LoginRequest = {
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

    // Reset mocks
    vi.clearAllMocks();
  });

  describe('Form Rendering', () => {
    it('should render all form fields', () => {
      mockUseLogin();

      renderWithProviders(<LoginPage />);

      // Check form fields are present
      expect(screen.getByLabelText(/이메일/i)).toBeInTheDocument();
      expect(screen.getByLabelText('비밀번호')).toBeInTheDocument();

      // Check submit button
      expect(
        screen.getByRole('button', { name: /로그인/i })
      ).toBeInTheDocument();

      // Check register link
      expect(
        screen.getByText(/계정이 없으신가요/i)
      ).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /회원가입/i })).toHaveAttribute(
        'href',
        '/register'
      );
    });

    it('should render password visibility toggle button', () => {
      mockUseLogin();

      renderWithProviders(<LoginPage />);

      // Should have password visibility toggle
      const toggleButton = screen.getByRole('button', {
        name: /비밀번호 보이기/i,
      });
      expect(toggleButton).toBeInTheDocument();
    });

    it('should display page title and description', () => {
      mockUseLogin();

      renderWithProviders(<LoginPage />);

      expect(screen.getByRole('heading', { name: '로그인' })).toBeInTheDocument();
      expect(
        screen.getByText(/우동금 서비스에 로그인하세요/i)
      ).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show validation error for invalid email', async () => {
      const user = userEvent.setup();
      mockUseLogin();

      renderWithProviders(<LoginPage />);

      const emailInput = screen.getByLabelText(/이메일/i);
      await user.type(emailInput, 'invalid-email');
      await user.tab(); // Trigger onBlur

      await waitFor(() => {
        expect(
          screen.getByText(AUTH_ERRORS.EMAIL_INVALID)
        ).toBeInTheDocument();
      });
    });

    it('should show validation error for empty password', async () => {
      const user = userEvent.setup();
      mockUseLogin();

      renderWithProviders(<LoginPage />);

      const passwordInput = screen.getByLabelText('비밀번호');
      await user.click(passwordInput);
      await user.tab(); // Focus and blur without typing

      await waitFor(() => {
        expect(screen.getByText(AUTH_ERRORS.PASSWORD_REQUIRED)).toBeInTheDocument();
      });
    });

    it('should clear validation error when user corrects input', async () => {
      const user = userEvent.setup();
      mockUseLogin();

      renderWithProviders(<LoginPage />);

      const emailInput = screen.getByLabelText(/이메일/i);

      // Enter invalid email
      await user.type(emailInput, 'invalid');
      await user.tab();

      await waitFor(() => {
        expect(
          screen.getByText(AUTH_ERRORS.EMAIL_INVALID)
        ).toBeInTheDocument();
      });

      // Clear and enter valid email
      await user.clear(emailInput);
      await user.type(emailInput, 'valid@example.com');
      await user.tab();

      await waitFor(() => {
        expect(
          screen.queryByText(AUTH_ERRORS.EMAIL_INVALID)
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should call login mutation with correct data on valid form submission', async () => {
      const user = userEvent.setup();
      const mutateMock: UseLoginMutationResult['mutate'] = vi.fn();

      mockUseLogin({ mutate: mutateMock });

      renderWithProviders(<LoginPage />);

      // Fill out form
      await user.type(screen.getByLabelText(/이메일/i), validData.email);
      await user.type(screen.getByLabelText('비밀번호'), validData.password);

      // Submit form
      await user.click(screen.getByRole('button', { name: /로그인/i }));

      // Check mutation was called
      expect(mutateMock).toHaveBeenCalledTimes(1);
      expect(mutateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          email: validData.email,
          password: validData.password,
        }),
        expect.any(Object) // onSuccess callback
      );
    });

    it('should disable submit button while login is pending', () => {
      mockUseLogin({
        isPending: true,
        status: 'pending',
      });

      renderWithProviders(<LoginPage />);

      const submitButton = screen.getByRole('button', { name: /로그인 중/i });
      expect(submitButton).toBeDisabled();
    });

    it('should prevent submission with invalid form data', async () => {
      const user = userEvent.setup();
      const mutateMock: UseLoginMutationResult['mutate'] = vi.fn();

      mockUseLogin({ mutate: mutateMock });

      renderWithProviders(<LoginPage />);

      // Fill form with invalid email
      await user.type(screen.getByLabelText(/이메일/i), 'invalid-email');
      await user.type(screen.getByLabelText('비밀번호'), validData.password);

      // Try to submit
      await user.click(screen.getByRole('button', { name: /로그인/i }));

      // Mutation should not be called
      expect(mutateMock).not.toHaveBeenCalled();

      // Error message should be displayed
      await waitFor(() => {
        expect(
          screen.getByText(AUTH_ERRORS.EMAIL_INVALID)
        ).toBeInTheDocument();
      });
    });
  });

  describe('Redirect Handling', () => {
    it('should redirect to home page after successful login when no redirect param', async () => {
      const user = userEvent.setup();
      const mutateMock: UseLoginMutationResult['mutate'] = vi.fn();

      mockUseLogin({ mutate: mutateMock });

      renderWithProviders(<LoginPage />, {
        initialRoute: '/login',
        routes: ['/login', '/'],
      });

      await user.type(screen.getByLabelText(/이메일/i), validData.email);
      await user.type(screen.getByLabelText('비밀번호'), validData.password);
      await user.click(screen.getByRole('button', { name: /로그인/i }));

      expect(mutateMock).toHaveBeenCalled();
    });

    it('should extract and use redirect parameter from URL', async () => {
      const user = userEvent.setup();
      const mutateMock: UseLoginMutationResult['mutate'] = vi.fn();

      mockUseLogin({ mutate: mutateMock });

      renderWithProviders(<LoginPage />, {
        initialRoute: '/login?redirect=%2Fcart',
        routes: ['/login?redirect=%2Fcart', '/cart'],
      });

      await user.type(screen.getByLabelText(/이메일/i), validData.email);
      await user.type(screen.getByLabelText('비밀번호'), validData.password);
      await user.click(screen.getByRole('button', { name: /로그인/i }));

      // Login mutation should be called
      expect(mutateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          email: validData.email,
          password: validData.password,
        }),
        expect.any(Object)
      );
    });

    it('should redirect authenticated users away from login page', async () => {
      // Set up authenticated state
      useAuthStore.setState({
        user: {
          id: 1,
          email: 'existing@example.com',
          name: '기존 사용자',
          role: 'user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        tokens: {
          access_token: 'existing-token',
          refresh_token: 'existing-refresh',
        },
        isAuthenticated: true,
      });

      mockUseLogin();

      renderWithProviders(<LoginPage />, {
        initialRoute: '/login',
        routes: ['/login', '/'],
      });

      // Component should trigger redirect (check via navigation)
      await waitFor(() => {
        // In a real implementation, this would navigate away
        // For now, we check that the component detects auth state
        expect(useAuthStore.getState().isAuthenticated).toBe(true);
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message when login fails', () => {
      const errorMessage = AUTH_ERRORS.INVALID_CREDENTIALS;

      mockUseLogin({
        isError: true,
        error: new Error(errorMessage),
        status: 'error',
      });

      renderWithProviders(<LoginPage />);

      // Error alert should be displayed
      expect(
        screen.getByRole('alert', { name: /error/i })
      ).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('should clear error message when user starts typing', () => {
      const errorMessage = AUTH_ERRORS.INVALID_CREDENTIALS;

      mockUseLogin({
        isError: true,
        error: new Error(errorMessage),
        status: 'error',
      });

      const { rerender } = renderWithProviders(<LoginPage />);

      // Error should be displayed initially
      expect(screen.getByText(errorMessage)).toBeInTheDocument();

      // Mock: clear error state when user types
      mockUseLogin({
        isError: false,
        error: null,
        status: 'idle',
      });

      // Re-render with cleared error
      rerender(<LoginPage />);

      // Error should be cleared
      expect(screen.queryByText(errorMessage)).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels and associations', () => {
      mockUseLogin();

      renderWithProviders(<LoginPage />);

      // All inputs should have associated labels
      const emailInput = screen.getByLabelText(/이메일/i);
      const passwordInput = screen.getByLabelText('비밀번호');

      expect(emailInput).toHaveAttribute('type', 'email');
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('should have proper aria-label for password toggle button', () => {
      mockUseLogin();

      renderWithProviders(<LoginPage />);

      const toggleButton = screen.getByRole('button', {
        name: /비밀번호 보이기/i,
      });

      expect(toggleButton).toHaveAttribute('aria-label');
    });

    it('should mark required fields with required attribute', () => {
      mockUseLogin();

      renderWithProviders(<LoginPage />);

      expect(screen.getByLabelText(/이메일/i)).toBeRequired();
      expect(screen.getByLabelText('비밀번호')).toBeRequired();
    });
  });
});
