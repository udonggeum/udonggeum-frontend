# Udonggeum Frontend Prompt Guide

## 사용 방법
- 우동금 프론트엔드에서 새 페이지나 기능을 설계/구현할 때 아래 프롬프트 블록을 복사해서 LLM에게 전달하세요.
- 프로젝트의 기술 스택, 아키텍처 규칙, 데이터 흐름, 공통 패턴을 모두 담고 있으므로 별도 컨텍스트 없이도 일관된 코드를 생성할 수 있습니다.

## 프롬프트 블록
```text
You are an expert React 19 + TypeScript engineer working inside the Udonggeum (우동금) frontend repository. Follow the project rules below before writing any code.

Project Snapshot
- Purpose: Local jewelry marketplace that lists nearby gold & jewelry store products, lets users browse, filter, manage carts, and order.
- Tech: React 19, Vite, TypeScript, Tailwind CSS v4 + daisyUI, TanStack Query v5, Zustand, Axios, Zod.
- Entry: src/main.tsx wraps <App /> in QueryClientProvider; src/App.tsx sets up BrowserRouter routes for pages (/, /login, /mypage, etc.).
- Aliases (vite.config.ts): use @ for src root plus scoped aliases (@/components, @/hooks, @/utils, @/services, @/constants, @/types).

Architecture & File Map
- src/components: Reusable, presentation-focused components (Navbar, SearchSection, HeroCarousel, ProductCard, etc.).
- src/pages: Page-level containers (MainPage.tsx, LoginPage.tsx, MyPage.tsx, ApiDemo.tsx, ComponentsDemo.tsx, etc.).
- src/hooks/queries: TanStack Query hooks with query key factories (useProductsQueries, useStoresQueries, useAuthQueries, useCartQueries, useOrdersQueries).
- src/services: API service layer (auth, products, stores, cart, orders) built on apiClient and validated with Zod schemas.
- src/schemas: Zod schemas for API request/response contracts (auth.ts, products.ts, cart.ts, orders.ts) – always validate both inputs and responses here.
- src/stores: Zustand stores for auth (persisted) and UI (theme/modals/toasts) state.
- src/utils: Cross-cutting helpers (apiAdapters for UI↔API transforms, apiLogger, custom error classes).
- src/mocks: MSW setup (startMockServiceWorker in main.tsx) with handlers/data/utils to mock API responses when VITE_MOCK_API === 'true'.

Data & API Layer Rules
- All HTTP calls must go through apiClient (src/api/client.ts). Interceptors add auth headers, log requests, normalize errors, and handle 401 by clearing auth + redirecting to /login.
- Define/extend Zod schemas in src/schemas first (schema-first development). Resolve types via z.infer<> instead of writing ad-hoc interfaces.
- Implement service classes in src/services to call endpoints from src/constants/api.ts. Parse responses with the matching Zod schema inside the service. Throw ValidationError.fromZod when input parsing fails.
- Use adapters in src/utils/apiAdapters.ts to translate backend payloads (snake_case, enums) to UI models (camelCase, friendly IDs). Extend adapters when contracts change.

State Management Rules
- Server state → TanStack Query hooks in src/hooks/queries. Always create a query key factory object and export it (e.g., productsKeys, storesKeys).
- Client-only persistent auth state → useAuthStore (Zustand + persist, storage key STORAGE_KEYS.AUTH_STORE). Access outside React with useAuthStore.getState().
- Client-only UI state → useUIStore (theme, modals, toasts) without persistence.
- Mutations must invalidate relevant query keys (e.g., orders create → invalidate ordersKeys.list() and cartKeys.detail()).

UI & Styling Rules
- Styling is Tailwind + daisyUI. Component classes live directly in JSX; no separate CSS files.
- Follow existing component patterns: responsive layouts (mobile-first), accessible labels/aria attributes, skeletons and error fallbacks (ProductsLoadingSkeleton, ProductsError).
- When extending Navbar/Footer/SearchSection, use props + configuration constants (e.g., NAV_ITEMS in src/constants/navigation.ts) instead of hardcoding labels.
- For hero/featured sections reuse HeroCarousel, PopularProducts, ProductCard; sort/display order is controlled by displayOrder fields.

Routing & Navigation
- Update src/App.tsx only for route wiring; keep page-level logic inside src/pages/{NewPage}.tsx.
- If you add a top-level navigation item, update NAV_ITEMS (src/constants/navigation.ts) and ensure displayOrder is respected. Navbar sorts items by displayOrder.
- Keep URL paths kebab-case; ensure page components are default exports.

Environment & Dev Tooling
- Env vars live in .env.development / .env.production. Key variable: VITE_API_BASE_URL (empty in dev to use Vite proxy, real URL in prod).
- Vite proxy (vite.config.ts) forwards ^/api/ to the backend (default http://localhost:8080) to avoid CORS during dev.
- src/main.tsx conditionally starts MSW when import.meta.env.DEV && VITE_MOCK_API === 'true'. Use src/mocks/data & handlers to extend mock responses when backend endpoints are missing.
- Useful scripts: npm run dev, npm run build (tsc -b + vite build), npm run preview, npm run lint.

When Implementing a New Page
1. Clarify data needs. If hitting new endpoints, define the contract in Zod (src/schemas) first, then extend constants/api.ts and create/extend a service in src/services.
2. Add or extend query/mutation hooks in src/hooks/queries with descriptive query keys and TanStack Query options (staleTime, enabled conditions, invalidations).
3. Compose UI from existing components where possible. Shared atoms live in src/components; create new ones there if you see repeated patterns. Keep components prop-driven.
4. For client state (e.g., local toggles) prefer component state; for cross-component state consider useUIStore or create a dedicated Zustand slice with single responsibility.
5. Respect accessibility: add aria-labels, role attributes, keyboard focus states. Provide loading skeletons and error fallbacks consistent with existing patterns.
6. Register the page in src/pages and wire routing via src/App.tsx. If it should appear in navigation, update NAV_ITEMS.
7. If backend support is pending, add or adjust MSW handlers + mock data so the UI remains testable with VITE_MOCK_API=true.
8. Document any deviations or TODOs inline (short comments) and, if needed, update docs/specs under docs/ or specs/.

Quality Checklist Before Finishing
- TypeSafety: All new API interactions validated by Zod, no any.
- Query Hygiene: Query keys unique, invalidations cover data dependencies, avoid duplicate fetches (use enabled flags).
- Responsiveness: Test key breakpoints (mobile 320px, tablets, desktop 1440px). Use grid utilities similar to MainPage & PopularProducts.
- Auth Awareness: Gate authenticated views via useAuthStore (redirect like LoginPage/MyPage). Ensure secure handling of tokens through apiClient interceptor.
- Error UX: Provide ProductsError/ErrorAlert style feedback with retry actions. Never leave unhandled promise rejections.
- Testing Hooks: Manually verify flows under npm run dev with and without VITE_MOCK_API=true. If time permits, add exploratory tests or notes in specs/ checklists.
- Linting/Build: npm run lint and npm run build must pass.

Deliverables
- Return the modified file list with paths. Highlight key code decisions, explain how data flows from component → query hook → service → API → adapter.
- Mention follow-up tasks (e.g., TODO: refine region mapping in uiRegionToAPIParams) explicitly if encountered.
```
