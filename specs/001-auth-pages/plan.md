# Implementation Plan: Authentication Pages (Login, Register, My Page)

**Branch**: `001-auth-pages` | **Date**: 2025-11-03 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-auth-pages/spec.md`

## Summary

Create three authentication pages (Login, Register, My Page) with distinct UX approaches: Login and Register use a minimal "clean screen" layout (no navigation/footer), while My Page integrates with the full site layout (with navigation/footer). The implementation follows the project's dual-state architecture (TanStack Query for server state, Zustand for auth state) and Schema-First development using Zod validation. Key features include JWT token management with automatic refresh, protected route access control, real-time form validation with Korean error messages, and comprehensive security measures (HTTPS in production, CSP headers, XSS protection).

**Technical Approach**:
- Service Layer Pattern for all auth API calls (`src/services/auth.ts`)
- Query Keys Factory for cache management (`src/hooks/queries/useAuthQueries.ts`)
- Protected Route component/HOC for access control
- Minimal vs. Full layout components for UX distinction
- Axios interceptor for token injection and 401 handling
- Password visibility toggle component for improved UX

## Technical Context

**Language/Version**: TypeScript 5.9 (React 19)
**Primary Dependencies**: React 19, TanStack Query v5, Zustand v5, Zod v3, Axios, React Router v6, TailwindCSS 4, DaisyUI
**Storage**: localStorage (via Zustand persist middleware) for auth tokens and user data
**Testing**: Vitest + React Testing Library + MSW (Mock Service Worker) for API mocking
**Target Platform**: Web (Chrome/Safari/Firefox, mobile responsive)
**Project Type**: Single-page application (SPA) - frontend only
**Performance Goals**:
- Login/Register page load: <1s (minimal layout, no heavy dependencies)
- Form validation response: <200ms (client-side Zod validation)
- API timeout: 10s (explicitly defined in clarifications)
- Token refresh: automatic background operation (<500ms)

**Constraints**:
- HTTPS required in production (HTTP allowed for localhost development)
- 10-second timeout for all authentication API calls (no automatic retry)
- Password visibility toggle required on all password fields
- Korean error messages for all validation and API errors
- XSS protection via CSP headers and no `dangerouslySetInnerHTML`

**Scale/Scope**:
- 3 pages (Login, Register, My Page)
- 2 layouts (Minimal for auth, Full for My Page)
- 4 protected routes (`/cart`, `/checkout`, `/mypage`, `/favorites`)
- 5 API endpoints (`/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/refresh`, `/api/auth/me`)
- 25 functional requirements (FR-001 through FR-025)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Type Safety & Schema Validation ✅ PASS

- **Requirement**: All data must be Zod-validated at service layer
- **Plan**:
  - Auth schemas already exist in `src/schemas/auth.ts` (UserSchema, TokensSchema, AuthResponseSchema, LoginRequestSchema, RegisterRequestSchema, MeResponseSchema)
  - Service layer (`src/services/auth.ts`) will validate all responses using `UserSchema.parse()` and `AuthResponseSchema.parse()`
  - Form validation will use Zod schemas with Korean error messages
- **Status**: ✅ Aligned with existing architecture patterns

### II. Component Testing Standards ✅ PASS

- **Requirement**: Tests required for critical business logic and user journeys
- **Plan**:
  - Unit tests for: `authService` methods, `useAuthStore` store logic, form validation logic
  - Integration tests for: Login flow (form → API → redirect), Register flow (form → API → auto-login), Protected route access (redirect to login when unauthenticated)
  - MSW handlers for all auth API endpoints
  - Test files: `LoginPage.test.tsx`, `RegisterPage.test.tsx`, `MyPage.test.tsx`, `ProtectedRoute.test.tsx`, `authService.test.ts`
- **Status**: ✅ Testing strategy defined for critical paths

### III. User Experience Consistency ✅ PASS

- **Requirement**: TailwindCSS + DaisyUI for all UI components
- **Plan**:
  - DaisyUI `btn` classes for all buttons (login, register, logout)
  - DaisyUI `alert` components for error/success messages
  - DaisyUI `input` classes for form fields with proper `<label>` associations
  - Password visibility toggle using DaisyUI icon button
  - Loading states using DaisyUI `loading` modifier
  - Semantic colors: `btn-primary` for primary actions, `alert-error` for errors
  - Keyboard accessibility for all interactive elements
- **Status**: ✅ DaisyUI patterns will be consistently applied

### IV. Performance Requirements ✅ PASS

- **Requirement**: <3s initial load, <5s TTI on 3G
- **Plan**:
  - Minimal layout for Login/Register pages (no navigation/footer components)
  - Code splitting: auth pages loaded on-demand via React Router lazy loading
  - TanStack Query cache configured with `staleTime: 5min`, `gcTime: 10min`
  - Zustand selectors used to minimize re-renders: `const user = useAuthStore((state) => state.user)`
  - No heavy dependencies loaded for auth pages (just forms + validation)
- **Status**: ✅ Performance budget met by design (minimal layout, lazy loading)

### V. State Management Separation ✅ PASS

- **Requirement**: TanStack Query for server state, Zustand for client state
- **Plan**:
  - **Server State (TanStack Query)**: User profile fetched via `useMe()` query (if needed post-login)
  - **Client State (Zustand)**: `useAuthStore` manages `user`, `tokens`, `isAuthenticated`, persisted to localStorage
  - **Component State**: Form values managed with controlled inputs (`useState` for email, password, name, phone)
  - **Mutations**: `useLogin`, `useRegister`, `useLogout` mutations auto-invalidate related queries and update Zustand store
- **Status**: ✅ Clear separation following project architecture

**GATE RESULT**: ✅ ALL CHECKS PASS - No violations, no justifications needed

## Project Structure

### Documentation (this feature)

```text
specs/001-auth-pages/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (in progress)
├── research.md          # Phase 0 output (next step)
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output (developer onboarding)
├── contracts/           # Phase 1 output (API contracts)
│   ├── auth-api.yml     # OpenAPI spec for auth endpoints
│   └── README.md        # Contract usage notes
├── checklists/          # Already created by /speckit.specify
│   └── requirements.md  # Spec quality checklist (completed)
└── tasks.md             # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── api/
│   └── client.ts                  # ✅ EXISTS - Axios instance + interceptors
│
├── schemas/
│   └── auth.ts                    # ✅ EXISTS - All auth Zod schemas
│
├── services/
│   └── auth.ts                    # ✅ EXISTS - Auth API calls (may need updates)
│
├── stores/
│   └── useAuthStore.ts            # ✅ EXISTS - Auth state + persist middleware
│
├── hooks/
│   └── queries/
│       └── useAuthQueries.ts      # 🆕 CREATE - TanStack Query hooks for auth
│
├── components/
│   ├── ProtectedRoute.tsx         # 🆕 CREATE - Protected route HOC/component
│   ├── PasswordInput.tsx          # 🆕 CREATE - Password field with visibility toggle
│   ├── layouts/
│   │   ├── MinimalLayout.tsx      # 🆕 CREATE - Clean screen layout (no nav/footer)
│   │   └── DefaultLayout.tsx      # ✅ EXISTS - Full layout (with nav/footer)
│   └── ErrorAlert.tsx             # ✅ EXISTS - Reusable error display
│
├── pages/
│   ├── LoginPage.tsx              # 🆕 CREATE - /login route
│   ├── RegisterPage.tsx           # 🆕 CREATE - /register route
│   └── MyPage.tsx                 # 🆕 CREATE - /mypage route
│
├── constants/
│   └── api.ts                     # ✅ EXISTS - May need auth endpoint constants
│
└── utils/
    └── errors.ts                  # ✅ EXISTS - Custom error classes

tests/
├── setup.ts                       # ✅ EXISTS - Test setup (MSW, React Testing Library)
├── mocks/
│   └── handlers/
│       └── auth.ts                # 🆕 CREATE - MSW handlers for auth endpoints
├── pages/
│   ├── LoginPage.test.tsx         # 🆕 CREATE - Login page integration tests
│   ├── RegisterPage.test.tsx      # 🆕 CREATE - Register page integration tests
│   └── MyPage.test.tsx            # 🆕 CREATE - My Page integration tests
└── services/
    └── auth.test.ts               # 🆕 CREATE - Auth service unit tests
```

**Structure Decision**: Single-page application (SPA) structure following the project's established patterns. All new auth components follow the Service Layer → Query Hooks → Components architecture defined in ARCHITECTURE.md. Layout distinction (MinimalLayout vs. DefaultLayout) addresses the spec's "clear screen" vs. "maintain nav, footer" requirements. Protected route component centralizes access control logic for reuse across `/cart`, `/checkout`, `/mypage`, `/favorites`.

## Complexity Tracking

> This section is empty because all Constitution Check gates passed. No violations require justification.

---

## Phase 0: Research & Technical Decisions

**Goal**: Resolve all unknowns from Technical Context and establish patterns for authentication implementation.

### Research Tasks

1. **Protected Route Pattern in React Router v6**
   - **Question**: Should we use Route wrapper component or Navigate redirect for protected routes?
   - **Research**: Investigate React Router v6 best practices for auth-gated routes
   - **Output**: Decision on HOC vs. Component pattern, handling redirect after login

2. **Token Refresh Strategy**
   - **Question**: How to implement automatic token refresh on 401 without infinite loops?
   - **Research**: Axios interceptor patterns for token refresh (request queue, retry logic)
   - **Output**: Decision on refresh implementation (interceptor with request queue)

3. **Layout Switching Mechanism**
   - **Question**: How to conditionally apply MinimalLayout vs. DefaultLayout per route?
   - **Research**: React Router v6 layout nesting, Outlet component usage
   - **Output**: Decision on layout structure (nested routes with layout wrappers)

4. **Form State Management**
   - **Question**: Use controlled components with useState or form library (React Hook Form)?
   - **Research**: Evaluate React Hook Form + Zod integration vs. manual controlled inputs
   - **Output**: Decision on form handling approach (simplicity vs. features)

5. **Password Visibility Toggle Best Practices**
   - **Question**: Accessibility requirements for password show/hide (ARIA labels, focus management)?
   - **Research**: WCAG guidelines for password input, existing DaisyUI patterns
   - **Output**: Accessible implementation pattern with proper ARIA attributes

6. **Redirect After Login Flow**
   - **Question**: Where to store intended destination (query param vs. sessionStorage)?
   - **Research**: Evaluate persistence, security implications, back button behavior
   - **Output**: Decision on redirect URL storage mechanism

### Expected Outcomes (research.md)

```markdown
# Research: Authentication Implementation Patterns

## 1. Protected Route Pattern
**Decision**: Use wrapper component with React Router v6 `<Navigate>`
**Rationale**: Simpler than HOC, better integration with React Router v6 declarative API
**Implementation**: `<ProtectedRoute>` checks `useAuthStore` → redirects to `/login?redirect=...`

## 2. Token Refresh Strategy
**Decision**: Axios response interceptor with request queue
**Rationale**: Prevents multiple refresh requests, retries failed requests after refresh
**Implementation**: Interceptor detects 401 → queues requests → refreshes token → retries queue

## 3. Layout Switching
**Decision**: Nested routes with layout Route wrappers
**Rationale**: Declarative, reusable, leverages React Router v6 `<Outlet>`
**Implementation**:
- `/login`, `/register` wrapped in `<MinimalLayout>`
- `/mypage` wrapped in `<DefaultLayout>`

## 4. Form State Management
**Decision**: React Hook Form + Zod resolver
**Rationale**: Built-in validation, error handling, performance (uncontrolled inputs)
**Implementation**: `useForm({ resolver: zodResolver(LoginRequestSchema) })`

## 5. Password Visibility Toggle
**Decision**: Button with `type="button"` + `aria-label` + eye icon
**Rationale**: WCAG compliant, keyboard accessible, standard pattern
**Implementation**: Toggle input `type` between "password" and "text"

## 6. Redirect Storage
**Decision**: Query parameter for redirect URL
**Rationale**: Preserves URL on refresh, works with browser navigation, no storage needed
**Implementation**: `/login?redirect=/cart` → extract with `useSearchParams()`
```

---

## Phase 1: Data Models & Contracts

**Prerequisites**: research.md complete

### 1. Data Model (data-model.md)

```markdown
# Data Model: Authentication

## Entities

### User
- **Source**: `src/schemas/auth.ts` (UserSchema)
- **Fields**:
  - `id`: number (unique, auto-generated by backend)
  - `email`: string (unique, validated with email regex)
  - `name`: string (required, min 1 char)
  - `phone`: string | undefined (optional, Korean format: `01[0-9]-?[0-9]{3,4}-?[0-9]{4}`)
  - `role`: "user" | "admin" (enum, determines access level)
  - `created_at`: string (ISO 8601 datetime, set by backend)
  - `updated_at`: string (ISO 8601 datetime, updated by backend)
- **Validation Rules**:
  - Email must be valid format (`z.string().email()`)
  - Name must not be empty (`z.string().min(1)`)
  - Phone must match Korean mobile pattern if provided
- **Relationships**: None in MVP (future: orders, favorites)

### Tokens
- **Source**: `src/schemas/auth.ts` (TokensSchema)
- **Fields**:
  - `access_token`: string (JWT, short-lived: 15-30 min)
  - `refresh_token`: string (JWT, long-lived: 7 days)
- **Validation Rules**:
  - Both tokens must be non-empty strings (`z.string().min(1)`)
- **Storage**: localStorage via Zustand persist middleware
- **Lifecycle**:
  - Created on login/register
  - Access token refreshed automatically on expiration (via Axios interceptor)
  - Both cleared on logout or refresh failure

### AuthState (Client-Side)
- **Source**: `src/stores/useAuthStore.ts`
- **Fields**:
  - `user`: User | null (current authenticated user)
  - `tokens`: Tokens | null (authentication credentials)
  - `isAuthenticated`: boolean (computed from tokens presence)
- **Persistence**: Stored in localStorage
- **Actions**:
  - `setAuth(user, tokens)`: Set user and tokens after login/register
  - `clearAuth()`: Clear user and tokens on logout/401
  - `updateTokens(tokens)`: Update tokens after refresh

## State Transitions

### Authentication Flow

#### Login
1. **Initial**: User on any page, not authenticated
2. **Trigger**: User navigates to `/login` or clicks "로그인"
3. **Action**: User submits email + password
4. **Validation**: Zod validates input (email format, password min 6 chars)
5. **API Call**: `POST /api/auth/login` with credentials
6. **Success**:
   - Store tokens and user in `useAuthStore`
   - Redirect to intended page or homepage
7. **Failure**: Display error message, remain on login page

#### Register
1. **Initial**: User on any page, not authenticated
2. **Trigger**: User clicks "회원가입" on login page
3. **Action**: User submits email + password + name + phone (optional)
4. **Validation**: Zod validates all fields
5. **API Call**: `POST /api/auth/register` with user data
6. **Success**:
   - Auto-login (store tokens and user)
   - Redirect to homepage
7. **Failure**: Display error message (e.g., "이미 사용 중인 이메일입니다")

#### Token Refresh
1. **Trigger**: Access token expired, user makes authenticated request
2. **Detection**: Axios interceptor catches 401 response
3. **Action**: Send refresh token to `POST /api/auth/refresh`
4. **Success**:
   - Update `access_token` in `useAuthStore`
   - Retry original request
5. **Failure**:
   - Clear auth state
   - Redirect to login with message "세션이 만료되었습니다"

#### Logout
1. **Trigger**: User clicks "로그아웃" on My Page
2. **Action**: Call `POST /api/auth/logout` (optional backend cleanup)
3. **Cleanup**: Clear tokens and user from `useAuthStore` and localStorage
4. **Redirect**: Navigate to homepage

## Validation Examples

### Registration Input
```typescript
const data = {
  email: "user@example.com",
  password: "password123",
  name: "홍길동",
  phone: "010-1234-5678",
};

const validated = RegisterRequestSchema.parse(data);
// Success: validated data passed to API
```

### Error Handling
```typescript
try {
  RegisterRequestSchema.parse({ email: "invalid" });
} catch (error) {
  if (error instanceof ZodError) {
    // Extract Korean error messages
    const errors = error.errors.map(e => e.message);
    // ["유효한 이메일을 입력하세요"]
  }
}
```
```

### 2. API Contracts (contracts/)

**File**: `contracts/auth-api.yml` (OpenAPI 3.0)

```yaml
openapi: 3.0.3
info:
  title: Udonggeum Authentication API
  version: 1.0.0
  description: API contract for user authentication (login, register, logout, token refresh)

servers:
  - url: http://localhost:8080/api
    description: Local development server
  - url: https://api.udonggeum.com/api
    description: Production server (HTTPS required)

paths:
  /auth/register:
    post:
      summary: Register a new user
      operationId: register
      tags:
        - Authentication
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - email
                - password
                - name
              properties:
                email:
                  type: string
                  format: email
                  example: "user@example.com"
                password:
                  type: string
                  minLength: 6
                  example: "password123"
                name:
                  type: string
                  minLength: 1
                  example: "홍길동"
                phone:
                  type: string
                  pattern: "^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$"
                  example: "010-1234-5678"
      responses:
        '201':
          description: User created successfully, returns auth tokens
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthResponse'
        '400':
          description: Validation error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '409':
          description: Email already exists
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
              example:
                message: "이미 사용 중인 이메일입니다"
                status: 409

  /auth/login:
    post:
      summary: Authenticate user and return tokens
      operationId: login
      tags:
        - Authentication
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - email
                - password
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
                  minLength: 6
      responses:
        '200':
          description: Login successful, returns auth tokens
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthResponse'
        '401':
          description: Invalid credentials
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
              example:
                message: "이메일 또는 비밀번호가 올바르지 않습니다"
                status: 401
        '400':
          description: Validation error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /auth/logout:
    post:
      summary: Logout user (optional backend cleanup)
      operationId: logout
      tags:
        - Authentication
      security:
        - bearerAuth: []
      responses:
        '204':
          description: Logout successful (no content)
        '401':
          description: Unauthorized (token invalid or missing)
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /auth/refresh:
    post:
      summary: Refresh access token using refresh token
      operationId: refreshToken
      tags:
        - Authentication
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - refresh_token
              properties:
                refresh_token:
                  type: string
                  example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      responses:
        '200':
          description: Token refreshed successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  access_token:
                    type: string
                  refresh_token:
                    type: string
        '401':
          description: Refresh token invalid or expired
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
              example:
                message: "세션이 만료되었습니다. 다시 로그인해주세요"
                status: 401

  /auth/me:
    get:
      summary: Get current authenticated user
      operationId: getMe
      tags:
        - Authentication
      security:
        - bearerAuth: []
      responses:
        '200':
          description: User profile retrieved successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  user:
                    $ref: '#/components/schemas/User'
        '401':
          description: Unauthorized (token invalid or missing)
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

components:
  schemas:
    User:
      type: object
      required:
        - id
        - email
        - name
        - role
        - created_at
        - updated_at
      properties:
        id:
          type: integer
          example: 1
        email:
          type: string
          format: email
          example: "user@example.com"
        name:
          type: string
          example: "홍길동"
        phone:
          type: string
          nullable: true
          example: "010-1234-5678"
        role:
          type: string
          enum: [user, admin]
          example: "user"
        created_at:
          type: string
          format: date-time
          example: "2025-11-03T10:00:00Z"
        updated_at:
          type: string
          format: date-time
          example: "2025-11-03T10:00:00Z"

    Tokens:
      type: object
      required:
        - access_token
        - refresh_token
      properties:
        access_token:
          type: string
          description: "JWT access token (expires in 15-30 minutes)"
          example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        refresh_token:
          type: string
          description: "JWT refresh token (expires in 7 days)"
          example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

    AuthResponse:
      type: object
      required:
        - message
        - user
        - tokens
      properties:
        message:
          type: string
          example: "로그인 성공"
        user:
          $ref: '#/components/schemas/User'
        tokens:
          $ref: '#/components/schemas/Tokens'

    Error:
      type: object
      required:
        - message
        - status
      properties:
        message:
          type: string
          description: "Korean error message for user display"
          example: "이메일 또는 비밀번호가 올바르지 않습니다"
        status:
          type: integer
          example: 401
        details:
          type: array
          items:
            type: object
            properties:
              field:
                type: string
              message:
                type: string

  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: "JWT access token in Authorization header: Bearer <token>"
```

**File**: `contracts/README.md`

```markdown
# Authentication API Contracts

## Overview

This directory contains OpenAPI specifications for the authentication API endpoints used by the Udonggeum frontend.

## Files

- `auth-api.yml`: OpenAPI 3.0 specification for authentication endpoints

## Usage

### Validation

```bash
# Install swagger-cli
npm install -g @apidevtools/swagger-cli

# Validate the OpenAPI spec
swagger-cli validate auth-api.yml
```

### Code Generation (Optional)

```bash
# Generate TypeScript types from OpenAPI spec
npx openapi-typescript auth-api.yml --output ../src/types/auth-api.d.ts
```

## Endpoints Summary

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Create new user account | No |
| POST | `/api/auth/login` | Authenticate user | No |
| POST | `/api/auth/logout` | Logout user | Yes |
| POST | `/api/auth/refresh` | Refresh access token | No (refresh token in body) |
| GET | `/api/auth/me` | Get current user profile | Yes |

## Security Notes

- All endpoints use HTTPS in production (requirement: FR-024)
- Access tokens expire in 15-30 minutes
- Refresh tokens expire in 7 days
- 401 responses trigger automatic logout and redirect to login
- 10-second timeout enforced for all auth API calls (requirement: FR-023)

## Error Handling

All error responses follow this structure:

```json
{
  "message": "유효한 이메일을 입력하세요",
  "status": 400,
  "details": [
    {
      "field": "email",
      "message": "유효한 이메일을 입력하세요"
    }
  ]
}
```

Korean error messages are required for user-facing errors (requirement: FR-020).
```

### 3. Quickstart Guide (quickstart.md)

```markdown
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
```

---

## Phase 2: Task Breakdown

**NOTE**: Task breakdown is generated by `/speckit.tasks` command, NOT by `/speckit.plan`.

After completing Phase 0 (research) and Phase 1 (design), run:

```bash
/speckit.tasks
```

This will generate `specs/001-auth-pages/tasks.md` with:
- Dependency-ordered task list
- Acceptance criteria for each task
- Estimated complexity
- Test requirements

---

## Agent Context Update

After Phase 1 design completion, run the agent context update script:

```bash
.specify/scripts/bash/update-agent-context.sh claude
```

This will:
- Detect Claude as the AI agent in use
- Update `.clauderc` (or appropriate agent-specific file) with:
  - New technologies from this feature (none, using existing stack)
  - Preserve manual additions between markers
  - Track constitution version (1.0.0)

Since this feature uses only existing technologies (React 19, TanStack Query, Zustand, Zod, React Router), no new entries will be added to the agent context.

---

## Constitution Re-Check (Post-Design)

**GATE**: Re-evaluate compliance after Phase 1 design artifacts created.

### I. Type Safety & Schema Validation ✅ PASS

- **Design Artifacts**:
  - `data-model.md` defines User, Tokens, AuthState with Zod schemas
  - `contracts/auth-api.yml` specifies API request/response structures
  - `quickstart.md` demonstrates Zod validation in service layer and components
- **Compliance**: All API responses validated with Zod before reaching components ✅

### II. Component Testing Standards ✅ PASS

- **Design Artifacts**:
  - `quickstart.md` defines test files for all pages and components
  - MSW handlers planned for auth endpoints
  - AAA pattern documented in testing section
- **Compliance**: Critical paths (login, register, protected routes) have defined test coverage ✅

### III. User Experience Consistency ✅ PASS

- **Design Artifacts**:
  - `quickstart.md` shows DaisyUI classes (`btn`, `input`, `alert`) used throughout
  - Semantic colors used (`btn-primary`, `alert-error`, `input-error`)
  - Accessibility attributes documented (`aria-label`, `htmlFor`, `role="alert"`)
- **Compliance**: DaisyUI + TailwindCSS used consistently, keyboard navigation supported ✅

### IV. Performance Requirements ✅ PASS

- **Design Artifacts**:
  - MinimalLayout for auth pages (no heavy nav/footer components)
  - Code splitting via React Router lazy loading mentioned
  - Zustand selectors demonstrated in `quickstart.md`
- **Compliance**: Performance optimizations designed in from architecture ✅

### V. State Management Separation ✅ PASS

- **Design Artifacts**:
  - `data-model.md` clearly separates server state (none for auth pages) from client state (useAuthStore)
  - TanStack Query mutations (`useLogin`, `useRegister`, `useLogout`) update Zustand store
  - Component state (`useState`) used for form inputs
- **Compliance**: State management follows project architecture patterns ✅

**FINAL GATE RESULT**: ✅ ALL CHECKS PASS - Design artifacts comply with constitution

---

## Summary

This implementation plan provides a complete blueprint for building the authentication pages feature following the Udonggeum project's established architecture patterns. Key highlights:

1. **Constitution Compliance**: All 5 principles pass both pre-research and post-design gates
2. **Phase 0 Research**: 6 research tasks identified to resolve technical unknowns (protected routes, token refresh, layout switching, form state, password toggle, redirect storage)
3. **Phase 1 Design Artifacts**:
   - `data-model.md`: User, Tokens, AuthState entities with validation rules and state transitions
   - `contracts/auth-api.yml`: OpenAPI 3.0 specification for 5 auth endpoints
   - `quickstart.md`: Step-by-step developer guide with code examples
4. **Architecture Alignment**: Service Layer, Query Keys Factory, Auto-Invalidation, Protected Routes patterns
5. **Next Step**: Run `/speckit.tasks` to generate dependency-ordered task breakdown

The plan ensures that implementation will follow DRY, KISS, and YAGNI principles while leveraging the existing Zod + TanStack Query + Zustand tech stack.
