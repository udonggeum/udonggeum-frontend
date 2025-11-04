# Manual Testing Guide - Authentication System

This document provides step-by-step manual testing procedures for the authentication system implementation.

## Prerequisites

- Dev server running: `npm run dev`
- MSW enabled (should see MSW console logs)
- Browser with DevTools open (for localStorage inspection)

## Test Suite 1: User Registration (회원가입)

### TC-001: Successful Registration
1. Navigate to `/register`
2. Fill in valid data:
   - Email: `newuser@example.com`
   - Password: `Password123!`
   - Password Confirmation: `Password123!`
   - Name: `김철수`
   - Phone: `010-1234-5678`
3. Click "회원가입" button
4. **Expected**:
   - Form submits successfully
   - Redirect to `/login`
   - Success message shown
   - localStorage has no auth data yet

### TC-002: Validation - Missing Fields
1. Navigate to `/register`
2. Leave email field empty
3. Try to submit
4. **Expected**:
   - Email field shows error: "이메일을 입력하세요"
   - Form does not submit
5. Fill email, leave password empty
6. **Expected**:
   - Password field shows error: "비밀번호를 입력하세요"

### TC-003: Validation - Invalid Email
1. Navigate to `/register`
2. Enter invalid email: `notanemail`
3. Blur focus (click elsewhere)
4. **Expected**:
   - Email field shows error: "유효한 이메일을 입력하세요"
   - Submit button should be disabled or show validation error

### TC-004: Validation - Password Mismatch
1. Navigate to `/register`
2. Fill in all fields:
   - Password: `Password123!`
   - Confirm Password: `DifferentPass123!`
3. Try to submit
4. **Expected**:
   - Confirm password field shows error: "비밀번호가 일치하지 않습니다"

### TC-005: Duplicate Email
1. Register a user with `user@example.com` (if not exists)
2. Try to register again with same email
3. **Expected**:
   - Error message: "이미 등록된 이메일입니다"
   - User remains on registration page

### TC-006: Password Visibility Toggle
1. Navigate to `/register`
2. Enter password
3. Click eye icon on password field
4. **Expected**:
   - Password becomes visible as plain text
   - Icon changes to "eye-off"
5. Click again
6. **Expected**:
   - Password becomes masked again

---

## Test Suite 2: User Login (로그인)

### TC-010: Successful Login
1. Navigate to `/login`
2. Enter valid credentials:
   - Email: `user@example.com`
   - Password: `password123`
3. Click "로그인" button
4. **Expected**:
   - Redirect to `/` (homepage)
   - Navbar shows user name (e.g., "테스트 사용자")
   - localStorage contains:
     - `auth-storage` with user, tokens, isAuthenticated: true
   - DevTools Network tab shows `/api/v1/auth/login` request succeeded

### TC-011: Invalid Credentials
1. Navigate to `/login`
2. Enter wrong password:
   - Email: `user@example.com`
   - Password: `wrongpassword`
3. Click "로그인"
4. **Expected**:
   - Error message shown: "이메일 또는 비밀번호가 올바르지 않습니다"
   - User remains on login page
   - No data in localStorage

### TC-012: Login Validation
1. Navigate to `/login`
2. Leave email empty, try to submit
3. **Expected**: "이메일을 입력하세요"
4. Fill email, leave password empty
5. **Expected**: "비밀번호를 입력하세요"

### TC-013: "Sign Up Instead" Link
1. Navigate to `/login`
2. Click "회원가입" link at bottom
3. **Expected**:
   - Redirect to `/register`
   - Form is clean (no pre-filled data)

---

## Test Suite 3: Protected Routes & Navigation

### TC-020: Access MyPage When Authenticated
1. Login first (TC-010)
2. Navigate to `/mypage`
3. **Expected**:
   - MyPage renders successfully
   - Shows user profile data:
     - Name: "테스트 사용자"
     - Email: "user@example.com"
     - Phone: "010-1234-5678"
     - Registration date formatted in Korean
   - Shows "주문 내역" and "찜 목록" sections
   - Shows logout button

### TC-021: Access MyPage When Not Authenticated
1. Clear localStorage: `localStorage.clear()`
2. Reload page
3. Navigate to `/mypage`
4. **Expected**:
   - Immediate redirect to `/login`
   - MyPage content never renders

### TC-022: Navbar - Authenticated State
1. Login (TC-010)
2. Check navbar
3. **Expected**:
   - Shows user name next to profile icon
   - Cart icon visible with badge (0 items)
   - Clicking profile button goes to `/mypage`

### TC-023: Navbar - Unauthenticated State
1. Clear localStorage and reload
2. Check navbar
3. **Expected**:
   - Shows "로그인" button (login icon)
   - Cart icon still visible
   - Clicking login button goes to `/login`

---

## Test Suite 4: Logout Flow (로그아웃)

### TC-030: Logout from MyPage
1. Login (TC-010)
2. Navigate to `/mypage`
3. Click "로그아웃" button
4. **Expected**:
   - Button shows loading state ("로그아웃 중...")
   - After ~200ms:
     - Redirect to `/` (homepage)
     - Navbar shows login button (not user name)
     - localStorage `auth-storage` cleared (or isAuthenticated: false)
     - DevTools shows `/api/v1/auth/logout` request

### TC-031: Try Access MyPage After Logout
1. Complete logout (TC-030)
2. Try to navigate back to `/mypage` (browser back or direct URL)
3. **Expected**:
   - Immediate redirect to `/login`
   - No flash of MyPage content

### TC-032: Logout Persists Across Page Refresh
1. Logout (TC-030)
2. Refresh page (F5)
3. **Expected**:
   - User remains logged out
   - Navbar shows login button
   - Attempting `/mypage` still redirects to login

---

## Test Suite 5: Token Refresh & Expiration

### TC-040: Token Refresh on 401 (Simulated)
**Note**: This requires MSW to be configured to return 401 for certain requests.

1. Login (TC-010)
2. In DevTools Console, run:
   ```js
   // Simulate expired token
   const store = JSON.parse(localStorage.getItem('auth-storage'));
   store.state.tokens.access_token = 'expired-access-token';
   localStorage.setItem('auth-storage', JSON.stringify(store));
   ```
3. Navigate to any page that makes authenticated requests
4. **Expected**:
   - Initial request with expired token returns 401
   - Interceptor automatically calls `/api/v1/auth/refresh`
   - New tokens stored in localStorage
   - Original request retried with new token
   - User sees no disruption

### TC-041: Session Expiration - Both Tokens Expired
1. Login (TC-010)
2. In DevTools Console, set both tokens to invalid:
   ```js
   const store = JSON.parse(localStorage.getItem('auth-storage'));
   store.state.tokens.access_token = 'fully-expired-access-token';
   store.state.tokens.refresh_token = 'fully-expired-refresh-token';
   localStorage.setItem('auth-storage', JSON.stringify(store));
   ```
3. Navigate to `/mypage` or make any authenticated request
4. **Expected**:
   - Refresh attempt fails
   - User automatically logged out
   - Redirect to `/login`
   - Error message: "세션이 만료되었습니다"

### TC-042: Concurrent Requests During Token Refresh
1. Login (TC-010)
2. Make multiple authenticated requests simultaneously (this happens naturally when loading pages with multiple API calls)
3. **Expected**:
   - Only ONE refresh request sent (not multiple)
   - All failed requests queued and retried after refresh
   - No duplicate refresh calls in Network tab

---

## Test Suite 6: Session Persistence

### TC-050: Login Persists Across Page Refresh
1. Login (TC-010)
2. Refresh page (F5)
3. **Expected**:
   - User remains logged in
   - Navbar still shows user name
   - Can access `/mypage` without redirect
   - localStorage still has auth data

### TC-051: Login Persists Across Tab Close/Reopen
1. Login (TC-010)
2. Close browser tab
3. Reopen and navigate to `http://localhost:5173`
4. **Expected**:
   - User still logged in (session restored from localStorage)
   - All auth state intact

### TC-052: Multiple Tabs - Logout in One Tab
1. Login (TC-010)
2. Open app in two tabs (Tab A and Tab B)
3. In Tab A, logout
4. In Tab B, navigate to `/mypage`
5. **Expected**:
   - Tab B also treats user as logged out
   - Redirect to `/login`
   - (Note: Real-time sync across tabs requires storage event listener - may not be implemented yet)

---

## Test Suite 7: Edge Cases & Error Handling

### TC-060: Network Error During Login
1. In DevTools Network tab, throttle to "Offline"
2. Try to login
3. **Expected**:
   - Error message shown: network-related error
   - Form remains interactive
   - User can retry after going back online

### TC-061: API Timeout
1. Ensure API timeout is set (check `src/api/client.ts`)
2. If MSW can simulate slow responses, test with 15-second delay
3. **Expected**:
   - Request times out after 10 seconds
   - Error message shown
   - User can retry

### TC-062: XSS Prevention - Script Injection
1. Navigate to `/register`
2. Try to enter `<script>alert('XSS')</script>` in name field
3. Register successfully
4. Navigate to `/mypage`
5. **Expected**:
   - Script tag rendered as plain text (not executed)
   - No alert shown
   - Name displays literally as entered

### TC-063: SQL Injection Attempt (Backend responsibility)
1. Try login with email: `admin' OR '1'='1`
2. **Expected**:
   - Backend should handle safely
   - Frontend should not crash
   - Either login fails or handled gracefully

---

## Test Suite 8: Accessibility (A11y)

### TC-070: Keyboard Navigation - Login Form
1. Navigate to `/login`
2. Use only keyboard:
   - Tab to email field → Enter email
   - Tab to password field → Enter password
   - Tab to login button → Press Enter
3. **Expected**:
   - All fields reachable via Tab
   - Login submits via Enter key
   - Focus visible on all interactive elements

### TC-071: Screen Reader - Form Labels
1. Use screen reader (VoiceOver on Mac, NVDA on Windows)
2. Navigate `/register` form
3. **Expected**:
   - All fields announced with proper labels
   - Error messages announced when validation fails
   - Button states announced ("로그인", "로그아웃 중...")

### TC-072: Password Toggle Accessibility
1. Navigate to `/login`
2. Use screen reader on password toggle button
3. **Expected**:
   - Button has proper aria-label ("비밀번호 표시" / "비밀번호 숨기기")
   - Button state announced when toggled

---

## Test Suite 9: UI/UX Polish

### TC-080: Loading States
1. Login with intentionally slow network (DevTools throttling)
2. **Expected**:
   - Login button shows loading spinner
   - Button text changes to "로그인 중..."
   - Button disabled during loading

### TC-081: Success Feedback
1. Register new account
2. **Expected**:
   - Success message shown (toast or alert)
   - Clear feedback that registration succeeded

### TC-082: Error Message Clarity
1. Trigger various errors (wrong password, network error, validation)
2. **Expected**:
   - All error messages in Korean
   - Messages clearly indicate what went wrong
   - Messages suggest corrective action

### TC-083: Mobile Responsiveness - Login Form
1. Open DevTools, switch to mobile view (iPhone SE 375px)
2. Navigate to `/login`
3. **Expected**:
   - Form fully visible without horizontal scroll
   - Buttons full width or appropriately sized
   - Text readable (not too small)

### TC-084: Mobile Responsiveness - Navbar
1. Mobile view (< 1024px)
2. Check navbar
3. **Expected**:
   - Hamburger menu visible
   - Desktop menu hidden
   - Menu items accessible via hamburger

---

## Regression Testing Checklist

Run these after any auth-related changes:

- [ ] Can register new account
- [ ] Can login with existing account
- [ ] Can access MyPage when authenticated
- [ ] Cannot access MyPage when not authenticated
- [ ] Can logout from MyPage
- [ ] Login persists across page refresh
- [ ] Logout clears all auth state
- [ ] Navbar updates correctly based on auth state
- [ ] All form validations work
- [ ] Error messages displayed correctly
- [ ] No console errors during normal flows
- [ ] localStorage correctly manages auth state

---

## Test Data Reference

Use these accounts for manual testing (seeded by MSW):

| Email | Password | Name | Phone |
|-------|----------|------|-------|
| `user@example.com` | `password123` | 테스트 사용자 | 010-1234-5678 |
| `admin@example.com` | `admin123` | 관리자 | 010-9999-0000 |

Register new accounts with pattern: `test{number}@example.com` (e.g., `test1@example.com`)

---

## Notes for Testers

- **Clear localStorage** before starting fresh test sessions: `localStorage.clear()` in DevTools Console
- **MSW**: If you see "MSW not initialized", refresh the page
- **DevTools**: Keep Network tab open to verify API calls
- **React DevTools**: Install React DevTools browser extension to inspect component state
- **Performance**: Login/register should feel instant (< 500ms)

## Reporting Issues

When reporting bugs found during manual testing:

1. **Test Case ID**: (e.g., TC-010)
2. **Steps to Reproduce**: Exact actions taken
3. **Expected Result**: What should happen
4. **Actual Result**: What actually happened
5. **Evidence**: Screenshot, console errors, network tab
6. **Environment**: Browser, OS, viewport size
