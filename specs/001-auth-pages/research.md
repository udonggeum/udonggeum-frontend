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
