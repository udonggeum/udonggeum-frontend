# Tasks: Authentication Pages (Login, Register, My Page)

**Input**: Design documents from `/specs/001-auth-pages/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are included based on constitution requirements (section II: Component Testing Standards)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Project structure: Single-page React application
- Frontend source: `src/`
- Tests: `tests/` or colocated with source files
- All paths are absolute from repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure - No code implementation yet, just verification of existing setup

- [x] T001 Verify existing Zod schemas in src/schemas/auth.ts (UserSchema, TokensSchema, AuthResponseSchema, LoginRequestSchema, RegisterRequestSchema, MeResponseSchema)
- [x] T002 Verify existing Zustand auth store in src/stores/useAuthStore.ts (user, tokens, isAuthenticated, setAuth, clearAuth, updateTokens)
- [x] T003 Verify existing Axios client in src/api/client.ts with request/response interceptors
- [x] T004 [P] Verify existing authService methods in src/services/auth.ts (login, register, logout, refreshToken, getMe)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Create PasswordInput component in src/components/PasswordInput.tsx with eye icon toggle, aria-label, and DaisyUI styling
- [x] T006 Create ProtectedRoute component in src/components/ProtectedRoute.tsx using React Router Navigate and useAuthStore
- [x] T007 Create MinimalLayout component in src/components/layouts/MinimalLayout.tsx with centered content, no nav/footer
- [x] T008 Update Axios response interceptor in src/api/client.ts for 401 handling, token refresh with request queue, and 10-second timeout
- [x] T009 [P] Create TanStack Query hooks file structure in src/hooks/queries/useAuthQueries.ts with authKeys factory
- [x] T010 [P] Set up MSW handlers for auth endpoints in src/mocks/handlers/auth.ts (register, login, logout, refresh, me)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - New User Registration (Priority: P1) 🎯 MVP

**Goal**: Enable new users to create accounts with email/password/name/phone and automatically log in

**Independent Test**: Create a new account with all fields, verify auto-login, verify session persists across browser refresh, verify access to protected routes

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T011 [P] [US1] Create RegisterPage component test in src/pages/RegisterPage.test.tsx (form rendering, validation, submission, error handling)
- [ ] T012 [P] [US1] Create integration test for registration flow in tests/integration/register.test.tsx (form → API → auto-login → redirect)

### Implementation for User Story 1

- [ ] T013 [US1] Implement useRegister mutation hook in src/hooks/queries/useAuthQueries.ts (mutationFn, onSuccess with setAuth and navigate)
- [ ] T014 [US1] Create RegisterPage component in src/pages/RegisterPage.tsx with form fields (email, password with visibility toggle, name, phone optional)
- [ ] T015 [US1] Add client-side Zod validation to RegisterPage with Korean error messages displayed inline
- [ ] T016 [US1] Add loading state to RegisterPage submit button using DaisyUI loading spinner
- [ ] T017 [US1] Add error alert to RegisterPage for API errors using DaisyUI alert-error component
- [ ] T018 [US1] Add register route to src/App.tsx wrapped in MinimalLayout with redirect if authenticated
- [ ] T019 [US1] Verify registration stores tokens/user in useAuthStore and persists to localStorage

**Checkpoint**: At this point, User Story 1 (registration) should be fully functional and testable independently

---

## Phase 4: User Story 2 - Existing User Login (Priority: P1) 🎯 MVP

**Goal**: Enable existing users to authenticate with email/password and access their account

**Independent Test**: Log in with valid credentials, verify redirect to intended page, verify session persistence, verify logout clears session

### Tests for User Story 2

- [ ] T020 [P] [US2] Create LoginPage component test in src/pages/LoginPage.test.tsx (form rendering, validation, submission, redirect handling)
- [ ] T021 [P] [US2] Create integration test for login flow in tests/integration/login.test.tsx (form → API → redirect with query param)

### Implementation for User Story 2

- [ ] T022 [US2] Implement useLogin mutation hook in src/hooks/queries/useAuthQueries.ts (mutationFn, onSuccess with setAuth, redirect query param extraction)
- [ ] T023 [US2] Create LoginPage component in src/pages/LoginPage.tsx with email and password fields (password with visibility toggle)
- [ ] T024 [US2] Add client-side Zod validation to LoginPage with Korean error messages
- [ ] T025 [US2] Add "회원가입" link to LoginPage that navigates to /register
- [ ] T026 [US2] Add loading state to LoginPage submit button using DaisyUI loading spinner
- [ ] T027 [US2] Add error alert to LoginPage for authentication failures using DaisyUI alert-error component
- [ ] T028 [US2] Add login route to src/App.tsx wrapped in MinimalLayout with redirect if authenticated
- [ ] T029 [US2] Verify login stores tokens/user in useAuthStore and persists to localStorage

**Checkpoint**: At this point, User Stories 1 AND 2 (registration + login) should both work independently

---

## Phase 5: User Story 3 - Protected Page Access Control (Priority: P1) 🎯 MVP

**Goal**: Enforce authentication requirements on protected routes and preserve redirect destination

**Independent Test**: Access /cart, /checkout, /mypage while logged out → verify redirect to login with ?redirect param → log in → verify redirect back to intended page

### Tests for User Story 3

- [ ] T030 [P] [US3] Create ProtectedRoute component test in src/components/ProtectedRoute.test.tsx (redirect when not authenticated, allow when authenticated)
- [ ] T031 [P] [US3] Create integration test for redirect flow in tests/integration/protected-routes.test.tsx (access protected page → login → redirect back)

### Implementation for User Story 3

- [ ] T032 [US3] Update src/App.tsx to wrap /cart route with ProtectedRoute component
- [ ] T033 [P] [US3] Update src/App.tsx to wrap /checkout route with ProtectedRoute component
- [ ] T034 [P] [US3] Update src/App.tsx to wrap /mypage route with ProtectedRoute component
- [ ] T035 [P] [US3] Update src/App.tsx to wrap /favorites route with ProtectedRoute component (if exists)
- [ ] T036 [US3] Verify ProtectedRoute extracts and preserves current location.pathname as redirect query param
- [ ] T037 [US3] Verify useLogin redirects to query param destination after successful authentication
- [ ] T038 [US3] Add redirect logic to prevent authenticated users from accessing /login or /register (redirect to homepage)

**Checkpoint**: All authentication enforcement should now work - unauthenticated users blocked from protected pages, authenticated users redirected appropriately

---

## Phase 6: User Story 4 - My Page Profile View with Full Layout (Priority: P2)

**Goal**: Provide logged-in users a profile page with full site layout showing their information, orders, and favorites

**Independent Test**: Log in, navigate to My Page, verify full layout (nav + footer), verify user data display, verify logout functionality

### Tests for User Story 4

- [ ] T039 [P] [US4] Create MyPage component test in src/pages/MyPage.test.tsx (user info display, sections rendering, logout button)
- [ ] T040 [P] [US4] Create integration test for logout flow in tests/integration/logout.test.tsx (My Page → logout → session cleared → redirect)

### Implementation for User Story 4

- [ ] T041 [US4] Implement useLogout mutation hook in src/hooks/queries/useAuthQueries.ts (mutationFn, onSuccess with clearAuth and navigate)
- [ ] T042 [US4] Create MyPage component in src/pages/MyPage.tsx with DefaultLayout (includes nav and footer)
- [ ] T043 [US4] Add profile information section to MyPage displaying user name, email, phone, created_at from useAuthStore
- [ ] T044 [US4] Add "주문 내역" section to MyPage with empty state message "주문 내역이 없습니다" (order functionality out of scope)
- [ ] T045 [US4] Add "찜 목록" section to MyPage with empty state message "찜한 상품이 없습니다" (favorites functionality out of scope)
- [ ] T046 [US4] Add logout button to MyPage using DaisyUI btn-outline btn-error styling with loading state
- [ ] T047 [US4] Verify logout clears tokens and user from useAuthStore and localStorage
- [ ] T048 [US4] Verify logout redirects to homepage after clearing auth state
- [ ] T049 [US4] Update navigation component to show user name or "마이" button when authenticated

**Checkpoint**: My Page should be fully functional with proper layout integration, data display, and logout capability

---

## Phase 7: User Story 5 - Session Token Management (Priority: P2)

**Goal**: Implement automatic token refresh and handle token expiration gracefully

**Independent Test**: Log in, wait for access token to expire (or mock 401), make authenticated request, verify automatic token refresh without user action

### Tests for User Story 5

- [ ] T050 [P] [US5] Create token refresh test in tests/integration/token-refresh.test.tsx (401 response → refresh → retry original request)
- [ ] T051 [P] [US5] Create token expiration test in tests/integration/token-expiration.test.tsx (both tokens expired → logout → redirect with message)

### Implementation for User Story 5

- [ ] T052 [US5] Implement updateTokens action in src/stores/useAuthStore.ts to update access_token without affecting user data
- [ ] T053 [US5] Enhance Axios response interceptor in src/api/client.ts to detect 401, call authService.refreshToken, update store, retry original request
- [ ] T054 [US5] Add request queue mechanism to interceptor to prevent multiple simultaneous refresh requests
- [ ] T055 [US5] Add refresh failure handling: clear auth state, redirect to login with "세션이 만료되었습니다. 다시 로그인해주세요" message
- [ ] T056 [US5] Verify access token is included in all authenticated requests via Authorization header
- [ ] T057 [US5] Verify refresh token is sent in request body to /api/auth/refresh endpoint
- [ ] T058 [US5] Test token persistence across browser refresh (reload page, verify still logged in)

**Checkpoint**: Token management should be fully automatic and transparent to users - no manual re-login required during session validity

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T059 [P] Add API timeout enforcement (10 seconds) to all auth endpoints in src/api/client.ts
- [ ] T060 [P] Add error logging for authentication events in src/utils/apiLogger.ts (failed login, failed register, logout, session expiration, API errors)
- [ ] T061 [P] Verify HTTPS enforcement in production (vite.config.ts or environment-specific configuration)
- [ ] T062 [P] Add CSP headers configuration for XSS protection (if not already handled by backend/deployment)
- [ ] T063 Code review: Verify no dangerouslySetInnerHTML usage in any auth components
- [ ] T064 Code review: Verify all password fields have visibility toggle with proper aria-labels
- [ ] T065 Code review: Verify all forms use DaisyUI semantic colors (btn-primary, alert-error, input-error)
- [ ] T066 [P] Accessibility audit: Verify all interactive elements have proper labels and keyboard navigation
- [ ] T067 [P] Run ESLint and fix any violations in auth-related files
- [ ] T068 Run all test suites and verify 100% pass rate for auth functionality
- [ ] T069 Manual testing: Complete all acceptance scenarios from spec.md user stories
- [ ] T070 Performance testing: Verify login/register page load < 1s, form validation < 200ms
- [ ] T071 Update CLAUDE.md or project documentation with auth implementation details
- [ ] T072 Run quickstart.md validation checklist and verify all items pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately (verification only)
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User Story 1, 2, 3 (P1) are MVP critical, must be completed first
  - User stories can proceed in parallel if team capacity allows
  - Or sequentially in priority order (US1 → US2 → US3 → US4 → US5)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (Registration - P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (Login - P1)**: Can start after Foundational (Phase 2) - Independent but logically follows registration
- **User Story 3 (Access Control - P1)**: Depends on ProtectedRoute from Foundational, integrates with login redirect flow
- **User Story 4 (My Page - P2)**: Depends on logout hook, can proceed in parallel with US5
- **User Story 5 (Token Management - P2)**: Depends on updateTokens store action, enhances existing Axios interceptor

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- TanStack Query hooks before page components
- Page components before route configuration
- Core implementation before integration
- Story complete and verified before moving to next priority

### Parallel Opportunities

- All Setup verification tasks (T001-T004) can run in parallel
- Foundational tasks T005, T006, T007, T009, T010 can run in parallel (different files)
- Within each user story: Tests marked [P] can run in parallel
- User Story 1, 2, 3 can be worked on in parallel by different team members after Foundational phase
- User Story 4 and 5 can be worked on in parallel after US1-3 complete
- All Polish tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1 (Registration)

```bash
# Launch all tests for User Story 1 together:
Task: T011 "Create RegisterPage component test in src/pages/RegisterPage.test.tsx"
Task: T012 "Create integration test for registration flow in tests/integration/register.test.tsx"

# After tests pass, no parallel tasks within US1 implementation
# (T013-T019 have sequential dependencies)
```

---

## Parallel Example: User Story 3 (Access Control)

```bash
# Launch all tests for User Story 3 together:
Task: T030 "Create ProtectedRoute component test in src/components/ProtectedRoute.test.tsx"
Task: T031 "Create integration test for redirect flow in tests/integration/protected-routes.test.tsx"

# Route wrapping tasks can run in parallel:
Task: T033 "Update src/App.tsx to wrap /checkout route with ProtectedRoute"
Task: T034 "Update src/App.tsx to wrap /mypage route with ProtectedRoute"
Task: T035 "Update src/App.tsx to wrap /favorites route with ProtectedRoute"
```

---

## Implementation Strategy

### MVP First (User Stories 1, 2, 3 Only)

1. Complete Phase 1: Setup (verify existing architecture)
2. Complete Phase 2: Foundational (CRITICAL - create shared components/hooks)
3. Complete Phase 3: User Story 1 (Registration)
4. **STOP and VALIDATE**: Test registration independently
5. Complete Phase 4: User Story 2 (Login)
6. **STOP and VALIDATE**: Test login + registration together
7. Complete Phase 5: User Story 3 (Access Control)
8. **STOP and VALIDATE**: Test complete auth flow (register → login → access protected pages)
9. Deploy/demo MVP if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo (MVP complete!)
5. Add User Story 4 → Test independently → Deploy/Demo
6. Add User Story 5 → Test independently → Deploy/Demo
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Registration)
   - Developer B: User Story 2 (Login)
   - Developer C: User Story 3 (Access Control)
3. Stories complete and integrate independently
4. After P1 stories complete:
   - Developer A: User Story 4 (My Page)
   - Developer B: User Story 5 (Token Management)
5. Team completes Phase 8: Polish together

---

## Task Summary

- **Total Tasks**: 72
- **Setup (Phase 1)**: 4 tasks (verification only)
- **Foundational (Phase 2)**: 6 tasks (blocking prerequisites)
- **User Story 1 (P1)**: 9 tasks (2 tests + 7 implementation)
- **User Story 2 (P1)**: 10 tasks (2 tests + 8 implementation)
- **User Story 3 (P1)**: 9 tasks (2 tests + 7 implementation)
- **User Story 4 (P2)**: 11 tasks (2 tests + 9 implementation)
- **User Story 5 (P2)**: 9 tasks (2 tests + 7 implementation)
- **Polish (Phase 8)**: 14 tasks (cross-cutting concerns)

**MVP Scope**: Phases 1-5 (38 tasks covering registration, login, and access control)

**Parallel Opportunities**: 18 tasks marked [P] can run in parallel within their phases

**Independent Test Criteria**:
- US1: Create account → verify auto-login → verify session persists
- US2: Log in → verify redirect → verify logout works
- US3: Access protected page → verify login redirect → verify return to intended page
- US4: Navigate to My Page → verify data display → verify logout
- US5: Trigger token expiration → verify automatic refresh → verify seamless experience

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (TDD approach)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All tasks follow strict checklist format: `- [ ] [ID] [P?] [Story?] Description with file path`
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
