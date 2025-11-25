# Kakao Pay Integration: Technical Research & Decisions

**Feature Branch**: `feat-kakao-pay`
**Created**: 2025-01-19
**Status**: Research Complete
**Related Documents**:
- [Feature Specification](./spec.md)
- [Integration Guide](../../docs/KAKAO_PAY_INTEGRATION.md)
- [Project Architecture](../../CLAUDE.md)

---

## Table of Contents

1. [Kakao Pay API Integration Patterns](#1-kakao-pay-api-integration-patterns)
2. [Payment State Management](#2-payment-state-management)
3. [Mobile Device Detection](#3-mobile-device-detection)
4. [Error Recovery Patterns](#4-error-recovery-patterns)
5. [Testing Strategies](#5-testing-strategies)
6. [Implementation Roadmap](#6-implementation-roadmap)

---

## 1. Kakao Pay API Integration Patterns

### 1.1 Redirect-Based Payment Flow

#### Decision: Server-Coordinated Redirect Pattern

**Chosen Approach**: Use a three-step server-coordinated redirect flow where the backend handles all direct Kakao Pay API communication.

```
┌──────────┐                    ┌──────────┐                    ┌───────────┐
│ Frontend │                    │ Backend  │                    │ Kakao Pay │
└────┬─────┘                    └────┬─────┘                    └─────┬─────┘
     │                               │                                 │
     │ 1. POST /ready (order_id)     │                                 │
     ├──────────────────────────────>│                                 │
     │                               │ 2. POST /ready (with credentials)│
     │                               ├────────────────────────────────>│
     │                               │                                 │
     │                               │ 3. TID + redirect URLs          │
     │                               │<────────────────────────────────┤
     │ 4. TID + redirect URLs        │                                 │
     │<──────────────────────────────┤                                 │
     │                               │                                 │
     │ 5. window.location.href = URL │                                 │
     ├───────────────────────────────────────────────────────────────>│
     │                               │                                 │
     │                               │ 6. GET /success (with pg_token) │
     │                               │<────────────────────────────────┤
     │                               │                                 │
     │                               │ 7. POST /approve (with pg_token)│
     │                               ├────────────────────────────────>│
     │                               │                                 │
     │                               │ 8. Payment approved (AID)       │
     │                               │<────────────────────────────────┤
     │                               │                                 │
     │ 9. Redirect to /success page  │                                 │
     │<──────────────────────────────┤                                 │
     │                               │                                 │
     │ 10. Display success + refetch │                                 │
     └───────────────────────────────┘                                 │
```

**Rationale**:
- **Security**: Kakao Pay API credentials (CID, secret key) never exposed to frontend
- **Simplicity**: Frontend only handles UI navigation, no complex API orchestration
- **Backend control**: Backend can implement transaction locking, idempotency checks, and audit logging
- **Token lifecycle**: `pg_token` is single-use and short-lived (~15 minutes), reducing security risks
- **Error handling**: Backend can centralize Kakao Pay error mapping to Korean messages

**Alternatives Considered**:

1. **Client-Side Direct Integration**
   - ❌ Rejected: Would require exposing Kakao Pay credentials in frontend (major security risk)
   - ❌ Rejected: Cannot implement server-side transaction locking or idempotency

2. **Iframe/Popup-Based Flow**
   - ❌ Rejected: Modern browsers block cross-origin iframes for payment security
   - ❌ Rejected: Popup blockers would interfere with user experience
   - ❌ Rejected: Kakao Pay explicitly recommends full-page redirect

3. **WebSocket Real-Time Updates**
   - ❌ Rejected: Adds unnecessary complexity (YAGNI principle)
   - ❌ Rejected: Redirect-based flow is standard and proven for Korean payment gateways
   - ❌ Rejected: Increases infrastructure requirements (WebSocket server)

---

### 1.2 pg_token Lifecycle and Security

#### Decision: Single-Use Token Pattern with Backend-Only Handling

**Token Flow**:
```typescript
// 1. Backend receives pg_token from Kakao Pay redirect
GET /api/v1/payments/kakao/success?order_id=123&pg_token=abc123def456

// 2. Backend immediately consumes token (POST /approve to Kakao Pay)
POST https://kapi.kakao.com/v1/payment/approve
{
  "cid": "MERCHANT_CID",
  "tid": "T123...",
  "partner_order_id": "123",
  "partner_user_id": "user_456",
  "pg_token": "abc123def456"  // ← Single-use, expires in ~15 min
}

// 3. Backend returns approval response to frontend
{
  "message": "Payment completed successfully",
  "data": {
    "order_id": 123,
    "aid": "A789...",
    "tid": "T123...",
    "total_amount": 50000,
    "payment_method": "MONEY",
    "approved_at": "2025-01-19T12:34:56Z"
  }
}
```

**Security Considerations**:

| Concern | Mitigation |
|---------|-----------|
| Token interception | HTTPS enforced in production + token expires in 15 minutes |
| Token reuse | Kakao Pay rejects duplicate approve requests + Backend tracks used tokens |
| CSRF attacks | Backend validates `order_id` belongs to authenticated user |
| Race conditions | Backend uses database transaction locking during approval |
| Token logging | Frontend never logs `pg_token` in console or analytics |

**Frontend Responsibilities**:
```typescript
// ✅ Frontend ONLY reads pg_token from URL and passes to backend
const [searchParams] = useSearchParams();
const pgToken = searchParams.get('pg_token'); // Read once
const orderId = searchParams.get('order_id');

// ✅ Immediately call backend endpoint (no storage, no logging)
approvePayment({ orderId, pgToken });

// ❌ NEVER do this:
// localStorage.setItem('pg_token', pgToken); // Security risk!
// console.log('Token:', pgToken);              // Leaked in logs!
```

**Rationale**:
- **Single-use tokens** prevent replay attacks and token theft
- **Backend-only approval** ensures payment integrity (frontend can't fake approval)
- **No frontend storage** minimizes exposure window
- **Automatic expiration** limits damage if token is somehow leaked

**Alternatives Considered**:

1. **Frontend-Side Token Storage**
   - ❌ Rejected: localStorage/sessionStorage vulnerable to XSS attacks
   - ❌ Rejected: No legitimate reason to persist token (should be consumed immediately)

2. **Token Encryption in Frontend**
   - ❌ Rejected: Adds complexity without meaningful security improvement (token is already TLS-encrypted)
   - ❌ Rejected: Encryption keys would need to be in frontend code (same exposure risk)

---

### 1.3 Error Scenarios and Recovery

#### Decision: Multi-Tiered Error Handling with User-Friendly Recovery

**Error Classification**:

```typescript
// Error hierarchy (from specific to general)
enum PaymentErrorType {
  // User errors (recoverable)
  INSUFFICIENT_FUNDS = 'payment/insufficient-funds',
  CANCELED_BY_USER = 'payment/canceled',
  PAYMENT_LIMIT_EXCEEDED = 'payment/limit-exceeded',

  // Technical errors (retryable)
  NETWORK_TIMEOUT = 'payment/network-timeout',
  KAKAO_API_ERROR = 'payment/kakao-error',
  TOKEN_EXPIRED = 'payment/token-expired',

  // Business errors (non-retryable)
  ORDER_NOT_FOUND = 'payment/order-not-found',
  PAYMENT_ALREADY_PROCESSED = 'payment/already-processed',
  INVALID_AMOUNT = 'payment/invalid-amount',

  // System errors (requires support)
  DATABASE_ERROR = 'payment/database-error',
  UNKNOWN_ERROR = 'payment/unknown',
}
```

**Error Recovery Matrix**:

| Error Type | User Message | Recovery Action | Backend Response |
|-----------|-------------|-----------------|------------------|
| `INSUFFICIENT_FUNDS` | "결제 수단의 잔액이 부족합니다" | Show retry button → redirect to payment page | 400 Bad Request |
| `CANCELED_BY_USER` | "결제가 취소되었습니다" | Show retry button | 200 OK (cancel callback) |
| `NETWORK_TIMEOUT` | "네트워크 오류가 발생했습니다. 다시 시도해주세요" | Auto-retry (3 attempts) → manual retry button | 500 Server Error |
| `TOKEN_EXPIRED` | "결제 시간이 만료되었습니다. 처음부터 다시 시도해주세요" | Redirect to payment initiation | 400 Bad Request |
| `PAYMENT_ALREADY_PROCESSED` | "이미 결제가 완료된 주문입니다" | Redirect to order history | 409 Conflict |
| `ORDER_NOT_FOUND` | "주문 정보를 찾을 수 없습니다" | Show support contact | 404 Not Found |
| `UNKNOWN_ERROR` | "결제 처리 중 오류가 발생했습니다. 고객센터로 문의해주세요" | Show support contact + order ID | 500 Server Error |

**Implementation Pattern**:

```typescript
// src/pages/PaymentSuccessPage.tsx
export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { mutate: approvePayment, isPending, error } = useHandlePaymentSuccess();

  useEffect(() => {
    const orderId = searchParams.get('order_id');
    const pgToken = searchParams.get('pg_token');

    if (!orderId || !pgToken) {
      // Missing parameters - likely tampered URL
      navigate('/payment/fail?error=invalid_parameters');
      return;
    }

    approvePayment(
      { orderId: parseInt(orderId), pgToken },
      {
        onSuccess: (data) => {
          // Success - display approval data
          setApprovalData(data.data);
        },
        onError: (error) => {
          // Error handling based on type
          if (error instanceof ApiError) {
            switch (error.statusCode) {
              case 409:
                // Already processed - redirect to orders
                navigate('/mypage');
                break;
              case 400:
                // Bad request - show error with retry
                // Error message already in error.message
                break;
              default:
                // Generic error - show support contact
                break;
            }
          }
        },
      }
    );
  }, [searchParams, approvePayment, navigate]);

  // Render based on state (pending/error/success)
  // ...
}
```

**Rationale**:
- **Clear error categories** help users understand what went wrong
- **Actionable recovery** (retry vs contact support) reduces frustration
- **Preserve order data** so users can retry without re-creating order
- **Backend error mapping** to Korean ensures consistent messaging

**Alternatives Considered**:

1. **Generic Error Page for All Errors**
   - ❌ Rejected: Poor UX, users don't know what action to take
   - ❌ Rejected: Cannot differentiate retryable vs non-retryable errors

2. **Automatic Infinite Retries**
   - ❌ Rejected: Could cause payment loop if error persists (e.g., insufficient funds)
   - ❌ Rejected: Network retries should be limited (avoid server overload)

---

### 1.4 Callback URL Requirements

#### Decision: Separate Callback URLs per Scenario with Backend Routing

**URL Structure**:

```typescript
// Registered in Kakao Pay dashboard (production)
const KAKAO_PAY_CALLBACKS = {
  success: 'https://udonggeum.com/api/v1/payments/kakao/success',
  fail: 'https://udonggeum.com/api/v1/payments/kakao/fail',
  cancel: 'https://udonggeum.com/api/v1/payments/kakao/cancel',
} as const;

// Development/staging
const KAKAO_PAY_CALLBACKS_DEV = {
  success: 'http://localhost:8080/api/v1/payments/kakao/success',
  fail: 'http://localhost:8080/api/v1/payments/kakao/fail',
  cancel: 'http://localhost:8080/api/v1/payments/kakao/cancel',
} as const;
```

**Backend Routing Pattern**:

```go
// Backend (example in Go)
// Each callback endpoint receives Kakao Pay redirect, processes, then redirects to frontend

// Success callback
r.GET("/api/v1/payments/kakao/success", func(c *gin.Context) {
  orderID := c.Query("order_id")
  pgToken := c.Query("pg_token")

  // 1. Validate parameters
  // 2. Call Kakao Pay /approve endpoint
  // 3. Update order payment status
  // 4. Redirect to frontend success page with order_id

  c.Redirect(302, fmt.Sprintf("https://udonggeum.com/payment/success?order_id=%s", orderID))
})

// Fail callback
r.GET("/api/v1/payments/kakao/fail", func(c *gin.Context) {
  orderID := c.Query("order_id")
  errorMsg := c.Query("error_msg")

  // 1. Log failure details
  // 2. Update order status (remains pending for retry)
  // 3. Redirect to frontend fail page

  c.Redirect(302, fmt.Sprintf("https://udonggeum.com/payment/fail?order_id=%s&error_msg=%s", orderID, errorMsg))
})

// Cancel callback
r.GET("/api/v1/payments/kakao/cancel", func(c *gin.Context) {
  orderID := c.Query("order_id")

  // 1. Log cancellation
  // 2. Order remains pending (no status change needed)
  // 3. Redirect to frontend cancel page

  c.Redirect(302, fmt.Sprintf("https://udonggeum.com/payment/cancel?order_id=%s", orderID))
})
```

**HTTPS Enforcement**:

```typescript
// vite.config.ts (development proxy)
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false, // Allow self-signed certs in dev
      },
    },
  },
});

// Production: Enforce HTTPS via hosting platform (Vercel, Netlify)
// vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        }
      ]
    }
  ]
}
```

**Rationale**:
- **Separate URLs** enable different handling logic per scenario (success requires approval, cancel doesn't)
- **Backend intermediary** allows processing before frontend sees the result
- **302 redirect** from backend to frontend provides seamless user experience
- **HTTPS requirement** enforced by Kakao Pay API (non-HTTPS callbacks will be rejected in production)

**Alternatives Considered**:

1. **Single Callback URL with Query Parameter**
   - ❌ Rejected: Less clear separation of concerns
   - ❌ Rejected: Harder to implement different logic per scenario

2. **Direct Frontend Callbacks**
   - ❌ Rejected: Would expose `pg_token` in frontend URL (visible in browser history)
   - ❌ Rejected: Cannot perform backend approval before showing frontend page

---

## 2. Payment State Management

### 2.1 React Query Cache Configuration

#### Decision: Aggressive Stale-Time with Manual Invalidation

**Cache Strategy**:

```typescript
// src/hooks/queries/usePaymentQueries.ts

export const paymentKeys = {
  all: ['payments'] as const,
  status: (orderId: number) => [...paymentKeys.all, 'status', orderId] as const,
};

export function usePaymentStatus(orderId: number) {
  return useQuery({
    queryKey: paymentKeys.status(orderId),
    queryFn: () => paymentService.getPaymentStatus(orderId),

    // ✅ Long stale time - payment status rarely changes after completion
    staleTime: 1000 * 60 * 10, // 10 minutes

    // ✅ Long cache time - preserve data for navigation
    gcTime: 1000 * 60 * 30, // 30 minutes

    // ✅ Don't refetch on window focus - payment is historical data
    refetchOnWindowFocus: false,

    // ✅ Only fetch when order ID is valid
    enabled: !!orderId && orderId > 0,

    // ✅ Retry on network errors, not business errors
    retry: (failureCount, error) => {
      if (error instanceof ApiError) {
        // Don't retry 4xx errors (client errors)
        return error.statusCode >= 500 && failureCount < 3;
      }
      return failureCount < 3;
    },
  });
}

export function useHandlePaymentSuccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, pgToken }: { orderId: number; pgToken: string }) =>
      paymentService.handlePaymentSuccess(orderId, pgToken),

    onSuccess: (data, variables) => {
      // ✅ Invalidate payment status cache
      queryClient.invalidateQueries({
        queryKey: paymentKeys.status(variables.orderId),
      });

      // ✅ Invalidate orders cache (payment status changed)
      queryClient.invalidateQueries({
        queryKey: ordersKeys.all,
      });

      // ✅ Optimistically update cache with approval data
      queryClient.setQueryData(
        paymentKeys.status(variables.orderId),
        {
          message: 'Success',
          data: {
            order_id: variables.orderId,
            payment_status: 'completed',
            payment_tid: data.data.tid,
            payment_aid: data.data.aid,
            payment_approved_at: data.data.approved_at,
            total_amount: data.data.total_amount,
          },
        }
      );
    },
  });
}
```

**Configuration Rationale**:

| Setting | Value | Reason |
|---------|-------|--------|
| `staleTime` | 10 minutes | Payment status is immutable after completion; no need for frequent polling |
| `gcTime` | 30 minutes | Keep cached for back/forward navigation without refetching |
| `refetchOnWindowFocus` | `false` | Historical payment data doesn't change when user returns to tab |
| `refetchOnReconnect` | `false` | Same reasoning - payment is historical |
| `retry` | Conditional (3× for 5xx only) | Don't retry business errors (4xx); retry server errors up to 3 times |

**Alternatives Considered**:

1. **Short Stale Time (1 minute) with Polling**
   - ❌ Rejected: Unnecessary backend load (payment status doesn't change after completion)
   - ❌ Rejected: Wastes user bandwidth

2. **Infinite Stale Time**
   - ❌ Rejected: If payment is refunded, user wouldn't see update until manual refresh
   - ⚠️ Trade-off: 10 minutes is compromise (long enough to avoid excessive requests, short enough to eventually reflect refunds)

3. **Manual Refetch Only (no background updates)**
   - ❌ Rejected: Poor UX if user navigates away and back (would see stale data)

---

### 2.2 Request Queue Pattern for Duplicate Prevention

#### Decision: Mutation State + Button Disable Pattern

**Problem**: User clicks "결제하기" button multiple times in quick succession (slow network, impatient user, accidental double-click).

**Solution**: Combine React Query mutation state with UI button disabling.

```typescript
// src/pages/PaymentPage.tsx

export default function PaymentPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const {
    mutate: initiatePayment,
    isPending,  // ← React Query tracks pending state
    error,
  } = useInitiateKakaoPay();

  const handlePayment = () => {
    // Mutation automatically deduplicated by React Query
    initiatePayment(
      { order_id: parseInt(orderId!) },
      {
        onSuccess: (response) => {
          // ✅ Redirect happens AFTER mutation completes
          const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
          const redirectUrl = isMobile
            ? response.data.next_redirect_mobile_url
            : response.data.next_redirect_pc_url;

          // ✅ Full page redirect prevents duplicate clicks
          window.location.href = redirectUrl;
        },
      }
    );
  };

  return (
    <Button
      variant="primary"
      onClick={handlePayment}
      disabled={isPending}  // ← Button disabled during request
      className="min-w-[120px]"
    >
      {isPending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          처리 중...
        </>
      ) : (
        '카카오페이 결제'
      )}
    </Button>
  );
}
```

**React Query Built-In Deduplication**:

React Query automatically deduplicates mutations with the same mutation key:

```typescript
// If user clicks button 3 times rapidly:
// Click 1 → Mutation starts, isPending = true
// Click 2 → Ignored (button is disabled)
// Click 3 → Ignored (button is disabled)

// If somehow multiple mutations were triggered (bug):
// React Query would queue them, not run in parallel
```

**Backend Idempotency Check**:

```go
// Backend layer adds additional protection
func (s *PaymentService) InitiatePayment(orderID int, userID int) (*PaymentReadyResponse, error) {
  // 1. Check if payment already initiated for this order
  existingPayment, err := s.repo.GetPaymentByOrderID(orderID)
  if err == nil && existingPayment.TID != "" {
    // Payment already initiated - return existing TID
    return &PaymentReadyResponse{
      TID: existingPayment.TID,
      // ... existing redirect URLs
    }, nil
  }

  // 2. Use database transaction with row-level lock
  tx := s.db.Begin()
  defer tx.Rollback()

  // 3. Lock order row (prevents concurrent initiation)
  var order Order
  if err := tx.Set("gorm:query_option", "FOR UPDATE").
    Where("id = ? AND user_id = ?", orderID, userID).
    First(&order).Error; err != nil {
    return nil, err
  }

  // 4. Verify payment not already processed
  if order.PaymentStatus == "completed" {
    return nil, errors.New("payment already processed")
  }

  // 5. Call Kakao Pay API
  readyResp, err := s.kakaoPayClient.Ready(...)
  if err != nil {
    return nil, err
  }

  // 6. Store TID
  payment := Payment{
    OrderID: orderID,
    TID:     readyResp.TID,
  }
  tx.Create(&payment)

  tx.Commit()
  return readyResp, nil
}
```

**Rationale**:
- **Frontend prevention** (button disable) handles 99% of cases (user won't/can't click disabled button)
- **React Query deduplication** handles edge cases (programmatic duplicate calls)
- **Backend idempotency** is final safeguard (protects against bugs or malicious clients)
- **Database locking** prevents race conditions if multiple servers handle concurrent requests

**Alternatives Considered**:

1. **Request Queue with Array**
   - ❌ Rejected: React Query already provides this (mutation queue)
   - ❌ Rejected: Adds unnecessary complexity

2. **Debounce/Throttle Button Clicks**
   - ⚠️ Considered but not primary solution: Debounce is useful but doesn't prevent programmatic duplicate calls
   - ✅ Could be added as extra layer: `onClick={debounce(handlePayment, 1000)}`

3. **Global Loading State in Zustand**
   - ❌ Rejected: React Query `isPending` already provides this
   - ❌ Rejected: Violates "Server State in React Query" principle

---

### 2.3 Race Condition Handling

#### Decision: Backend Transaction Locking + Frontend Optimistic Locks

**Race Condition Scenarios**:

1. **User opens payment page in 2 tabs, clicks "Pay" in both**
   - Backend database lock ensures only one payment initiation succeeds
   - Second request returns existing TID (idempotent)

2. **User completes payment, backend approval in progress, user clicks "Retry"**
   - Frontend checks payment status before allowing retry
   - Backend validates order not already completed

3. **Concurrent approval requests (if somehow pg_token leaked)**
   - Kakao Pay rejects duplicate approval with same pg_token
   - Backend tracks approval ID (AID) to detect duplicates

**Frontend Protection**:

```typescript
// src/pages/PaymentPage.tsx

export default function PaymentPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const orderIdNum = orderId ? parseInt(orderId, 10) : 0;

  // Check payment status BEFORE showing payment button
  const { data: paymentStatus, isLoading: isLoadingPayment } = usePaymentStatus(orderIdNum);

  // Redirect if already completed
  useEffect(() => {
    if (paymentStatus?.data.payment_status === 'completed') {
      // ✅ Optimistic lock - frontend prevents access to payment page
      navigate('/mypage', { replace: true });
    }
  }, [paymentStatus, navigate]);

  // Don't even render payment button if completed
  if (paymentStatus?.data.payment_status === 'completed') {
    return (
      <div>
        <p>결제가 이미 완료된 주문입니다.</p>
        <Button onClick={() => navigate('/mypage')}>주문 내역 보기</Button>
      </div>
    );
  }

  // ... rest of payment page
}
```

**Backend Protection** (example):

```go
// Approval handler with locking
func (h *PaymentHandler) HandleSuccess(c *gin.Context) {
  orderID := c.Query("order_id")
  pgToken := c.Query("pg_token")

  // 1. Start database transaction
  tx := h.db.Begin()
  defer tx.Rollback()

  // 2. Lock order row (pessimistic lock)
  var order Order
  if err := tx.Set("gorm:query_option", "FOR UPDATE NOWAIT").
    Where("id = ?", orderID).
    First(&order).Error; err != nil {
    // Another request is processing this order
    if errors.Is(err, gorm.ErrLockWaitTimeout) {
      c.JSON(409, gin.H{"error": "결제 처리 중입니다. 잠시 후 다시 시도해주세요"})
      return
    }
    c.JSON(500, gin.H{"error": "주문 조회 실패"})
    return
  }

  // 3. Check if already processed
  if order.PaymentStatus == "completed" {
    // Race condition detected - another request already completed
    c.JSON(409, gin.H{"error": "이미 결제가 완료된 주문입니다"})
    return
  }

  // 4. Call Kakao Pay /approve
  approvalResp, err := h.kakaoPay.Approve(order.PaymentTID, pgToken)
  if err != nil {
    // Kakao Pay error (including duplicate approval rejection)
    c.JSON(500, gin.H{"error": err.Error()})
    return
  }

  // 5. Update order with approval data
  order.PaymentStatus = "completed"
  order.PaymentAID = approvalResp.AID
  order.PaymentApprovedAt = approvalResp.ApprovedAt
  tx.Save(&order)

  // 6. Commit transaction
  tx.Commit()

  // 7. Redirect to frontend success page
  c.Redirect(302, fmt.Sprintf("/payment/success?order_id=%s", orderID))
}
```

**Lock Strategy Comparison**:

| Lock Type | Implementation | Pros | Cons |
|-----------|---------------|------|------|
| Optimistic Lock (frontend) | Check payment status before action | Low overhead, good UX | Doesn't prevent backend race |
| Pessimistic Lock (database) | `SELECT ... FOR UPDATE` | Guarantees atomicity | Slight performance impact |
| Distributed Lock (Redis) | `SET key NX EX 30` | Works across multiple servers | Requires Redis, added complexity |

**Chosen Approach**: Optimistic lock (frontend) + Pessimistic lock (database)

**Rationale**:
- Frontend check prevents 99% of duplicate attempts (fast UX feedback)
- Database lock provides definitive protection (handles malicious/buggy clients)
- No need for distributed lock in MVP (single database server, row-level locking sufficient)

**Alternatives Considered**:

1. **Redis Distributed Lock**
   - ❌ Rejected for MVP: Adds infrastructure complexity (YAGNI)
   - ✅ Consider for scale: If multiple backend servers, Redis lock would prevent race across servers

2. **Optimistic Locking Only (version field)**
   - ❌ Rejected: Would require retry logic, poor UX on concurrent access
   - ❌ Rejected: Doesn't work well for payment (can't ask user to "retry" if payment is processing)

---

## 3. Mobile Device Detection

### 3.1 User Agent Detection

#### Decision: Regex-Based Detection with Mobile-First Fallback

**Implementation**:

```typescript
// src/utils/deviceDetection.ts

/**
 * Detect if current device is mobile
 * Uses navigator.userAgent to determine device type
 *
 * @returns true if mobile device (phone or tablet), false otherwise
 */
export function isMobileDevice(): boolean {
  // Check if window and navigator exist (SSR safety)
  if (typeof window === 'undefined' || !window.navigator) {
    return false; // Default to desktop in SSR
  }

  const userAgent = window.navigator.userAgent.toLowerCase();

  // Mobile device patterns (covers phones and tablets)
  const mobilePatterns = [
    /android/i,
    /webos/i,
    /iphone/i,
    /ipad/i,
    /ipod/i,
    /blackberry/i,
    /windows phone/i,
    /mobile/i,
  ];

  return mobilePatterns.some((pattern) => pattern.test(userAgent));
}

/**
 * Get appropriate Kakao Pay redirect URL based on device
 *
 * @param response Payment ready response from backend
 * @returns Appropriate redirect URL for current device
 */
export function getKakaoPayRedirectUrl(
  response: PaymentReadyResponse
): string {
  const mobile = isMobileDevice();

  // ✅ Use mobile URL for mobile devices
  if (mobile) {
    return response.data.next_redirect_mobile_url;
  }

  // ✅ Use PC URL for desktop
  return response.data.next_redirect_pc_url;
}
```

**Usage in Component**:

```typescript
// src/pages/PaymentPage.tsx

import { getKakaoPayRedirectUrl } from '@/utils/deviceDetection';

const handlePayment = () => {
  initiatePayment(
    { order_id: orderIdNum },
    {
      onSuccess: (response) => {
        // ✅ Automatically select correct URL
        const redirectUrl = getKakaoPayRedirectUrl(response);
        window.location.href = redirectUrl;
      },
    }
  );
};
```

**Detection Accuracy**:

| Device | User Agent String | Detection Result |
|--------|------------------|------------------|
| iPhone 15 Pro | `Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) ...` | ✅ Mobile |
| iPad Pro | `Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) ...` | ✅ Mobile |
| Galaxy S24 | `Mozilla/5.0 (Linux; Android 14; SM-S921N) ...` | ✅ Mobile |
| Desktop Chrome | `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ...` | ✅ Desktop |
| Desktop Safari | `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ...` | ✅ Desktop |
| Tablet Mode Chrome | `Mozilla/5.0 (Linux; Android 13; Pixel Tablet) ...` | ✅ Mobile |

**Edge Cases**:

| Edge Case | Handling |
|-----------|----------|
| Desktop Chrome DevTools mobile emulation | Detected as mobile (user agent spoofed) - Works correctly |
| iPad in "Request Desktop Site" mode | Detected as desktop (user explicitly requested) - Acceptable |
| Foldable phones (Galaxy Fold) | Detected as mobile (Android in user agent) - Correct |
| Smart TVs with browser | Detected as desktop (no mobile pattern) - Acceptable fallback |
| Bot/crawler user agents | Detected as desktop - Doesn't matter (bots won't make payments) |

**Rationale**:
- **Simple and reliable**: User agent detection works for 99% of cases
- **Zero dependencies**: No need for heavy libraries (like `mobile-detect` or `bowser`)
- **Instant detection**: No async calls or delays
- **SEO-safe**: Can run in SSR (with fallback)

**Alternatives Considered**:

1. **CSS Media Query Detection**
   ```typescript
   const isMobile = window.matchMedia('(max-width: 768px)').matches;
   ```
   - ❌ Rejected: Detects viewport size, not device type (user might be on desktop with narrow window)
   - ❌ Rejected: Doesn't work for tablet in landscape mode (width > 768px)

2. **Touch Event Detection**
   ```typescript
   const isMobile = 'ontouchstart' in window;
   ```
   - ❌ Rejected: Many laptops now have touch screens (false positive)
   - ❌ Rejected: Doesn't detect device type accurately

3. **Third-Party Library (e.g., `react-device-detect`)**
   - ⚠️ Considered: More comprehensive device detection
   - ❌ Rejected: Adds 15KB to bundle for minimal benefit
   - ❌ Rejected: User agent regex is sufficient for payment redirect

4. **Backend Detection + API Parameter**
   ```typescript
   // Send device type to backend
   initiatePayment({ order_id: 123, device_type: 'mobile' })
   ```
   - ❌ Rejected: Adds unnecessary API complexity
   - ❌ Rejected: Backend shouldn't care about device type (both URLs are returned anyway)

---

### 3.2 PWA Implications

#### Decision: Defer PWA-Specific Handling to Post-MVP

**Current Approach**: Treat PWA as mobile browser (web-based payment flow).

**PWA Payment Flow**:
```
PWA App → window.location.href (Kakao Pay URL) → Exits PWA → Opens in Safari/Chrome
→ User completes payment in browser → Redirect back → Opens PWA (if installed) or browser
```

**Limitations in MVP**:
- ✅ PWA exits to browser for payment (expected behavior)
- ❌ PWA doesn't seamlessly return to app after payment (user sees "Open in App" prompt)
- ❌ No deep linking configured for PWA payment callbacks

**Post-MVP Enhancements** (out of scope):

1. **Deep Link Registration**
   ```json
   // manifest.json
   {
     "scope": "/",
     "start_url": "/",
     "share_target": {
       "action": "/payment/success",
       "method": "GET",
       "params": {
         "order_id": "order_id",
         "pg_token": "pg_token"
       }
     }
   }
   ```

2. **iOS Universal Links**
   ```json
   // apple-app-site-association
   {
     "applinks": {
       "apps": [],
       "details": [{
         "appID": "TEAM_ID.com.udonggeum.app",
         "paths": ["/payment/success", "/payment/fail", "/payment/cancel"]
       }]
     }
   }
   ```

3. **Android App Links**
   ```json
   // assetlinks.json
   [{
     "relation": ["delegate_permission/common.handle_all_urls"],
     "target": {
       "namespace": "web",
       "site": "https://udonggeum.com"
     }
   }]
   ```

**Rationale for Deferral**:
- **MVP priority**: Get web-based payment working first (covers 90% of users)
- **PWA adoption**: Only ~5-10% of users install PWAs in Korea (as of 2025)
- **Complexity**: Deep linking requires server configuration + testing across platforms
- **YAGNI**: Build when user demand exists, not speculatively

---

## 4. Error Recovery Patterns

### 4.1 Payment Timeout Handling

#### Decision: Multi-Layer Timeout Strategy

**Timeout Layers**:

```typescript
// Layer 1: Axios Client Timeout (10 seconds)
// src/api/client.ts
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // ← 10 seconds for all API calls
});

// Layer 2: React Query Retry with Exponential Backoff
// src/hooks/queries/usePaymentQueries.ts
export function useInitiateKakaoPay() {
  return useMutation({
    mutationFn: (request: PaymentReadyRequest) =>
      paymentService.initiateKakaoPay(request),
    retry: 3, // ← Retry up to 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    // ← Exponential backoff: 1s, 2s, 4s
  });
}

// Layer 3: User-Facing Timeout (Kakao Pay page itself)
// User has ~15 minutes on Kakao Pay page before pg_token expires
// Backend validates token expiration on approval

// Layer 4: User Manual Retry
// If all else fails, show user-friendly error with retry button
```

**Timeout Scenarios**:

| Scenario | Timeout | User Experience | Recovery |
|----------|---------|-----------------|----------|
| Payment initiation API call | 10s (Axios) | Spinner → Error message: "네트워크가 느립니다. 다시 시도해주세요" | Auto-retry 3× → Manual retry button |
| Kakao Pay page load | 30s (browser default) | User sees blank page | User can close tab, retry from order history |
| User stays on Kakao Pay page | 15min (pg_token TTL) | User completes payment → Backend rejects expired token | Error page: "결제 시간이 만료되었습니다. 처음부터 다시 시도해주세요" |
| Payment approval API call | 10s (Axios) | Spinner → Error message: "결제 승인 중 오류가 발생했습니다" | Auto-retry 3× → Manual retry (backend idempotency ensures no duplicate charge) |

**Implementation**:

```typescript
// src/pages/PaymentPage.tsx

export default function PaymentPage() {
  const {
    mutate: initiatePayment,
    isPending,
    error,
    failureCount, // ← Tracks retry attempts
  } = useInitiateKakaoPay();

  const handlePayment = () => {
    initiatePayment(
      { order_id: orderIdNum },
      {
        onSuccess: (response) => {
          const redirectUrl = getKakaoPayRedirectUrl(response);
          window.location.href = redirectUrl;
        },
        onError: (error) => {
          // Error already handled by React Query retry logic
          // Just show error message to user
        },
      }
    );
  };

  return (
    <div>
      {error && (
        <ErrorAlert>
          {failureCount >= 3 ? (
            // After 3 retries
            <>
              네트워크 오류가 계속되고 있습니다.
              잠시 후 다시 시도하거나 고객센터로 문의해주세요.
            </>
          ) : (
            // Initial error
            <>
              결제 요청 중 오류가 발생했습니다.
              {error instanceof NetworkError ? '네트워크 연결을 확인해주세요.' : ''}
            </>
          )}
        </ErrorAlert>
      )}

      <Button onClick={handlePayment} disabled={isPending}>
        {isPending ? '처리 중...' : '카카오페이 결제'}
      </Button>
    </div>
  );
}
```

**Rationale**:
- **10-second timeout** is reasonable for payment initiation (backend should respond quickly)
- **3 retries with backoff** handles transient network issues without hammering server
- **15-minute pg_token TTL** is Kakao Pay's design (we can't change it)
- **Manual retry** gives users control when automatic retry fails

**Alternatives Considered**:

1. **Longer Axios Timeout (30+ seconds)**
   - ❌ Rejected: Poor UX (user stares at spinner for 30 seconds)
   - ❌ Rejected: Masks backend performance issues

2. **Infinite Retries**
   - ❌ Rejected: Could trap user in endless loop if backend is down
   - ❌ Rejected: Should fail fast and show error to user

3. **Shorter pg_token TTL**
   - ❌ Rejected: Can't control (Kakao Pay's policy)
   - ❌ Rejected: 15 minutes is already tight for users who get distracted

---

### 4.2 Session Expiration During Redirect

#### Decision: Silent Token Refresh with Order Preservation

**Problem**: User takes 10+ minutes on Kakao Pay page → JWT access token expires (30min TTL) → User returns to frontend → 401 error on order fetch.

**Solution**: Automatic token refresh via Axios interceptor (already implemented).

**Flow**:
```
1. User initiates payment at 12:00 (JWT expires at 12:30)
2. User redirected to Kakao Pay
3. User completes payment at 12:35 (JWT expired 5 min ago)
4. Kakao Pay redirects to backend success callback
5. Backend redirects to frontend /payment/success
6. Frontend makes API call: GET /api/v1/payments/kakao/success?order_id=123&pg_token=abc
   ↓
7. Backend returns 401 (access token expired)
   ↓
8. Axios interceptor intercepts 401
9. Calls POST /api/v1/auth/refresh with refresh_token
10. Gets new access_token + refresh_token
11. Updates Zustand store
12. Retries original request with new token
   ↓
13. Success! Payment approval completes
```

**Implementation** (already exists in `src/api/client.ts:159-232`):

```typescript
// Response interceptor with automatic token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;

    // 401 Unauthorized - Attempt token refresh
    if (status === 401 && error.config && !error.config._retry) {
      error.config._retry = true; // Mark to prevent infinite loop

      const refreshToken = useAuthStore.getState().tokens?.refresh_token;
      if (!refreshToken) {
        // No refresh token - force re-login
        useAuthStore.getState().clearAuth();
        window.location.href = '/login';
        return Promise.reject(new ApiError('인증이 만료되었습니다', status));
      }

      try {
        // ✅ Refresh token
        const response = await apiClient.post('/api/v1/auth/refresh', {
          refresh_token: refreshToken,
        });

        // ✅ Update store with new tokens
        const newTokens = TokensSchema.parse(response.data);
        useAuthStore.getState().updateTokens(newTokens);

        // ✅ Retry original request with new token
        if (error.config.headers) {
          error.config.headers.Authorization = `Bearer ${newTokens.access_token}`;
        }
        return apiClient(error.config);
      } catch (refreshError) {
        // Refresh failed - force re-login
        useAuthStore.getState().clearAuth();
        window.location.href = '/login';
        return Promise.reject(new ApiError('세션이 만료되었습니다', status));
      }
    }

    return Promise.reject(error);
  }
);
```

**Edge Cases**:

| Edge Case | Handling |
|-----------|----------|
| Access token expired, refresh token valid | ✅ Auto-refresh works, user sees no error |
| Both tokens expired (user away for 1+ hour) | ❌ Refresh fails → Redirect to login → Order preserved in DB, user can retry from order history |
| Refresh token expires during payment | ⚠️ Edge case (very rare) → User sees login page → Order remains pending, user can log in and retry |
| Network failure during token refresh | ❌ Refresh fails → Show error → User can retry payment (order and pg_token state lost, but order still exists) |

**Rationale**:
- **Seamless UX**: User doesn't see login page if refresh token is valid
- **Order preservation**: Even if session expires, order remains in database with "pending" status
- **Security maintained**: Refresh token has longer TTL (7 days) but eventually expires
- **Existing infrastructure**: Token refresh already implemented for cart/orders, works for payment too

**Alternatives Considered**:

1. **Extend JWT TTL to 2+ hours**
   - ❌ Rejected: Security risk (longer-lived tokens more dangerous if leaked)
   - ❌ Rejected: Doesn't solve problem (user could still take longer)

2. **No Token Refresh, Force Re-login**
   - ❌ Rejected: Poor UX (user completes payment, then sees login page)
   - ❌ Rejected: Confusing (payment succeeded on Kakao Pay side, but frontend shows error)

3. **Stateless Token with Refresh on Every Request**
   - ❌ Rejected: Excessive backend load (refresh API call on every request)
   - ❌ Rejected: Current approach is more efficient (refresh only when needed)

---

### 4.3 Retry Strategies

#### Decision: Tiered Retry with Clear User Communication

**Retry Matrix**:

| Scenario | Auto-Retry | User Action | Backend Idempotency |
|----------|-----------|-------------|---------------------|
| Network timeout (initiation) | ✅ 3× with backoff | Manual retry button | N/A (no state change) |
| Network timeout (approval) | ✅ 3× with backoff | Manual retry + support contact | ✅ Backend checks order status |
| Insufficient funds | ❌ No retry | Show error, redirect to payment page | N/A |
| Order not found | ❌ No retry | Show error, redirect to orders | N/A |
| Payment already processed | ❌ No retry | Redirect to order history | ✅ Backend returns 409 |
| Token expired | ❌ No retry | Show error, restart payment flow | N/A |
| Kakao Pay API error | ✅ 3× with backoff | Manual retry + support contact | ✅ Backend validates TID |

**Retry Implementation**:

```typescript
// Automatic Retry (React Query)
export function useInitiateKakaoPay() {
  return useMutation({
    mutationFn: (request: PaymentReadyRequest) =>
      paymentService.initiateKakaoPay(request),

    retry: (failureCount, error) => {
      // ✅ Only retry network/server errors, not business errors
      if (error instanceof ApiError) {
        // Don't retry 4xx errors (client/business errors)
        if (error.statusCode >= 400 && error.statusCode < 500) {
          return false;
        }
        // Retry 5xx errors up to 3 times
        return failureCount < 3;
      }
      // Retry network errors
      if (error instanceof NetworkError) {
        return failureCount < 3;
      }
      return false;
    },

    retryDelay: (attemptIndex) => {
      // Exponential backoff: 1s, 2s, 4s
      return Math.min(1000 * 2 ** attemptIndex, 10000);
    },
  });
}

// Manual Retry (User Button)
export default function PaymentFailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('order_id');

  return (
    <div>
      <h2>결제 실패</h2>
      <p>{searchParams.get('error_msg') || '결제에 실패했습니다'}</p>

      <div className="actions">
        {/* ✅ User can manually retry */}
        {orderId && (
          <Button
            variant="primary"
            onClick={() => navigate(`/payment/${orderId}`)}
          >
            다시 결제하기
          </Button>
        )}

        {/* ✅ Alternative: Contact support */}
        <Button
          variant="ghost"
          onClick={() => navigate('/support')}
        >
          고객센터 문의
        </Button>
      </div>
    </div>
  );
}
```

**User Communication**:

```typescript
// src/components/ErrorAlert.tsx

interface ErrorAlertProps {
  error: Error;
  failureCount?: number;
  onRetry?: () => void;
}

export default function ErrorAlert({ error, failureCount = 0, onRetry }: ErrorAlertProps) {
  // Determine message based on error type
  let message = error.message;
  let showRetry = false;
  let showSupport = false;

  if (error instanceof NetworkError) {
    message = '네트워크 연결을 확인해주세요.';
    showRetry = true;
  } else if (error instanceof ApiError) {
    if (error.statusCode >= 500) {
      message = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      showRetry = true;
      showSupport = failureCount >= 3; // Show support after 3 retries
    } else if (error.statusCode === 409) {
      message = '이미 처리된 결제입니다.';
      showRetry = false; // No retry for business errors
    }
  }

  return (
    <div className="alert alert-error">
      <AlertCircle className="w-5 h-5" />
      <div>
        <p>{message}</p>
        {failureCount > 0 && (
          <p className="text-xs mt-1">재시도 횟수: {failureCount}/3</p>
        )}
      </div>
      {showRetry && onRetry && (
        <Button size="sm" onClick={onRetry}>
          다시 시도
        </Button>
      )}
      {showSupport && (
        <Button size="sm" variant="ghost" onClick={() => navigate('/support')}>
          고객센터
        </Button>
      )}
    </div>
  );
}
```

**Rationale**:
- **Smart retry**: Only retry errors that are likely transient (network, server errors)
- **Exponential backoff**: Prevents thundering herd problem
- **User transparency**: Show retry count, clear next steps
- **Backend safety**: Idempotency ensures retries don't cause duplicate payments

**Alternatives Considered**:

1. **Retry All Errors**
   - ❌ Rejected: Would retry business errors (e.g., insufficient funds) forever
   - ❌ Rejected: Poor UX (user knows their card is declined, retry won't help)

2. **No Automatic Retry**
   - ❌ Rejected: Poor UX (user has to manually retry transient network errors)
   - ❌ Rejected: Most network errors resolve within 1-2 retries

3. **Infinite Retries with Circuit Breaker**
   - ❌ Rejected: Over-engineered for MVP (YAGNI)
   - ✅ Consider for scale: If backend stability issues, circuit breaker could help

---

## 5. Testing Strategies

### 5.1 MSW Mock Patterns for Payment Webhooks

#### Decision: Realistic Mock with State Machine Pattern

**Mock Database State**:

```typescript
// src/mocks/utils/paymentDB.ts

interface MockPayment {
  order_id: number;
  tid: string;
  aid: string | null;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  pg_token: string | null;
  created_at: string;
  approved_at: string | null;
}

class PaymentMockDB {
  private payments: Map<number, MockPayment> = new Map();

  /**
   * Initiate payment (called by /ready handler)
   */
  initiate(orderId: number): MockPayment {
    const tid = `T${Date.now()}${Math.random().toString(36).slice(2, 9)}`;
    const pgToken = `pg_${Math.random().toString(36).slice(2, 12)}`;

    const payment: MockPayment = {
      order_id: orderId,
      tid,
      aid: null,
      status: 'pending',
      pg_token: pgToken,
      created_at: new Date().toISOString(),
      approved_at: null,
    };

    this.payments.set(orderId, payment);
    return payment;
  }

  /**
   * Approve payment (called by /success handler)
   */
  approve(orderId: number, pgToken: string): MockPayment {
    const payment = this.payments.get(orderId);

    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.status === 'completed') {
      throw new Error('Payment already completed');
    }

    if (payment.pg_token !== pgToken) {
      throw new Error('Invalid pg_token');
    }

    // Update to completed
    payment.aid = `A${Date.now()}${Math.random().toString(36).slice(2, 9)}`;
    payment.status = 'completed';
    payment.approved_at = new Date().toISOString();
    payment.pg_token = null; // Consume token

    return payment;
  }

  get(orderId: number): MockPayment | undefined {
    return this.payments.get(orderId);
  }

  reset(): void {
    this.payments.clear();
  }
}

export const paymentDB = new PaymentMockDB();
```

**MSW Handlers**:

```typescript
// src/mocks/handlers/payment.ts

import { http, HttpResponse } from 'msw';
import { paymentDB } from '../utils/paymentDB';
import { mockDB } from '../utils/db';

export const paymentHandlers = [
  // 1. Initiate payment
  http.post('/api/v1/payments/kakao/ready', async ({ request }) => {
    const body = await request.json();
    const { order_id } = body;

    // Validate order exists
    const order = mockDB.orders.get(order_id);
    if (!order) {
      return HttpResponse.json(
        { error: '주문을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    // Check if payment already initiated
    const existingPayment = paymentDB.get(order_id);
    if (existingPayment && existingPayment.status === 'completed') {
      return HttpResponse.json(
        { error: '이미 결제가 완료된 주문입니다' },
        { status: 409 }
      );
    }

    // Create new payment
    const payment = paymentDB.initiate(order_id);

    // Return Kakao Pay mock URLs
    return HttpResponse.json({
      message: 'Payment initiated successfully',
      data: {
        tid: payment.tid,
        next_redirect_pc_url: `http://localhost:5173/mock-kakaopay?order_id=${order_id}&pg_token=${payment.pg_token}`,
        next_redirect_mobile_url: `http://localhost:5173/mock-kakaopay?order_id=${order_id}&pg_token=${payment.pg_token}`,
        next_redirect_app_url: 'kakaotalk://kakaopay/pg',
        android_app_scheme: 'kakaotalk://kakaopay/pg',
        ios_app_scheme: 'kakaotalk://kakaopay/pg',
      },
    });
  }),

  // 2. Payment success (approval)
  http.get('/api/v1/payments/kakao/success', ({ request }) => {
    const url = new URL(request.url);
    const orderId = parseInt(url.searchParams.get('order_id') || '0');
    const pgToken = url.searchParams.get('pg_token') || '';

    try {
      // Approve payment (validates token, checks status)
      const payment = paymentDB.approve(orderId, pgToken);

      // Update order in mock DB
      const order = mockDB.orders.get(orderId);
      if (order) {
        order.payment_status = 'completed';
        order.payment_tid = payment.tid;
        order.payment_aid = payment.aid;
        order.payment_approved_at = payment.approved_at;
      }

      return HttpResponse.json({
        message: 'Payment completed successfully',
        data: {
          order_id: orderId,
          aid: payment.aid,
          tid: payment.tid,
          total_amount: order?.total_amount || 0,
          payment_method: Math.random() > 0.5 ? 'CARD' : 'MONEY',
          approved_at: payment.approved_at,
        },
      });
    } catch (error) {
      return HttpResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
  }),

  // 3. Payment failure
  http.get('/api/v1/payments/kakao/fail', ({ request }) => {
    const url = new URL(request.url);
    const orderId = url.searchParams.get('order_id');
    const errorMsg = url.searchParams.get('error_msg') || '결제에 실패했습니다';

    return HttpResponse.json({
      message: 'Payment failed',
      error: errorMsg,
    });
  }),

  // 4. Payment cancellation
  http.get('/api/v1/payments/kakao/cancel', ({ request }) => {
    const url = new URL(request.url);
    const orderId = url.searchParams.get('order_id');

    return HttpResponse.json({
      message: 'Payment cancelled by user',
    });
  }),

  // 5. Get payment status
  http.get('/api/v1/payments/kakao/status/:orderId', ({ params }) => {
    const orderId = parseInt(params.orderId as string);
    const payment = paymentDB.get(orderId);

    if (!payment) {
      return HttpResponse.json(
        { error: '결제 정보를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      message: 'Payment status retrieved successfully',
      data: {
        order_id: payment.order_id,
        payment_status: payment.status,
        payment_provider: 'kakaopay',
        payment_tid: payment.tid,
        payment_aid: payment.aid,
        payment_approved_at: payment.approved_at,
        total_amount: mockDB.orders.get(orderId)?.total_amount || 0,
      },
    });
  }),
];
```

**Mock Kakao Pay Page**:

```typescript
// src/pages/MockKakaoPayPage.tsx (Development only)

export default function MockKakaoPayPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');
  const pgToken = searchParams.get('pg_token');

  const handleSuccess = () => {
    window.location.href = `/payment/success?order_id=${orderId}&pg_token=${pgToken}`;
  };

  const handleFail = () => {
    window.location.href = `/payment/fail?order_id=${orderId}&error_msg=잔액이 부족합니다`;
  };

  const handleCancel = () => {
    window.location.href = `/payment/cancel?order_id=${orderId}`;
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">카카오페이 결제 (테스트 모드)</h2>
          <p className="text-sm text-base-content/70">
            이 페이지는 개발 환경에서만 표시됩니다
          </p>

          <div className="divider">주문 정보</div>
          <p>주문번호: {orderId}</p>
          <p className="text-xs font-mono">토큰: {pgToken?.slice(0, 20)}...</p>

          <div className="divider">결제 시뮬레이션</div>
          <div className="card-actions flex-col w-full gap-2">
            <Button
              variant="primary"
              onClick={handleSuccess}
              className="w-full"
            >
              결제 성공
            </Button>
            <Button
              variant="error"
              onClick={handleFail}
              className="w-full"
            >
              결제 실패 (잔액 부족)
            </Button>
            <Button
              variant="ghost"
              onClick={handleCancel}
              className="w-full"
            >
              결제 취소
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Rationale**:
- **Realistic flow**: Mimics actual Kakao Pay redirect + approval flow
- **Stateful mocks**: PaymentDB tracks payment lifecycle (pending → completed)
- **Error scenarios**: Can test token validation, duplicate payments, etc.
- **Developer-friendly**: Visual mock page for manual testing

**Alternatives Considered**:

1. **Simple Static Responses**
   - ❌ Rejected: Doesn't test state transitions (pending → completed)
   - ❌ Rejected: Can't test idempotency (duplicate approval rejection)

2. **Record/Replay from Real API**
   - ❌ Rejected: Requires real Kakao Pay API access in development
   - ❌ Rejected: Can't test error scenarios (insufficient funds, etc.)

---

### 5.2 Test Data Generation

#### Decision: Factory Pattern with Realistic Data

**Test Factories**:

```typescript
// src/mocks/factories/payment.factory.ts

export const paymentFactory = {
  /**
   * Generate mock payment ready response
   */
  readyResponse(orderId: number): PaymentReadyResponse {
    const tid = `T${Date.now()}${Math.random().toString(36).slice(2, 9)}`;
    const pgToken = `pg_${Math.random().toString(36).slice(2, 12)}`;

    return {
      message: 'Payment initiated successfully',
      data: {
        tid,
        next_redirect_pc_url: `http://localhost:5173/mock-kakaopay?order_id=${orderId}&pg_token=${pgToken}`,
        next_redirect_mobile_url: `http://localhost:5173/mock-kakaopay?order_id=${orderId}&pg_token=${pgToken}`,
        next_redirect_app_url: 'kakaotalk://kakaopay/pg',
        android_app_scheme: 'kakaotalk://kakaopay/pg',
        ios_app_scheme: 'kakaotalk://kakaopay/pg',
      },
    };
  },

  /**
   * Generate mock payment approval response
   */
  approvalResponse(orderId: number, amount: number): PaymentApprovalResponse {
    return {
      message: 'Payment completed successfully',
      data: {
        order_id: orderId,
        aid: `A${Date.now()}${Math.random().toString(36).slice(2, 9)}`,
        tid: `T${Date.now()}${Math.random().toString(36).slice(2, 9)}`,
        total_amount: amount,
        payment_method: Math.random() > 0.5 ? 'CARD' : 'MONEY',
        approved_at: new Date().toISOString(),
      },
    };
  },

  /**
   * Generate mock payment status response
   */
  statusResponse(
    orderId: number,
    status: 'pending' | 'completed' | 'failed' | 'refunded'
  ): PaymentStatusResponse {
    return {
      message: 'Payment status retrieved',
      data: {
        order_id: orderId,
        payment_status: status,
        payment_provider: status === 'pending' ? undefined : 'kakaopay',
        payment_tid: status === 'pending' ? undefined : `T${Date.now()}`,
        payment_aid: status === 'completed' ? `A${Date.now()}` : undefined,
        payment_approved_at: status === 'completed' ? new Date().toISOString() : null,
        total_amount: 50000,
      },
    };
  },
};
```

**Usage in Tests**:

```typescript
// tests/integration/payment-flow.test.tsx

describe('Payment Flow', () => {
  beforeEach(() => {
    paymentDB.reset();
    mockDB.reset();
  });

  it('should complete full payment flow', async () => {
    // 1. Create test order
    const order = mockDB.createOrder({
      user_id: 1,
      total_amount: 50000,
      payment_status: 'pending',
    });

    // 2. Initiate payment
    const { user } = renderWithProviders(<PaymentPage />, {
      route: `/payment/${order.id}`,
    });

    const payButton = screen.getByRole('button', { name: /카카오페이 결제/i });
    await user.click(payButton);

    // 3. Should redirect to mock Kakao Pay page
    await waitFor(() => {
      expect(window.location.href).toContain('/mock-kakaopay');
    });

    // 4. Simulate payment success
    const payment = paymentDB.get(order.id);
    const successUrl = `/payment/success?order_id=${order.id}&pg_token=${payment.pg_token}`;
    window.location.href = successUrl;

    // 5. Verify approval
    await waitFor(() => {
      expect(screen.getByText(/결제 완료/i)).toBeInTheDocument();
      expect(screen.getByText(`#${order.id}`)).toBeInTheDocument();
    });

    // 6. Verify order updated
    const updatedOrder = mockDB.orders.get(order.id);
    expect(updatedOrder.payment_status).toBe('completed');
  });

  it('should handle duplicate approval attempts', async () => {
    const order = mockDB.createOrder({ user_id: 1, total_amount: 50000 });
    const payment = paymentDB.initiate(order.id);

    // First approval - should succeed
    const approval1 = paymentDB.approve(order.id, payment.pg_token!);
    expect(approval1.status).toBe('completed');

    // Second approval - should throw error
    expect(() => {
      paymentDB.approve(order.id, payment.pg_token!);
    }).toThrow('Payment already completed');
  });
});
```

**Rationale**:
- **Factory pattern**: Centralized test data generation (DRY)
- **Realistic IDs**: Use timestamps + random strings (mimics real Kakao Pay responses)
- **Flexible**: Factories can generate success, error, and edge case scenarios
- **Type-safe**: Factories return Zod-validated types

---

### 5.3 Test Coverage Requirements

#### Decision: 80% Coverage with Focus on Critical Paths

**Coverage Targets**:

| Module | Target Coverage | Critical Paths |
|--------|----------------|----------------|
| Payment Service | 95%+ | All API calls, Zod validation, error handling |
| Payment Hooks | 90%+ | Mutation success/error, query invalidation |
| Payment Pages | 80%+ | User interactions, redirects, error states |
| Payment Utils | 100% | Device detection, URL generation |
| MSW Handlers | 75%+ | Success flow, common errors |

**Critical Test Scenarios** (must be covered):

```typescript
// tests/payment/critical-paths.test.tsx

describe('Payment Critical Paths', () => {
  // 1. Happy path
  it('✅ should complete payment successfully', async () => {
    // Order creation → Payment initiation → Redirect → Approval → Success page
  });

  // 2. Duplicate payment prevention
  it('✅ should prevent duplicate payment for same order', async () => {
    // Initiate payment → Complete payment → Try to initiate again → Should redirect
  });

  // 3. Session expiration during payment
  it('✅ should handle token refresh during payment approval', async () => {
    // Initiate → Token expires → Approval returns 401 → Auto-refresh → Retry succeeds
  });

  // 4. Network error with retry
  it('✅ should retry payment initiation on network error', async () => {
    // Initiate → Network error → Auto-retry 3× → Success
  });

  // 5. Payment cancellation
  it('✅ should allow user to cancel payment and retry', async () => {
    // Initiate → Cancel → Return to site → Click "retry" → Redirect again
  });

  // 6. Mobile vs desktop redirect
  it('✅ should use mobile URL on mobile device', async () => {
    // Mock mobile user agent → Initiate → Should redirect to mobile URL
  });

  // 7. Invalid pg_token
  it('✅ should handle invalid pg_token gracefully', async () => {
    // Success callback with wrong token → Backend rejects → Error page
  });

  // 8. Order not found
  it('✅ should handle order not found error', async () => {
    // Initiate payment with invalid order ID → 404 error → Error page
  });

  // 9. Insufficient funds (Kakao Pay error)
  it('✅ should display Kakao Pay error message', async () => {
    // Fail callback → Show error message → Allow retry
  });

  // 10. Payment status display
  it('✅ should show correct payment status badge', async () => {
    // Order with completed payment → Badge shows "결제완료" → Correct color
  });
});
```

**Coverage Commands**:

```bash
# Run tests with coverage
npm test -- --coverage

# Coverage thresholds (vitest.config.ts)
{
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80,
      exclude: [
        'src/mocks/**',
        'src/**/*.test.{ts,tsx}',
        'src/**/types.ts',
      ],
    },
  },
}
```

**Rationale**:
- **80% overall target**: Balances thoroughness with pragmatism (YAGNI for 100%)
- **Higher for service layer**: Business logic and API calls are most critical
- **Lower for UI**: Some UI states are hard to test (browser redirects, full-page navigation)
- **Critical path focus**: Ensures all user-facing flows work

**Alternatives Considered**:

1. **100% Coverage Requirement**
   - ❌ Rejected: Leads to testing implementation details (poor ROI)
   - ❌ Rejected: Slows development for marginal benefit

2. **No Coverage Requirement**
   - ❌ Rejected: Payment is critical path, must be thoroughly tested
   - ❌ Rejected: Easy to miss edge cases without coverage metrics

---

## 6. Implementation Roadmap

### 6.1 Task Breakdown (Dependency-Ordered)

**Phase 1: Foundation (Backend-Ready)**
- ✅ Backend API fully implemented
- ✅ Kakao Pay merchant account configured
- ✅ Callback URLs registered in Kakao Pay dashboard

**Phase 2: Frontend Core (3-4 days)**

```
Day 1: Schema & Service Layer
├── Create payment.ts schema (Zod validation)
├── Update orders.ts schema (add payment fields)
├── Create payment service (API calls)
└── Add payment endpoints to api.ts constants

Day 2: React Query Hooks & State
├── Create usePaymentQueries.ts (hooks)
├── Add query keys factory
├── Implement cache invalidation
└── Add device detection utility

Day 3: Payment Pages (UI)
├── Create PaymentPage.tsx (initiation)
├── Create PaymentSuccessPage.tsx (approval)
├── Create PaymentFailPage.tsx (error handling)
├── Create PaymentCancelPage.tsx (user cancellation)
└── Update routing (App.tsx)

Day 4: Order Integration
├── Update OrderPage.tsx (redirect to payment)
├── Update MyPage.tsx (display payment status)
├── Create PaymentStatusBadge component
└── Update OrderCard component (show payment details)
```

**Phase 3: Testing (2-3 days)**

```
Day 5: MSW Mocks
├── Create payment handlers (MSW)
├── Create payment mock DB (stateful)
├── Create mock Kakao Pay page
└── Add test factories

Day 6: Unit Tests
├── Payment service tests (15+ cases)
├── Payment hooks tests (10+ cases)
├── Device detection tests (5+ cases)
└── Schema validation tests (10+ cases)

Day 7: Integration Tests
├── Full payment flow test (happy path)
├── Error scenario tests (5+ scenarios)
├── Token refresh during payment test
├── Duplicate payment prevention test
└── Mobile/desktop redirect tests
```

**Phase 4: QA & Documentation (1-2 days)**

```
Day 8: Manual Testing
├── Test on real devices (iOS, Android, Desktop)
├── Test all error scenarios
├── Test network conditions (slow, offline)
└── Verify HTTPS in staging

Day 9: Documentation
├── Update CLAUDE.md with payment patterns
├── Create user-facing payment FAQ
├── Document error codes and troubleshooting
└── Update deployment checklist
```

**Total Estimate**: 6-9 days (1.5-2 weeks)

---

### 6.2 Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Kakao Pay API changes | High | Use backend abstraction layer (backend handles API, frontend only sees our API) |
| pg_token expiration issues | Medium | Clear user messaging ("결제 시간 만료"), allow restart |
| Session expiration during payment | Medium | Already mitigated (automatic token refresh) |
| Mobile redirect not working | Medium | Thorough user-agent testing, fallback to PC URL |
| Duplicate payments | High | Multi-layer prevention (frontend, React Query, backend DB lock) |
| Network timeout | Medium | Retry with exponential backoff, clear error messages |
| Payment webhook missed | Low | Backend idempotency ensures recovery (user can retry) |

---

### 6.3 Success Criteria

**MVP Complete When**:
- ✅ User can complete payment from order creation to success page
- ✅ All error scenarios display user-friendly messages
- ✅ Mobile and desktop redirect to appropriate URLs
- ✅ Payment status displays correctly in order history
- ✅ Duplicate payments prevented at all layers
- ✅ Session expiration handled seamlessly
- ✅ 80%+ test coverage on critical paths
- ✅ All manual test cases pass
- ✅ Payment works in staging environment (with HTTPS)

**Post-MVP Enhancements** (out of scope):
- Payment refund UI (backend already supports)
- Payment history page (separate from order history)
- PWA deep linking
- Payment analytics dashboard
- Internationalization (English support)
- Other payment gateways (Toss, Naver Pay)

---

## Summary of Key Decisions

| Topic | Decision | Rationale |
|-------|----------|-----------|
| **API Integration** | Server-coordinated redirect pattern | Security (credentials never in frontend) + Backend control |
| **pg_token Handling** | Single-use, backend-only approval | Minimizes security risk + Prevents replay attacks |
| **Error Recovery** | Multi-tiered with user-friendly messages | Clear user guidance + Automatic retry where appropriate |
| **State Management** | React Query with long stale time (10min) | Payment status rarely changes + Reduces backend load |
| **Duplicate Prevention** | Button disable + React Query + Backend lock | Layered defense (frontend UX + backend integrity) |
| **Device Detection** | User-agent regex | Simple, reliable, zero dependencies |
| **Mobile Support** | Mobile URL redirect (defer PWA deep linking) | MVP priority (web works for 90% of users) |
| **Timeout Handling** | 10s Axios + 3 retries + 15min pg_token TTL | Fast feedback + Handles transient errors |
| **Session Expiration** | Automatic token refresh | Seamless UX + Order preserved |
| **Retry Strategy** | Conditional auto-retry + manual button | Smart retry (only transient errors) + User control |
| **Testing** | MSW with stateful mocks + 80% coverage | Realistic testing + Focus on critical paths |

---

**Created by**: Claude
**Last Updated**: 2025-01-19
**Version**: 1.0.0
