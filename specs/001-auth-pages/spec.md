# Feature Specification: Authentication Pages (Login, Register, My Page)

**Feature Branch**: `001-auth-pages`
**Created**: 2025-11-03
**Status**: Draft
**Input**: User description: "create "login / register / my page" for using auth-needed pages. I want to implement like this: - clear screen and maintain login / register blocks - my page maintain nav, footer - create page simply & minimally"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - New User Registration (Priority: P1)

A new customer discovers the Udonggeum platform and wants to create an account to browse local jewelry stores, save favorite items, and make purchases.

**Why this priority**: Without user registration, users cannot access core features like cart, checkout, order history, and favorites. This is the foundation for user engagement and the business model.

**Independent Test**: Can be fully tested by creating a new account with email/password/name/phone and verifying the user can immediately log in with those credentials. Delivers immediate value by allowing access to authenticated features.

**Acceptance Scenarios**:

1. **Given** a visitor on the homepage, **When** they click "로그인" in the navigation and then click "회원가입" link on the login page, **Then** they see a clean, minimalist registration page with only the registration form (no header navigation, no footer)
2. **Given** a user on the registration page, **When** they view the form, **Then** they see fields for email, password (with eye icon visibility toggle), name, and phone (optional) with clear labels and placeholders
3. **Given** a user filling out the registration form with valid data (email: user@example.com, password: 8+ characters, name: "홍길동", phone: "010-1234-5678"), **When** they click "가입하기", **Then** the account is created, they are automatically logged in, and redirected to the homepage with navigation showing their logged-in status
4. **Given** a user entering an invalid email format (e.g., "notanemail"), **When** they move to the next field or attempt to submit, **Then** they see an inline error message "유효한 이메일을 입력하세요" below the email field
5. **Given** a user entering a password shorter than 6 characters, **When** they move to the next field or attempt to submit, **Then** they see an error message "비밀번호는 최소 6자 이상이어야 합니다" below the password field
6. **Given** a user trying to register with an email that already exists in the system, **When** they submit the form, **Then** they see an error message "이미 사용 중인 이메일입니다" and remain on the registration page

---

### User Story 2 - Existing User Login (Priority: P1)

A returning customer wants to access their account to view their order history, check their favorites, or complete a purchase.

**Why this priority**: Login is equally critical as registration. Without it, existing users cannot access their data or complete transactions. This is essential for retention and repeat business.

**Independent Test**: Can be tested by attempting to log in with valid credentials and verifying access to authenticated pages (My Page, Cart). Delivers immediate value by restoring user session and access to personalized features.

**Acceptance Scenarios**:

1. **Given** a visitor on any page, **When** they click "로그인" in the navigation, **Then** they see a clean, minimalist login page with only the login form (no header navigation, no footer)
2. **Given** a user on the login page, **When** they view the form, **Then** they see fields for email and password (with eye icon visibility toggle), a "로그인" button, and a "회원가입" link
3. **Given** a registered user entering valid credentials (correct email and password), **When** they click "로그인", **Then** they are logged in and redirected to the page they were viewing before clicking login (or homepage if accessing login page directly)
4. **Given** a user entering incorrect credentials, **When** they submit the form, **Then** they see an error message "이메일 또는 비밀번호가 올바르지 않습니다" above the form and remain on the login page
5. **Given** a logged-in user, **When** they refresh the page or navigate to another page, **Then** their session persists and they remain logged in with their name visible in navigation
6. **Given** a user who closes the browser and returns within 7 days, **When** they open the site again, **Then** their session persists (if they didn't explicitly log out) and they are still logged in

---

### User Story 3 - Protected Page Access Control (Priority: P1)

A visitor tries to access authenticated-only features (cart, checkout, my page, favorites) without being logged in, and the system redirects them to login while preserving their intended destination.

**Why this priority**: Without access control, the authentication system has no purpose. This enforces security boundaries and improves UX by redirecting users back to their intended page after login.

**Independent Test**: Can be tested by attempting to access `/cart`, `/checkout`, or `/mypage` while logged out, verifying redirect to login, then logging in and verifying redirect back to the original page. Delivers security and seamless user experience.

**Acceptance Scenarios**:

1. **Given** an unauthenticated user, **When** they try to navigate to `/cart`, `/checkout`, `/mypage`, or `/favorites`, **Then** they are redirected to the login page (`/login`) with the intended destination preserved
2. **Given** a user redirected to login from a protected page (e.g., `/cart`), **When** they successfully log in, **Then** they are redirected back to the original protected page they intended to visit (`/cart`)
3. **Given** an authenticated user, **When** they navigate to any protected page, **Then** they can access it normally without redirection, with full navigation and footer visible
4. **Given** a user attempting to access the login or register page while already logged in, **When** they navigate to `/login` or `/register`, **Then** they are redirected to the homepage (no need to see login/register when already authenticated)

---

### User Story 4 - My Page Profile View with Full Layout (Priority: P2)

A logged-in user wants to view their profile information, order history, and favorites in a page that feels integrated with the main site experience (with navigation and footer).

**Why this priority**: This provides users visibility into their account and access to their data. While important, it's secondary to the ability to log in/register and access protected features. Users can still use the platform without immediately needing to view their profile.

**Independent Test**: Can be tested by logging in, navigating to My Page, and verifying that user information (name, email, phone) is displayed accurately along with orders and favorites sections, all within a layout that includes navigation and footer. Delivers value by giving users control over their account in a familiar interface context.

**Acceptance Scenarios**:

1. **Given** a logged-in user, **When** they click "마이" or their name in the navigation, **Then** they see the My Page with full navigation at the top, footer at the bottom, and content sections for: profile info, order history, and favorites
2. **Given** a user viewing their My Page, **When** they look at the profile section, **Then** they see their name, email, phone number (if provided during registration), and account creation date displayed in a simple, minimal format
3. **Given** a user on My Page, **When** they click "로그아웃" button, **Then** they are logged out, their session is cleared, and they are redirected to the homepage
4. **Given** a logged-out user, **When** they attempt to access `/mypage`, **Then** they are redirected to the login page (per User Story 3)
5. **Given** a user viewing My Page, **When** they navigate to "주문 내역" section, **Then** they see a list of their past orders (or empty state message "주문 내역이 없습니다" if no orders yet) with order date, items, and total
6. **Given** a user viewing My Page, **When** they navigate to "찜 목록" section, **Then** they see their favorited products (or empty state message "찜한 상품이 없습니다" if no favorites yet)
7. **Given** a user on My Page, **When** they click navigation links (홈, 상품, 장바구니, etc.), **Then** they can navigate to other pages normally while remaining logged in

---

### User Story 5 - Session Token Management (Priority: P2)

The system manages authentication tokens (access and refresh tokens) automatically in the background to maintain secure, seamless user sessions without requiring frequent re-login.

**Why this priority**: This is important for security and UX (users shouldn't have to log in every 15 minutes), but it's lower priority than the core auth flows. The system can initially function with just access tokens and longer expiration times, then add refresh token logic later.

**Independent Test**: Can be tested by logging in, waiting for access token expiration, making an authenticated API request, and verifying the system automatically refreshes the token without user intervention. Delivers seamless experience without interruption.

**Acceptance Scenarios**:

1. **Given** a logged-in user with an expired access token, **When** they make any authenticated request (e.g., viewing cart), **Then** the system automatically uses the refresh token to obtain a new access token without requiring re-login or showing any error
2. **Given** a user with both expired access and refresh tokens, **When** they attempt any authenticated action, **Then** they are logged out and redirected to login with a message "세션이 만료되었습니다. 다시 로그인해주세요"
3. **Given** a user logging in successfully, **When** the tokens are received, **Then** they are securely stored in the authentication store (persisted to localStorage)
4. **Given** a user logging out, **When** they click "로그아웃", **Then** all tokens are cleared from storage and the auth state is reset

---

### Edge Cases

- **What happens when a user's session expires while they are filling out a form (e.g., checkout)?** The system should show a message "세션이 만료되었습니다" and redirect to login. After re-login, redirect user back to the form (form data preservation is out of scope for MVP).
- **What happens if the backend API is down during login/register?** The system should show a user-friendly error message like "서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요" instead of a generic error.
- **What happens if a user enters SQL injection or XSS attempts in form fields?** The Zod validation should reject invalid input, and the backend must sanitize all inputs. The frontend should not execute any user-provided content.
- **What happens if a user navigates directly to a protected page via URL while logged out?** They should be redirected to login with the return URL preserved (covered in User Story 3).
- **What happens if two users try to register with the same email simultaneously?** The backend must enforce uniqueness constraints, and the second request should fail with a "이미 사용 중인 이메일입니다" error.
- **What happens if a user closes the browser tab during registration/login API request?** The request should complete or timeout (10-second limit) gracefully on the backend. The frontend should handle the abandoned state on next load by clearing any loading states and allowing the user to retry.
- **What happens if a user tries to access `/login` or `/register` via browser back button after already logging in?** They should be redirected to homepage (covered in User Story 3, scenario 4).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a registration page (`/register`) with a clean, minimal layout (no navigation header, no footer) containing only a centered form block
- **FR-002**: Registration form MUST include fields for email (required), password (required, min 6 chars with visibility toggle button), name (required), and phone (optional, validated to Korean format `01[0-9]-?[0-9]{3,4}-?[0-9]{4}`). Password field MUST include an eye icon button allowing users to toggle between masked (••••) and visible text display
- **FR-003**: System MUST validate all registration inputs using Zod schemas in real-time (on blur or input change) and display Korean error messages inline below each field
- **FR-004**: System MUST send registration data to the backend `/api/auth/register` endpoint and handle success (redirect to homepage with auto-login) or error responses (display error message)
- **FR-005**: System MUST provide a login page (`/login`) with a clean, minimal layout (no navigation header, no footer) containing only a centered form block
- **FR-006**: Login form MUST include fields for email and password (with visibility toggle button), a "로그인" button, and a "회원가입" link that navigates to `/register`. Password field MUST include an eye icon button allowing users to toggle between masked (••••) and visible text display
- **FR-007**: System MUST validate login inputs using Zod schemas and display Korean error messages above the form for authentication failures
- **FR-008**: System MUST send login credentials to `/api/auth/login` endpoint and store returned tokens (access_token, refresh_token) and user data in the authentication store (useAuthStore)
- **FR-009**: System MUST persist authentication state to localStorage (tokens and user data) so users remain logged in across browser sessions (until explicit logout or token expiration beyond 7 days). Application MUST implement XSS protection via Content Security Policy (CSP) headers and avoid rendering user-controlled content without sanitization
- **FR-010**: System MUST protect routes `/cart`, `/checkout`, `/mypage`, `/favorites` by redirecting unauthenticated users to `/login` with the intended destination preserved (e.g., store as `?redirect=/cart` or in session storage)
- **FR-011**: System MUST redirect authenticated users back to their intended destination after successful login (using the preserved redirect path)
- **FR-012**: System MUST redirect already-authenticated users from `/login` and `/register` pages to the homepage
- **FR-013**: System MUST provide a My Page (`/mypage`) with full layout including navigation header at top and footer at bottom
- **FR-014**: My Page content MUST display user profile information in a simple, minimal format: name, email, phone (if provided), account creation date
- **FR-015**: My Page MUST include sections for "주문 내역" (order history) and "찜 목록" (favorites) with appropriate empty states when no data exists
- **FR-016**: My Page MUST include a "로그아웃" button that clears all tokens and user data from useAuthStore and localStorage, then redirects to homepage
- **FR-017**: System MUST automatically include the access token in all authenticated API requests via Axios interceptor (Authorization: Bearer {token})
- **FR-018**: System MUST handle 401 Unauthorized responses from the backend by attempting token refresh (using refresh token), and if refresh fails, log the user out and redirect to login
- **FR-019**: System MUST display loading states during async operations (login, register, logout, token refresh) to prevent duplicate submissions
- **FR-020**: System MUST display user-friendly Korean error messages for all API errors (network errors, validation errors, authentication errors)
- **FR-021**: System MUST prevent form submission when validation errors exist (disable submit button or prevent submission and show validation errors)
- **FR-022**: System MUST show user's name or status indicator in the navigation bar when logged in (e.g., "마이" button changes appearance or shows username)
- **FR-023**: System MUST enforce a 10-second timeout for all authentication API calls (login, register, logout, token refresh). If a request times out, system MUST display an error message "서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요" without automatic retry (user must manually retry the operation)
- **FR-024**: System MUST use HTTPS for all authentication operations in production environments. Local development may use HTTP (localhost is considered a secure context). Application MUST NOT transmit authentication credentials or tokens over unencrypted HTTP connections in production
- **FR-025**: System MUST log the following authentication events via the apiLogger utility: failed login attempts (with email but not password), failed registration attempts (with error reason), logout events, session expiration events, and all API errors (network failures, timeouts, 401/403/500 responses). System MUST NOT log successful login/register events or sensitive data (passwords, tokens) to minimize log storage and protect user privacy

### Key Entities

- **User**: Represents an authenticated user account with attributes: id (unique identifier), email (unique, validated), name (display name), phone (optional, validated to Korean format), role (user or admin), created_at (timestamp), updated_at (timestamp). Already defined in `src/schemas/auth.ts`.
- **Tokens**: Represents authentication credentials with attributes: access_token (JWT for API authorization), refresh_token (JWT for obtaining new access tokens). Already defined in `src/schemas/auth.ts`.
- **AuthState**: Client-side state stored in useAuthStore with attributes: user (User object or null), tokens (Tokens object or null), isAuthenticated (boolean computed from presence of valid tokens). Persisted to localStorage.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete registration in under 2 minutes with valid data (measured from opening registration page to successful account creation and redirect to homepage)
- **SC-002**: Users can log in within 30 seconds with correct credentials (measured from opening login page to redirect to intended page)
- **SC-003**: 95% of form validation errors are displayed inline within 200ms of user interaction (real-time validation for better UX)
- **SC-004**: Zero unauthorized access to protected pages (100% of unauthenticated requests to `/cart`, `/checkout`, `/mypage`, `/favorites` result in redirect to login)
- **SC-005**: User sessions persist across browser restarts for at least 7 days without requiring re-login (unless explicit logout or both tokens expire)
- **SC-006**: Logged-in users can access My Page and view their profile information without errors (100% success rate for authenticated users)
- **SC-007**: Token refresh happens automatically in the background without user awareness (zero user-facing interruptions for token expiration during active sessions under 7 days)
- **SC-008**: All authentication errors are displayed in user-friendly Korean with actionable guidance (e.g., "이메일 또는 비밀번호가 올바르지 않습니다")
- **SC-009**: Login and register pages load with minimal visual elements (clean screen, no navigation/footer) creating a focused authentication experience distinct from the main site
- **SC-010**: My Page integrates seamlessly with main site navigation, allowing users to navigate to other pages while maintaining logged-in state

## Clarifications

### Session 2025-11-03

- Q: Should the authentication tokens be stored with additional security measures beyond plain localStorage? → A: Store tokens in plain localStorage with CSP headers and XSS protection (standard approach, already assumed in dependencies)
- Q: What should be the timeout duration for authentication API calls, and should the system automatically retry failed requests? → A: 10-second timeout, no automatic retry (show error message, user can manually retry)
- Q: Should the application enforce HTTPS for all authentication operations? → A: HTTPS required for production, HTTP allowed for local development only
- Q: What authentication events should be logged for debugging, security auditing, and operational monitoring? → A: Log failures and important events only (failed login/register attempts, logout, session expiration, API errors)
- Q: Should password fields include a visibility toggle button to allow users to show/hide their password? → A: Include visibility toggle (eye icon button to show/hide password text) on both login and register forms

## Assumptions

- **Backend API endpoints already exist**: Assumes `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/refresh`, and `/api/auth/me` are implemented according to the existing schemas in `src/schemas/auth.ts`
- **Password strength**: Minimum 6 characters is acceptable for MVP; more complex requirements (uppercase, numbers, symbols) are not required but can be added later
- **Session duration**: Access tokens expire in 15-30 minutes, refresh tokens expire in 7 days (typical JWT pattern)
- **Phone number is optional**: Users can register and use the platform without providing a phone number
- **Single device login**: Users can be logged in on multiple devices simultaneously (no forced single-session restriction)
- **Email verification is not required for MVP**: Users can immediately use their account after registration without email confirmation (can be added as future enhancement)
- **Social login (OAuth) is out of scope**: Only email/password authentication is implemented in this feature
- **Password reset is out of scope for this feature**: Will be implemented separately (link can be added to login page later as "비밀번호 찾기")
- **Profile editing is out of scope**: My Page only displays profile information; editing will be a future enhancement
- **Role-based access control (admin)**: The `role` field exists in User schema but admin-specific features are not part of this feature (admin pages will be separate)
- **Layout implementation**: Login/Register pages use a minimal layout component (or no layout) to achieve "clear screen" effect, while My Page uses the full default layout with navigation and footer
- **Simple and minimal design**: Pages follow a clean, uncluttered design philosophy with essential elements only, avoiding complex UI patterns or excessive decoration
- **Error logging**: Authentication failures and important events (failed attempts, logout, session expiration, API errors) will be logged via the existing `apiLogger` utility for debugging and security auditing. Successful login/register events and sensitive data (passwords, tokens) are NOT logged to minimize storage costs and protect privacy
- **Security baseline**: Application uses Content Security Policy (CSP) headers to mitigate XSS attacks, enforces HTTPS in production environments, and follows the project's security guidelines (no dangerouslySetInnerHTML per CLAUDE.md). Plain localStorage is acceptable for token storage given these XSS protections and secure transport are in place

## Dependencies

- **Existing services**: `src/services/auth.ts` must expose methods for `login`, `register`, `logout`, `refreshToken`, and `getMe`
- **Existing schemas**: `src/schemas/auth.ts` provides all necessary Zod schemas and TypeScript types
- **Existing stores**: `src/stores/useAuthStore.ts` manages authentication state and must be integrated with login/register/logout flows
- **Existing API client**: `src/api/client.ts` Axios instance must have interceptors configured for auth token injection and 401 handling
- **Existing query hooks pattern**: Must follow the established pattern in `src/hooks/queries/` for auth mutations and queries
- **Routing library**: Assumes React Router (or similar) is configured for page routing and protected route implementation
- **Layout components**: Need to create or use minimal layout (no nav/footer) for Login/Register, and use default layout (with nav/footer) for My Page
- **Existing components**: May reuse existing UI components (Button, Input, ErrorMessage, etc.) if available in `src/components/`

## Out of Scope

- Password reset / forgot password functionality (future feature)
- Email verification and confirmation (future feature)
- Social login (Google, Kakao, Naver OAuth) (future feature)
- Two-factor authentication (future feature)
- Profile editing (update name, phone, email, password) (future feature)
- Account deletion (future feature)
- Admin-specific authentication and role-based UI (future feature)
- Session management page (view all active sessions, revoke tokens) (future feature)
- Password strength meter or requirements beyond minimum length (future feature)
- "Remember me" checkbox (current implementation persists by default) (future feature)
- Form data preservation after session expiration (future feature)
- Complex animations or transitions between auth states (keep it simple and minimal)
