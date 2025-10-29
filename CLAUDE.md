# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**우동금 (Udonggeum)** is a local jewelry platform connecting neighborhood gold/silver shops with customers. The frontend is built with React 19, TypeScript 5.9, Vite 7, and TailwindCSS 4.

## Essential Commands

### Development
```bash
npm install          # Install dependencies
npm run dev          # Start dev server with Vite proxy (http://localhost:5173)
npm run build        # Build for production (TypeScript check + Vite build)
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

### MSW (Mock Service Worker)
```bash
npx msw init public  # Initialize MSW worker (already done)
```

MSW is configured for API mocking in development. Handlers are in `src/mocks/handlers/`.

## Architecture Principles

**Read `docs/ARCHITECTURE.md` and `docs/STYLE_GUIDE.md` before coding.**

### Core Principles
- **DRY**: Extract common logic into reusable functions/hooks/components
- **KISS**: Prefer simple patterns over complex abstractions
- **YAGNI**: Only implement when needed, avoid premature optimization

### State Management Strategy

This project uses a **dual-state architecture**:

1. **Server State (TanStack Query)**: All data from API (products, cart, orders, stores, user profile)
   - Auto-caching, background sync, deduplication
   - Query keys managed in factory pattern (see `src/hooks/queries/`)

2. **Client State (Zustand)**: Client-only state
   - **Auth Store** (`useAuthStore`): User, tokens, isAuthenticated (persisted to localStorage)
   - **UI Store** (`useUIStore`): Theme, modals, toasts (runtime only)
   - Use selectors to minimize re-renders: `const user = useAuthStore((state) => state.user)`

### Schema-First Development (Zod)

**All types are auto-generated from Zod schemas** located in `src/schemas/`:
```typescript
// 1. Define Zod schema (validation + type)
export const UserSchema = z.object({
  id: z.number(),
  email: z.string().email('유효한 이메일을 입력하세요'),
  name: z.string().min(1, '이름을 입력하세요'),
});

// 2. Auto-generate TypeScript type
export type User = z.infer<typeof UserSchema>;

// 3. Runtime validation in services
const user = UserSchema.parse(data);
```

This ensures type safety at both compile-time AND runtime.

## Data Flow Architecture

```
Component
    ↓
TanStack Query Hook (useQuery/useMutation)
    ↓
Service Layer (pure API calls, Zod validation)
    ↓
API Client (Axios with interceptors)
    ↓
Backend API
```

### Key Patterns

1. **Service Layer Pattern** (`src/services/*.ts`):
   - Pure API calls, no React dependencies
   - Zod validation happens here
   - Singleton classes: `authService`, `productsService`, etc.

2. **Query Keys Factory** (`src/hooks/queries/*.ts`):
   ```typescript
   export const productsKeys = {
     all: ['products'] as const,
     lists: () => [...productsKeys.all, 'list'] as const,
     list: (params?: ProductsRequest) => [...productsKeys.lists(), params] as const,
     details: () => [...productsKeys.all, 'detail'] as const,
     detail: (id: number) => [...productsKeys.details(), id] as const,
   };
   ```
   - Prevents typos, enables bulk invalidation, provides IntelliSense

3. **Auto-Invalidation Pattern**:
   - Mutations automatically invalidate related queries via `onSuccess`
   - Example: Creating order invalidates orders list + cart

4. **Conditional Queries**:
   - Use `enabled` option to conditionally fetch (e.g., only when authenticated)

## Directory Structure

```
src/
├── api/                    # API configuration
│   └── client.ts           # Axios instance + interceptors (auth, logging, error handling)
│
├── schemas/                # Zod schemas (SINGLE SOURCE OF TRUTH for types + validation)
│   ├── auth.ts
│   ├── products.ts
│   ├── cart.ts
│   ├── orders.ts
│   └── index.ts
│
├── services/               # API call logic (pure functions, no React)
│   ├── auth.ts
│   ├── products.ts
│   ├── cart.ts
│   ├── orders.ts
│   └── stores.ts
│
├── stores/                 # Zustand stores
│   ├── useAuthStore.ts     # Auth state (persisted to localStorage)
│   └── useUIStore.ts       # UI state (runtime only)
│
├── hooks/
│   └── queries/            # TanStack Query hooks
│       ├── useAuthQueries.ts
│       ├── useProductsQueries.ts
│       ├── useCartQueries.ts
│       ├── useOrdersQueries.ts
│       └── useStoresQueries.ts
│
├── components/             # Reusable UI components (PascalCase files)
├── pages/                  # Page components
├── constants/              # App-wide constants
│   └── api.ts              # API endpoints, error messages
├── types/                  # Additional TypeScript types
└── utils/                  # Pure utility functions
    ├── errors.ts           # Custom error classes (ApiError, NetworkError, ValidationError)
    └── apiLogger.ts        # Request/response logging
```

## Path Aliases

Configured in both `vite.config.ts` and `tsconfig.app.json`:
```typescript
import { Button } from '@/components/Button';
import { apiClient } from '@/api/client';
import { useAuth } from '@/hooks/queries';
import { productsService } from '@/services/products';
import { API_BASE_URL } from '@/constants/api';
import type { User } from '@/schemas/auth';
```

## Error Handling

### 1. Axios Interceptor (Automatic)
- **401 Unauthorized**: Auto-logout + redirect to `/login`
- **Network errors**: Converted to `NetworkError`
- **API errors**: Converted to `ApiError` with status code

### 2. Zod Validation Errors
- Convert to `ValidationError` using `ValidationError.fromZod(error)`
- Display Korean error messages

### 3. Component-Level
```typescript
function LoginPage() {
  const { mutate: login, error } = useLogin();

  return (
    <div>
      {error && <ErrorMessage>{error.message}</ErrorMessage>}
      <button onClick={() => login({ email, password })}>로그인</button>
    </div>
  );
}
```

## Code Style Guidelines

### File Naming
- **Components**: PascalCase (`UserProfile.tsx`)
- **Utilities**: camelCase (`formatDate.ts`)
- **Constants**: UPPER_SNAKE_CASE (`API_CONSTANTS.ts`)

### React Component Structure
```tsx
// 1. Imports (external → internal → types → styles)
import React, { useState, useEffect } from 'react';
import { Button } from '@/components';
import type { User } from '@/schemas/auth';

// 2. Types/Interfaces
interface UserProfileProps {
  userId: string;
}

// 3. Constants
const MAX_RETRY = 3;

// 4. Component
export default function UserProfile({ userId }: UserProfileProps) {
  // State declarations
  const [user, setUser] = useState<User | null>(null);

  // Effects
  useEffect(() => {
    // ...
  }, [userId]);

  // Handlers
  const handleUpdate = () => {
    // ...
  };

  // Render
  return <div>{user?.name}</div>;
}
```

### Naming Conventions
- **Booleans**: `isLoading`, `hasError`, `shouldUpdate`
- **Functions**: Start with verb (`fetchUser`, `handleClick`, `validateForm`)
- **Custom Hooks**: `use*` prefix (`useAuth`, `useFetch`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`, `API_BASE_URL`)

### TypeScript Rules
- **Avoid `any`**: Use `unknown` + type guards
- **Interface vs Type**: Props use `interface`, unions/tuples use `type`
- **Generics**: Use descriptive names (`TData`, `TResponse` instead of `T`)
- **Optional chaining**: Use `?.` liberally

## Environment Configuration

- **Development**: Uses Vite proxy to avoid CORS (configured in `vite.config.ts`)
  - Frontend: `http://localhost:5173`
  - API calls to `/api/*` proxied to `http://localhost:8080`

- **Production**: Uses direct API URLs from environment variables

See `docs/ENVIRONMENT_SETUP.md` for details.

## Commit Convention

Follow the format defined in `docs/COMMIT_CONVENTION.md`:
```
[TYPE] concise description (50 chars max, in English)

Optional:
- Detailed explanation (wrap at 72 chars, in Korean)
- Breaking Change: description
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Example:
```
[feat] add user authentication

사용자 로그인 및 회원가입 기능을 추가했습니다.
JWT 토큰 기반 인증을 사용합니다.
```

## Important Notes

1. **Always validate with Zod** in service layer before returning data
2. **Use Zustand selectors** to minimize re-renders
3. **Invalidate queries** in mutation `onSuccess` callbacks
4. **No `dangerouslySetInnerHTML`** (XSS prevention)
5. **All async functions need try-catch** with proper error handling
6. **Access Zustand outside React** via `.getState()` (used in Axios interceptor)

## Related Documentation

- `docs/ARCHITECTURE.md` - Comprehensive architecture guide
- `docs/STYLE_GUIDE.md` - Detailed code style rules
- `docs/COMMIT_CONVENTION.md` - Commit message format
- `docs/ENVIRONMENT_SETUP.md` - Environment variable configuration
- `docs/우동금_FigJam_페이지별_와이어프레임_흐름도.md` - Page flow wireframes
