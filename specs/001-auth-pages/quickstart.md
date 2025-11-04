# Quickstart: Authentication Pages Implementation

## Prerequisites

- Node.js 18+ installed
- Project dependencies installed: `npm install`
- Backend API running on `http://localhost:8080` (or configured in Vite proxy)
- Familiarity with React 19, TypeScript, TanStack Query, Zustand

## Overview

This guide walks you through implementing the authentication pages (Login, Register, My Page) for the Udonggeum platform. Follow the steps in order to build the feature correctly.

## Step 1: Verify Existing Architecture

Before starting, confirm these files exist and understand their purpose:

```bash
# Zod schemas (already exist)
src/schemas/auth.ts           # UserSchema, TokensSchema, AuthResponseSchema, etc.

# Zustand store (already exists)
src/stores/useAuthStore.ts    # Auth state management (user, tokens, isAuthenticated)

# API client (already exists)
src/api/client.ts             # Axios instance with interceptors

# Service layer (may need updates)
src/services/auth.ts          # API call methods (login, register, logout, etc.)
```

## Step 2: Create TanStack Query Hooks

**File**: `src/hooks/queries/useAuthQueries.ts`

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth';
import { useAuthStore } from '@/stores/useAuthStore';
import type { LoginRequest, RegisterRequest } from '@/schemas/auth';

// Query keys factory
export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
};

// Login mutation
export function useLogin() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (response, variables, context) => {
      // Store auth data
      setAuth(response.user, response.tokens);

      // Redirect to intended page or homepage
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect') || '/';
      navigate(redirect);
    },
  });
}

// Register mutation
export function useRegister() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: (response) => {
      // Auto-login after registration
      setAuth(response.user, response.tokens);
      navigate('/');
    },
  });
}

// Logout mutation
export function useLogout() {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      clearAuth();
      navigate('/');
    },
  });
}
```

## Step 3: Create Protected Route Component

**File**: `src/components/ProtectedRoute.tsx`

```typescript
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login with return URL
    return <Navigate to={`/login?redirect=${location.pathname}`} replace />;
  }

  return <>{children}</>;
}
```

## Step 4: Create Layout Components

**File**: `src/components/layouts/MinimalLayout.tsx` (for Login/Register)

```typescript
import { Outlet } from 'react-router-dom';

export default function MinimalLayout() {
  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <Outlet />
    </div>
  );
}
```

**File**: Update `src/components/layouts/DefaultLayout.tsx` if needed (already exists)

## Step 5: Create Password Input Component

**File**: `src/components/PasswordInput.tsx`

```typescript
import { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface PasswordInputProps {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
}

export default function PasswordInput({
  id,
  name,
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  required,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="form-control w-full">
      <label htmlFor={id} className="label">
        <span className="label-text">비밀번호</span>
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          className={`input input-bordered w-full pr-10 ${error ? 'input-error' : ''}`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보이기'}
          className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-ghost btn-sm btn-circle"
        >
          {showPassword ? (
            <EyeSlashIcon className="w-5 h-5" aria-hidden="true" />
          ) : (
            <EyeIcon className="w-5 h-5" aria-hidden="true" />
          )}
        </button>
      </div>
      {error && (
        <label className="label">
          <span className="label-text-alt text-error">{error}</span>
        </label>
      )}
    </div>
  );
}
```

## Step 6: Create Login Page

**File**: `src/pages/LoginPage.tsx`

```typescript
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLogin } from '@/hooks/queries/useAuthQueries';
import { LoginRequestSchema } from '@/schemas/auth';
import { ZodError } from 'zod';
import PasswordInput from '@/components/PasswordInput';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { mutate: login, isPending, error } = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      // Validate with Zod
      const validated = LoginRequestSchema.parse({ email, password });
      login(validated);
    } catch (err) {
      if (err instanceof ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach((e) => {
          if (e.path[0]) {
            fieldErrors[e.path[0] as string] = e.message;
          }
        });
        setErrors(fieldErrors);
      }
    }
  };

  return (
    <div className="card w-full max-w-md bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-2xl font-bold justify-center mb-4">
          로그인
        </h2>

        {error && (
          <div role="alert" className="alert alert-error alert-soft mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-control w-full mb-4">
            <label htmlFor="email" className="label">
              <span className="label-text">이메일</span>
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className={`input input-bordered w-full ${errors.email ? 'input-error' : ''}`}
              required
            />
            {errors.email && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.email}</span>
              </label>
            )}
          </div>

          <PasswordInput
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            placeholder="비밀번호 (최소 6자)"
            required
          />

          <button
            type="submit"
            className="btn btn-primary w-full mt-6"
            disabled={isPending}
          >
            {isPending ? <span className="loading loading-spinner"></span> : '로그인'}
          </button>
        </form>

        <div className="divider">또는</div>

        <Link to="/register" className="link link-primary text-center">
          회원가입
        </Link>
      </div>
    </div>
  );
}
```

## Step 7: Create Register Page

**File**: `src/pages/RegisterPage.tsx` (similar structure to LoginPage, with name and phone fields)

## Step 8: Create My Page

**File**: `src/pages/MyPage.tsx`

```typescript
import { useAuthStore } from '@/stores/useAuthStore';
import { useLogout } from '@/hooks/queries/useAuthQueries';

export default function MyPage() {
  const user = useAuthStore((state) => state.user);
  const { mutate: logout, isPending } = useLogout();

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">마이페이지</h1>

      {/* Profile Section */}
      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <h2 className="card-title">프로필 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-base-content/60">이름</p>
              <p className="font-medium">{user.name}</p>
            </div>
            <div>
              <p className="text-sm text-base-content/60">이메일</p>
              <p className="font-medium">{user.email}</p>
            </div>
            {user.phone && (
              <div>
                <p className="text-sm text-base-content/60">전화번호</p>
                <p className="font-medium">{user.phone}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-base-content/60">가입일</p>
              <p className="font-medium">
                {new Date(user.created_at).toLocaleDateString('ko-KR')}
              </p>
            </div>
          </div>
          <div className="card-actions justify-end mt-4">
            <button
              onClick={() => logout()}
              className="btn btn-outline btn-error"
              disabled={isPending}
            >
              {isPending ? <span className="loading loading-spinner"></span> : '로그아웃'}
            </button>
          </div>
        </div>
      </div>

      {/* Order History Section */}
      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <h2 className="card-title">주문 내역</h2>
          <p className="text-base-content/60">주문 내역이 없습니다</p>
        </div>
      </div>

      {/* Favorites Section */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">찜 목록</h2>
          <p className="text-base-content/60">찜한 상품이 없습니다</p>
        </div>
      </div>
    </div>
  );
}
```

## Step 9: Configure Routes

**File**: Update `src/App.tsx` or `src/router.tsx`

```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MinimalLayout from '@/components/layouts/MinimalLayout';
import DefaultLayout from '@/components/layouts/DefaultLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import MyPage from '@/pages/MyPage';
import { useAuthStore } from '@/stores/useAuthStore';

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <BrowserRouter>
      <Routes>
        {/* Minimal Layout for Auth Pages */}
        <Route element={<MinimalLayout />}>
          <Route
            path="/login"
            element={
              isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
            }
          />
          <Route
            path="/register"
            element={
              isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />
            }
          />
        </Route>

        {/* Default Layout for App Pages */}
        <Route element={<DefaultLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/mypage"
            element={
              <ProtectedRoute>
                <MyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <CartPage />
              </ProtectedRoute>
            }
          />
          {/* Add other protected routes */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

## Step 10: Update Axios Interceptor for Token Refresh

**File**: Update `src/api/client.ts`

```typescript
// Add response interceptor for 401 handling and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // If 401 and not already retried, attempt token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { tokens } = useAuthStore.getState();
        if (tokens?.refresh_token) {
          const response = await authService.refreshToken(tokens.refresh_token);
          useAuthStore.getState().updateTokens(response);

          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers['Authorization'] = `Bearer ${response.access_token}`;
          }
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        useAuthStore.getState().clearAuth();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // For other errors, convert to custom error types
    if (!error.response) {
      return Promise.reject(new NetworkError(ERROR_MESSAGES.NETWORK_ERROR));
    }

    return Promise.reject(new ApiError(error.response.data.message, error.response.status));
  }
);
```

## Step 11: Testing

Create test files for each component:

```bash
tests/
├── pages/
│   ├── LoginPage.test.tsx
│   ├── RegisterPage.test.tsx
│   └── MyPage.test.tsx
├── components/
│   └── ProtectedRoute.test.tsx
└── mocks/
    └── handlers/
        └── auth.ts              # MSW handlers for auth endpoints
```

## Step 12: Run and Verify

```bash
# Start dev server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Verification Checklist

- [ ] Login page loads with minimal layout (no nav/footer)
- [ ] Register page loads with minimal layout
- [ ] My Page loads with full layout (nav + footer)
- [ ] Form validation shows Korean error messages
- [ ] Password field has visibility toggle (eye icon)
- [ ] Successful login redirects to intended page or homepage
- [ ] Protected routes redirect to login when unauthenticated
- [ ] Logout clears tokens and redirects to homepage
- [ ] Token refresh happens automatically on 401
- [ ] Session persists across browser restart (localStorage)
- [ ] Already-authenticated users redirected from /login and /register to homepage

## Troubleshooting

**Issue**: Redirect loop after login
**Solution**: Check that `isAuthenticated` is computed correctly in `useAuthStore`

**Issue**: Token not included in API requests
**Solution**: Verify Axios interceptor is adding `Authorization: Bearer {token}` header

**Issue**: Password toggle not working
**Solution**: Check `PasswordInput` component button `type="button"` (not submit)

**Issue**: Layout not switching between pages
**Solution**: Verify route structure uses nested Routes with layout Route wrappers

## Next Steps

After completing this implementation:

1. Run `/speckit.tasks` to generate detailed task breakdown for implementation
2. Implement each component iteratively with tests
3. Conduct manual testing of all user scenarios from spec.md
4. Address any edge cases discovered during testing
5. Update documentation with any changes or learnings
