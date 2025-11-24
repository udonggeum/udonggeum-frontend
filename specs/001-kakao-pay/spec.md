# Feature Specification: Kakao Pay Payment Integration

**Feature Branch**: `001-kakao-pay`
**Created**: 2025-01-19
**Status**: Draft
**Input**: User description: "Integrate Kakao Pay payment system into the Udonggeum frontend application for secure and convenient mobile payment processing"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Complete Payment for Order (Priority: P1)

A customer who has created an order needs to pay for their purchase using Kakao Pay. They should be able to initiate payment, be redirected to Kakao Pay, complete the transaction, and return to see confirmation.

**Why this priority**: This is the core payment flow that delivers immediate business value. Without this, customers cannot complete purchases, making it the most critical user journey.

**Independent Test**: Can be fully tested by creating a test order, clicking the payment button, completing payment in the Kakao Pay mock environment, and verifying the order status updates to "completed" with payment details displayed.

**Acceptance Scenarios**:

1. **Given** a logged-in user has created an order with items totaling 50,000 won, **When** they click "결제하기" on the payment page, **Then** they are redirected to Kakao Pay with the correct order amount
2. **Given** a user is on the Kakao Pay payment page, **When** they complete payment successfully, **Then** they are redirected back to the success page showing order number, payment amount, transaction ID, and approval time
3. **Given** a user has completed payment, **When** they view their order history, **Then** the order shows "결제완료" status with payment details including transaction ID and approval timestamp
4. **Given** a user on mobile device, **When** they initiate payment, **Then** they are redirected to the mobile-optimized Kakao Pay URL

---

### User Story 2 - Handle Payment Cancellation (Priority: P2)

A customer who starts the payment process may decide to cancel before completing payment. They should be able to back out of the Kakao Pay page and return to the application with their order intact.

**Why this priority**: This handles a common user behavior where customers reconsider purchases. Critical for user trust but secondary to successful payment completion.

**Independent Test**: Can be fully tested by initiating payment, clicking cancel/back on Kakao Pay page, and verifying the user returns to a cancellation page with option to retry payment and the order remains in "pending" status.

**Acceptance Scenarios**:

1. **Given** a user is on the Kakao Pay payment page, **When** they click cancel or back button, **Then** they are redirected to the cancellation page showing their order number and message "결제가 취소되었습니다"
2. **Given** a user is on the cancellation page, **When** they click "다시 결제하기", **Then** they return to the payment initiation page for their order
3. **Given** a user cancelled payment, **When** they view their order history, **Then** the order still appears with "결제대기" status

---

### User Story 3 - Handle Payment Failure (Priority: P2)

When payment fails due to insufficient funds, card issues, or Kakao Pay system errors, customers need clear feedback about what went wrong and how to proceed.

**Why this priority**: Prevents frustrated users from abandoning their orders. Important for user experience but less common than successful payment or cancellation.

**Independent Test**: Can be fully tested by triggering a payment failure scenario (in test mode), verifying the user sees an error message, and confirming they can retry payment with the order remaining intact.

**Acceptance Scenarios**:

1. **Given** payment fails during Kakao Pay processing, **When** Kakao Pay redirects back, **Then** the user sees the failure page with error message and order number
2. **Given** a user is on the failure page, **When** they click "다시 결제하기", **Then** they are redirected to the payment initiation page
3. **Given** payment failed, **When** the user views order history, **Then** the order shows "결제대기" status (not "결제실패" to allow retry)

---

### User Story 4 - View Payment Status in Order Details (Priority: P3)

Users who have completed or attempted payment need to see detailed payment information including transaction ID, payment method, approval time, and current status.

**Why this priority**: Provides transparency and helps with customer support, but doesn't block core payment functionality.

**Independent Test**: Can be fully tested by completing a payment and verifying all payment details (status badge, transaction ID, payment method, approval time) display correctly in the order card and order detail pages.

**Acceptance Scenarios**:

1. **Given** a user has a completed payment, **When** they view their order in the order list, **Then** they see "결제완료" badge, transaction ID, and payment approval time
2. **Given** a user views order details, **When** the payment is completed, **Then** they see payment method (카드/카카오머니), full transaction ID, and approval timestamp in Korean format
3. **Given** a user has a pending payment, **When** they view the order, **Then** they see "결제대기" badge without payment details

---

### User Story 5 - Prevent Duplicate Payments (Priority: P1)

Customers who have already paid for an order should not be able to initiate payment again for the same order, preventing duplicate charges.

**Why this priority**: Critical for payment integrity and user trust. Prevents financial errors and disputes.

**Independent Test**: Can be fully tested by completing payment for an order, then attempting to access the payment page for the same order, and verifying the user is automatically redirected away.

**Acceptance Scenarios**:

1. **Given** an order has "completed" payment status, **When** a user tries to access `/payment/{orderId}`, **Then** they are automatically redirected to their order history page
2. **Given** payment was completed, **When** backend receives another payment ready request for same order, **Then** it returns 409 Conflict error with message "Payment already processed"
3. **Given** a user clicks "결제하기" button on completed order, **When** the payment check runs, **Then** the button is disabled and shows "결제완료" message

---

### Edge Cases

- What happens when user's session expires during Kakao Pay redirect? (User will be redirected to login page upon return; order remains in pending state)
- How does system handle network timeout during payment approval? (Backend returns 500 error; frontend shows error page with retry option; order remains in pending state)
- What if user closes browser tab during payment? (Order remains in pending state; user can retry payment by accessing order from order history)
- What happens if pg_token is missing or invalid in success callback? (System shows error message; logs error for debugging; user can retry payment)
- How does system handle concurrent payment attempts for same order? (Backend uses transaction locking to prevent race conditions; only first request succeeds; subsequent requests get 409 error)
- What if Kakao Pay redirect URL is blocked by popup blocker? (Full page redirect is used instead of popup; modern browsers don't block full page redirects)
- What happens on slow network where user clicks payment button multiple times? (Button is disabled after first click; mutation is marked as pending; prevents duplicate requests)

## Requirements *(mandatory)*

### Functional Requirements

#### Payment Initiation

- **FR-001**: System MUST allow authenticated users to initiate Kakao Pay payment for orders with "pending" payment status
- **FR-002**: System MUST validate order exists and belongs to current user before initiating payment
- **FR-003**: System MUST prevent payment initiation for orders that already have "completed" payment status
- **FR-004**: System MUST detect user's device type (mobile/desktop) and redirect to appropriate Kakao Pay URL
- **FR-005**: System MUST display order summary including order number, item count, fulfillment type, and total amount on payment initiation page

#### Payment Processing

- **FR-006**: System MUST redirect users to Kakao Pay payment page with transaction ID (TID) after successful payment initiation
- **FR-007**: System MUST handle Kakao Pay success callback with order_id and pg_token parameters
- **FR-008**: System MUST automatically approve payment when receiving success callback from Kakao Pay
- **FR-009**: System MUST update order payment status to "completed" after successful approval
- **FR-010**: System MUST store payment details including transaction ID (TID), approval ID (AID), payment method, and approval timestamp

#### Payment Feedback

- **FR-011**: System MUST display success page showing order number, payment amount, transaction ID, payment method, and approval time after successful payment
- **FR-012**: System MUST display failure page with error message and option to retry when payment fails
- **FR-013**: System MUST display cancellation page with order number and option to retry when user cancels payment
- **FR-014**: System MUST show loading indicator with message "결제 승인 중입니다..." during approval process

#### Order Display

- **FR-015**: System MUST display payment status badge (결제대기/결제완료/결제실패/환불완료) on all order cards
- **FR-016**: System MUST show transaction ID in order details when payment is completed
- **FR-017**: System MUST show payment approval time in Korean format (YYYY-MM-DD HH:mm:ss) when payment is completed
- **FR-018**: System MUST show payment method (카드/카카오머니) in order details when payment is completed

#### Error Handling

- **FR-019**: System MUST handle 401 Unauthorized by redirecting to login page
- **FR-020**: System MUST handle 404 Not Found by showing "주문 정보를 불러올 수 없습니다" error
- **FR-021**: System MUST handle 409 Conflict (payment already processed) by redirecting to order history
- **FR-022**: System MUST handle 500 Server Error by showing user-friendly error message with retry option
- **FR-023**: System MUST log all payment errors including request details for debugging (excluding sensitive data)

#### Data Validation

- **FR-024**: System MUST validate all payment API responses against Zod schemas before processing
- **FR-025**: System MUST validate order ID is positive integer before initiating payment
- **FR-026**: System MUST validate required callback parameters (order_id, pg_token) are present before approval

#### Cache Management

- **FR-027**: System MUST invalidate order queries cache after successful payment approval
- **FR-028**: System MUST invalidate payment status queries cache after approval
- **FR-029**: System MUST refetch order details when navigating to order history after payment

### Key Entities

- **Payment**: Represents a payment transaction with attributes: order_id (links to Order), payment_status (pending/completed/failed/refunded), payment_provider ("kakaopay"), payment_tid (transaction ID), payment_aid (approval ID), payment_method (CARD/MONEY), payment_approved_at (timestamp), total_amount
- **PaymentReadyResponse**: Represents Kakao Pay initiation response with attributes: tid (transaction ID), redirect URLs for PC/mobile/app platforms, app scheme URLs for iOS/Android
- **PaymentApprovalResponse**: Represents completed payment with attributes: order_id, aid (approval ID), tid (transaction ID), total_amount, payment_method (CARD/MONEY), approved_at (ISO timestamp)
- **Order**: Extended with payment fields: payment_status, payment_provider, payment_tid, payment_aid, payment_approved_at

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete payment flow from order creation to success confirmation in under 2 minutes
- **SC-002**: 95% of successful Kakao Pay transactions reflect correctly in order history within 3 seconds of approval
- **SC-003**: Payment status displays correctly (with appropriate badge color and text) for 100% of orders
- **SC-004**: Users can retry payment after cancellation or failure with 100% success rate (no technical blocks)
- **SC-005**: Mobile users are correctly redirected to mobile-optimized Kakao Pay URLs in 100% of cases
- **SC-006**: Zero duplicate payment approvals for same order (prevented by status checks)
- **SC-007**: All payment errors display user-friendly Korean messages with actionable next steps (no raw error codes shown)
- **SC-008**: Payment transaction details (TID, AID, timestamp) are displayed with 100% accuracy in order details
- **SC-009**: Users attempting to pay for already-completed orders are redirected away in under 1 second
- **SC-010**: System successfully handles and recovers from Kakao Pay API timeouts without data loss (order remains in pending state for retry)

## Out of Scope *(optional)*

- **Payment refunds**: Refund functionality exists in backend but not exposed in frontend UI (future feature)
- **Subscription payments**: Kakao Pay supports recurring payments but this is not implemented
- **Partial payments**: Users must pay full order amount; no split payments or installments
- **Payment method selection**: Only Kakao Pay is supported; no credit card direct input or other payment gateways
- **Payment history page**: Detailed payment transaction history separate from order history
- **Multiple payment attempts tracking**: System doesn't show history of failed/cancelled attempts
- **Payment receipt download**: No PDF or email receipt generation
- **International payments**: Only supports Korean won (KRW) currency
- **Admin payment management**: No admin UI for viewing/managing payments across all users
- **Payment analytics**: No dashboard showing payment success rates, popular payment methods, etc.

## Assumptions *(optional)*

- **Backend API is fully functional**: All Kakao Pay endpoints (/ready, /success, /fail, /cancel, /status) are implemented and tested in backend
- **Kakao Pay merchant account is configured**: Backend has valid Kakao Pay API credentials and callback URLs registered
- **Users have Kakao Pay accounts**: Users are expected to have Kakao Pay installed or can complete web-based payment
- **HTTPS in production**: Callback URLs will use HTTPS (required by Kakao Pay) in production environment
- **Session persistence**: User authentication tokens remain valid during payment redirect (typical 30-minute expiry)
- **Backend handles approval**: Frontend only triggers /ready endpoint; backend automatically calls /approve when receiving success callback
- **No httpOnly cookie requirement**: Tokens stored in localStorage are acceptable for MVP (can migrate to httpOnly cookies later for enhanced security)
- **Korean language only**: All payment UI and error messages are in Korean
- **Standard browser support**: Payment flow tested on modern browsers (Chrome 90+, Safari 14+, Firefox 88+)
- **Mobile app schemes optional**: iOS/Android app scheme URLs provided by backend but not required for web-based payment flow

## Dependencies *(optional)*

### Backend Dependencies

- **Payment API endpoints**: All 6 Kakao Pay endpoints must be available and return documented response format
  - POST /api/v1/payments/kakao/ready
  - GET /api/v1/payments/kakao/success
  - GET /api/v1/payments/kakao/fail
  - GET /api/v1/payments/kakao/cancel
  - GET /api/v1/payments/kakao/status/:orderID
  - POST /api/v1/payments/kakao/:orderID/refund
- **Order schema updates**: Order entity must include payment_status, payment_provider, payment_tid, payment_aid, payment_approved_at fields
- **Kakao Pay integration**: Backend must have valid Kakao Pay merchant credentials configured

### Frontend Dependencies

- **Existing cart/order flow**: Users must be able to create orders through existing cart checkout process
- **Authentication system**: JWT-based auth must be working (already implemented per CLAUDE.md)
- **React Router**: Routing must support query parameters for callback URLs
- **TanStack Query**: React Query hooks infrastructure must be configured
- **Zustand stores**: useAuthStore must provide authentication state
- **Axios client**: API client with interceptors must handle 401/token refresh

### External Dependencies

- **Kakao Pay service availability**: Payment processing depends on Kakao Pay API uptime
- **Kakao Pay test environment**: Development testing requires access to Kakao Pay sandbox/test mode
- **Network connectivity**: Payment redirect flow requires stable internet connection

### Development Dependencies

- **MSW (Mock Service Worker)**: Mock handlers for payment endpoints during development
- **Zod schemas**: Schema validation library for runtime type checking
- **Environment variables**: VITE_API_BASE_URL and VITE_PROXY_TARGET configured

## Technical Constraints *(optional)*

- **No server-side rendering**: Payment pages are client-side rendered (Vite SPA)
- **localStorage limitations**: Payment state not synced across browser tabs (acceptable for MVP)
- **Browser redirect required**: Cannot use iframe or API-only payment due to Kakao Pay redirect flow
- **Mobile detection via user agent**: Device type detection uses navigator.userAgent (limited accuracy)
- **Query parameter size limit**: Callback URLs must keep pg_token and order_id within URL length limits (typically 2048 characters)
- **React Query cache timing**: Payment status refetch timing set to 5 minutes staleTime (configurable)
- **No real-time updates**: Payment status doesn't auto-update if changed in another tab (requires manual refresh)
- **Error logging client-side only**: Payment errors logged to browser console (no centralized error tracking in MVP)
- **Zod validation overhead**: Runtime schema validation adds ~50-100ms per API call (acceptable for payment flow)
- **Bundle size impact**: Payment pages + dependencies estimated to add ~150KB to bundle (within budget)

## Open Questions *(optional)*

None - all critical decisions have been resolved with reasonable defaults documented in Assumptions section.
