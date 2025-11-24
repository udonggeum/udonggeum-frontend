# Kakao Pay Integration: Developer Quickstart

**Feature Branch**: `feat-kakao-pay`
**Target Audience**: Frontend developers implementing Kakao Pay payment flow
**Estimated Time**: 2-3 hours to complete

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Step-by-Step Payment Flow](#step-by-step-payment-flow)
4. [Testing Your Implementation](#testing-your-implementation)
5. [Common Issues](#common-issues)
6. [Next Steps](#next-steps)

---

## Prerequisites

Before starting, ensure you have:

### Required
- ✅ Node.js 20+ installed
- ✅ Project dependencies installed: `npm install`
- ✅ Backend server running on `http://localhost:8080`
- ✅ Backend Kakao Pay endpoints implemented (check with backend team)

### Recommended
- ✅ VSCode with TypeScript extension
- ✅ React DevTools browser extension
- ✅ TanStack Query DevTools enabled (already in project)

### Optional
- 🔧 Postman or similar for API testing
- 🔧 Browser with mobile device emulation (Chrome DevTools)

---

## Local Development Setup

### Step 1: Start Development Server

```bash
# Terminal 1: Start backend (check with backend team)
cd ../udonggeum-backend
go run main.go

# Terminal 2: Start frontend
cd udonggeum-frontend
npm run dev
```

Your app should now be running at `http://localhost:5173`

### Step 2: Verify MSW is Initialized

MSW (Mock Service Worker) provides realistic API mocks for development.

**Check browser console** after starting dev server:
```
[MSW] Mocking enabled.
```

If you see this, you're good to go! If not:
```bash
# Re-initialize MSW
npx msw init public --save
```

### Step 3: Create Test User and Order

1. **Register a test account**:
   - Navigate to `http://localhost:5173/register`
   - Email: `test@test.com`
   - Password: `password123`
   - Name: `테스트 유저`

2. **Create a test order**:
   - Add products to cart
   - Navigate to `/order`
   - Fill in shipping details:
     - Address: `서울시 강남구 테헤란로 231`
     - Phone: `010-1234-5678`
   - Click "결제하기"

You should now be on `/payment/:orderId` page.

---

## Step-by-Step Payment Flow

Let's walk through a complete payment flow with code examples.

### Step 1: Payment Initiation Page

**File**: `src/pages/PaymentPage.tsx`

**What happens**:
1. User lands on `/payment/123` after creating order
2. Page fetches order details
3. Page checks payment status (prevent duplicate payments)
4. User clicks "카카오페이 결제" button
5. Frontend calls `POST /api/v1/payments/kakao/ready`
6. Backend returns TID + redirect URLs
7. Frontend redirects to Kakao Pay

**Try it**:
1. Navigate to payment page (should happen automatically after order creation)
2. Verify order summary displays correctly
3. Click "카카오페이 결제" button
4. You should be redirected to mock Kakao Pay page

**Expected UI**:
```
┌─────────────────────────────────────┐
│  결제하기                           │
├─────────────────────────────────────┤
│  주문 정보                          │
│  주문번호: #123                     │
│  상품 수량: 2개 상품                │
│  배송 방식: 배송                    │
│  배송지: 서울시 강남구 테헤란로...  │
│                                     │
│  결제 금액                          │
│  총 결제 금액: 50,000원             │
├─────────────────────────────────────┤
│  [취소]  [카카오페이 결제]          │
└─────────────────────────────────────┘
```

**Debug Tips**:
- Open React Query DevTools (bottom right icon)
- Check `['orders', 'detail', 123]` query
- Check `['payments', 'status', 123]` query
- Network tab: Verify `POST /api/v1/payments/kakao/ready` succeeds

---

### Step 2: Mock Kakao Pay Page

**File**: `src/pages/MockKakaoPayPage.tsx` (development only)

**What happens**:
1. User lands on `/mock-kakaopay?order_id=123&pg_token=abc...`
2. Page displays order info and simulated payment options
3. User chooses success/fail/cancel

**Try it**:
1. You should automatically be redirected here after Step 1
2. Verify order_id and pg_token appear in URL
3. Click **"결제 성공"** button

**Expected UI**:
```
┌─────────────────────────────────────┐
│  카카오페이 결제 (테스트 모드)     │
├─────────────────────────────────────┤
│  주문 정보                          │
│  주문번호: 123                      │
│  토큰: pg_abc123def456...           │
│                                     │
│  결제 시뮬레이션                    │
│  [결제 성공]                        │
│  [결제 실패 (잔액 부족)]            │
│  [결제 취소]                        │
└─────────────────────────────────────┘
```

**Note**: In production, this page doesn't exist. Users will see real Kakao Pay UI.

---

### Step 3: Payment Success Page

**File**: `src/pages/PaymentSuccessPage.tsx`

**What happens**:
1. Mock Kakao Pay redirects to `/payment/success?order_id=123&pg_token=abc...`
2. Page automatically calls `GET /api/v1/payments/kakao/success` with params
3. Backend approves payment (calls Kakao Pay /approve API)
4. Backend returns approval data (AID, TID, timestamp)
5. Page displays success message + payment details
6. React Query cache invalidates orders list

**Try it**:
1. Click "결제 성공" on mock page
2. Wait for loading spinner
3. Success page should display with payment details

**Expected UI**:
```
┌─────────────────────────────────────┐
│  ✓ 결제 완료!                       │
│  결제가 성공적으로 완료되었습니다   │
├─────────────────────────────────────┤
│  결제 정보                          │
│  주문번호: #123                     │
│  결제 수단: 카카오머니              │
│  결제 금액: 50,000원                │
│  거래번호: T91ca901315e2b03efcd     │
│  승인시간: 2025-01-19 14:30:00      │
├─────────────────────────────────────┤
│  [주문 내역]  [쇼핑 계속하기]       │
└─────────────────────────────────────┘
```

**Debug Tips**:
- Check URL params: `order_id` and `pg_token` should be present
- Network tab: `GET /api/v1/payments/kakao/success?order_id=123&pg_token=...`
- Response should have AID, TID, payment_method
- React Query DevTools: Check query invalidation

**Verify**:
```bash
# Check if order was updated in MSW mock DB
# Open browser console and type:
mockDB.orders.get(123)

# Should show:
{
  id: 123,
  payment_status: "completed",
  payment_tid: "T...",
  payment_aid: "A...",
  payment_approved_at: "2025-01-19T14:30:00Z"
}
```

---

### Step 4: View Order History

**File**: `src/pages/MyPage.tsx`

**What happens**:
1. Navigate to `/mypage`
2. Orders list displays
3. Completed order shows "결제완료" badge
4. Payment details (TID, timestamp) displayed

**Try it**:
1. Navigate to `/mypage` or click "주문 내역" button
2. Find your test order (order #123)
3. Verify payment status badge shows green "결제완료"

**Expected UI**:
```
┌─────────────────────────────────────┐
│  주문 내역                          │
├─────────────────────────────────────┤
│  주문 #123            [결제완료]    │
│  상품 2개 · 50,000원                │
│  결제 시간: 2025-01-19 14:30        │
│  거래번호: T91ca901315e2b03efcd     │
└─────────────────────────────────────┘
```

---

### Step 5: Test Error Scenarios

#### Scenario A: Payment Failure

1. Create new order
2. On mock Kakao Pay page, click **"결제 실패 (잔액 부족)"**
3. Should redirect to `/payment/fail?order_id=123&error_msg=...`
4. Error page displays with retry option

**Expected UI**:
```
┌─────────────────────────────────────┐
│  ✕ 결제 실패                        │
│  잔액이 부족합니다                  │
│                                     │
│  주문번호: #123                     │
│  주문은 유지되며, 다시 결제를       │
│  시도할 수 있습니다                 │
├─────────────────────────────────────┤
│  [주문 내역]  [다시 결제하기]       │
└─────────────────────────────────────┘
```

5. Click "다시 결제하기" → should return to `/payment/123`
6. Order status should still be "pending"

#### Scenario B: Payment Cancellation

1. Create new order
2. On mock Kakao Pay page, click **"결제 취소"**
3. Should redirect to `/payment/cancel?order_id=123`
4. Cancellation page displays with retry option

**Expected UI**:
```
┌─────────────────────────────────────┐
│  ⚠ 결제 취소                        │
│  결제가 취소되었습니다              │
│                                     │
│  주문번호: #123                     │
│  주문은 유지되며, 언제든지 다시     │
│  결제할 수 있습니다                 │
├─────────────────────────────────────┤
│  [주문 내역]  [다시 결제하기]       │
└─────────────────────────────────────┘
```

#### Scenario C: Duplicate Payment Attempt

1. Complete payment successfully (order status = "completed")
2. Navigate directly to `/payment/123` (via URL or order history)
3. Should automatically redirect to `/mypage`
4. Or show message: "이미 결제가 완료된 주문입니다"

**Debug**: Check `useEffect` in `PaymentPage.tsx`:
```typescript
useEffect(() => {
  if (paymentStatus?.data.payment_status === 'completed') {
    navigate('/mypage', { replace: true });
  }
}, [paymentStatus, navigate]);
```

---

## Testing Your Implementation

### Unit Testing

Run unit tests to verify schema validation and service layer:

```bash
# Run all tests
npm test

# Run payment-specific tests
npm test payment

# Run with coverage
npm test -- --coverage
```

**Key Test Files**:
- `src/services/__tests__/payment.test.ts` - API service tests
- `src/hooks/queries/__tests__/usePaymentQueries.test.tsx` - React Query hooks
- `src/schemas/__tests__/payment.test.ts` - Zod schema validation

**Expected Output**:
```
✓ src/services/payment.test.ts (15 tests)
  ✓ PaymentService > initiateKakaoPay
    ✓ should initiate payment successfully
    ✓ should throw error for invalid order ID
    ✓ should handle 409 conflict error
  ✓ PaymentService > handlePaymentSuccess
    ✓ should approve payment successfully
    ✓ should throw error for invalid pg_token
  ...

Tests: 42 passed (42 total)
```

---

### Integration Testing

Test the full flow with MSW mocks:

```bash
# Run integration tests
npm test integration/payment-flow.test.tsx
```

**What's Tested**:
1. User creates order
2. User clicks payment button
3. Redirect to Kakao Pay (mock)
4. Complete payment
5. Redirect to success page
6. Order status updates to "completed"

---

### Manual Testing Checklist

Copy this checklist and tick off as you test:

#### Happy Path
- [ ] Create order successfully
- [ ] Navigate to payment page
- [ ] Order details display correctly
- [ ] Click "카카오페이 결제" button
- [ ] Redirect to mock Kakao Pay page
- [ ] Click "결제 성공"
- [ ] Success page displays with correct data
- [ ] Navigate to order history
- [ ] Order shows "결제완료" badge
- [ ] Payment details (TID, timestamp) visible

#### Error Handling
- [ ] Test payment failure flow
- [ ] Verify error message displays
- [ ] Click "다시 결제하기" works
- [ ] Test payment cancellation flow
- [ ] Verify cancellation message
- [ ] Test duplicate payment prevention
- [ ] Try accessing `/payment/:id` for completed order
- [ ] Should redirect or show error

#### Mobile Testing
- [ ] Open Chrome DevTools → Toggle device toolbar
- [ ] Select iPhone 12 Pro or similar
- [ ] Complete payment flow on mobile viewport
- [ ] Verify mobile URL is used (check network tab)
- [ ] UI looks good on small screen

#### Edge Cases
- [ ] Test with invalid order ID (e.g., `/payment/99999`)
- [ ] Should show "Order not found" error
- [ ] Test with expired session (log out, try to access payment page)
- [ ] Should redirect to login
- [ ] Test network error (disconnect internet, click payment button)
- [ ] Should show network error + retry button

---

## Common Issues

### Issue 1: "MSW not initialized" in Console

**Symptom**: Payment API calls fail with network error

**Cause**: Service worker not registered

**Solution**:
```bash
# Re-initialize MSW
npx msw init public --save

# Restart dev server
npm run dev
```

---

### Issue 2: React Query Cache Not Updating

**Symptom**: Order still shows "pending" after successful payment

**Cause**: Query invalidation not working

**Solution**:
1. Open React Query DevTools
2. Check if `['orders', 'all']` query was invalidated
3. Verify `onSuccess` in `useHandlePaymentSuccess` hook:
```typescript
onSuccess: (data, variables) => {
  queryClient.invalidateQueries({ queryKey: ordersKeys.all });
  queryClient.invalidateQueries({ queryKey: paymentKeys.status(variables.orderId) });
}
```

---

### Issue 3: pg_token Missing in Success Callback

**Symptom**: Error "Missing required parameters" on success page

**Cause**: URL params not read correctly

**Solution**:
```typescript
// ✅ CORRECT
const [searchParams] = useSearchParams();
const pgToken = searchParams.get('pg_token');

// ❌ WRONG
const { pg_token } = useParams(); // This is for path params, not query params
```

---

### Issue 4: Infinite Redirect Loop

**Symptom**: Page keeps redirecting between payment and success

**Cause**: `useEffect` dependencies incorrect

**Solution**:
```typescript
// ✅ CORRECT
useEffect(() => {
  if (paymentStatus?.data.payment_status === 'completed') {
    navigate('/mypage', { replace: true }); // Use replace: true
  }
}, [paymentStatus?.data.payment_status, navigate]); // Correct dependencies

// ❌ WRONG
useEffect(() => {
  if (paymentStatus?.data.payment_status === 'completed') {
    navigate('/mypage'); // Missing replace: true
  }
}, [paymentStatus]); // Too broad dependency
```

---

### Issue 5: Mobile URL Not Used on Mobile Device

**Symptom**: Desktop URL used even on mobile

**Cause**: User agent detection not working

**Solution**:
```typescript
// Check your deviceDetection utility
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined' || !window.navigator) {
    return false;
  }

  const userAgent = window.navigator.userAgent.toLowerCase();
  const mobilePatterns = [
    /android/i,
    /iphone/i,
    /ipad/i,
    /mobile/i,
  ];

  return mobilePatterns.some((pattern) => pattern.test(userAgent));
}
```

**Test**:
```javascript
// In browser console
console.log(navigator.userAgent);
console.log(isMobileDevice()); // Should return true on mobile
```

---

### Issue 6: Zod Validation Error

**Symptom**: "Validation error: expected X, received Y"

**Cause**: Backend response doesn't match schema

**Solution**:
1. Check backend response in Network tab
2. Compare with Zod schema in `src/schemas/payment.ts`
3. Update schema if backend format changed:
```typescript
// Example: Backend returns payment_method as lowercase
export const PaymentApprovalDataSchema = z.object({
  payment_method: z.enum(['CARD', 'MONEY']) // Must match backend exactly
    .transform((val) => val.toUpperCase()), // Or transform to uppercase
});
```

---

## Next Steps

### Production Deployment

Before deploying to production:

1. **Environment Variables**:
   ```bash
   # .env.production
   VITE_API_BASE_URL=https://api.udonggeum.com
   ```

2. **Remove Mock Kakao Pay Page**:
   - Delete `src/pages/MockKakaoPayPage.tsx`
   - Remove route from `App.tsx`

3. **Update Callback URLs**:
   - Register production URLs in Kakao Pay dashboard:
     - Success: `https://api.udonggeum.com/api/v1/payments/kakao/success`
     - Fail: `https://api.udonggeum.com/api/v1/payments/kakao/fail`
     - Cancel: `https://api.udonggeum.com/api/v1/payments/kakao/cancel`

4. **HTTPS Required**:
   - Ensure production domain has valid SSL certificate
   - Kakao Pay rejects non-HTTPS callbacks in production

5. **Test with Real Kakao Pay**:
   - Use Kakao Pay test mode (check backend configuration)
   - Complete at least 3 successful test payments
   - Test failure scenarios (declined card, etc.)

---

### Additional Features (Post-MVP)

Once core payment works, consider:

- **Payment Refund UI**: Add admin page to refund orders
- **Payment History**: Separate page showing all payments
- **Receipt Download**: Generate PDF receipts
- **Email Notifications**: Send payment confirmation emails
- **Payment Analytics**: Track success rates, popular payment methods

---

## Quick Reference

### Key Files

```
src/
├── schemas/payment.ts          # Zod schemas + types
├── services/payment.ts         # API service layer
├── hooks/queries/
│   └── usePaymentQueries.ts    # React Query hooks
├── pages/
│   ├── PaymentPage.tsx         # Initiation page
│   ├── PaymentSuccessPage.tsx  # Success callback
│   ├── PaymentFailPage.tsx     # Failure page
│   └── PaymentCancelPage.tsx   # Cancellation page
└── mocks/handlers/payment.ts   # MSW handlers
```

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/payments/kakao/ready` | POST | Initiate payment |
| `/api/v1/payments/kakao/success` | GET | Handle success callback |
| `/api/v1/payments/kakao/fail` | GET | Handle failure callback |
| `/api/v1/payments/kakao/cancel` | GET | Handle cancellation |
| `/api/v1/payments/kakao/status/:id` | GET | Check payment status |
| `/api/v1/payments/kakao/:id/refund` | POST | Refund payment |

### React Query Keys

```typescript
paymentKeys.all                    // ['payments']
paymentKeys.status(123)            // ['payments', 'status', 123]
ordersKeys.all                     // ['orders']
ordersKeys.detail(123)             // ['orders', 'detail', 123]
```

---

## Getting Help

### Resources

- **Integration Guide**: `/docs/KAKAO_PAY_INTEGRATION.md` (comprehensive guide)
- **Feature Spec**: `/specs/001-kakao-pay/spec.md` (requirements)
- **Data Model**: `/specs/001-kakao-pay/data-model.md` (schemas)
- **API Contracts**: `/specs/001-kakao-pay/contracts/*.yaml` (OpenAPI specs)

### Support Channels

- **Frontend Issues**: Create issue in frontend repository
- **Backend Issues**: Ask backend team or create issue in backend repo
- **Kakao Pay Issues**: Check [Kakao Pay Developer Docs](https://developers.kakaopay.com/)

### Debug Checklist

When something goes wrong:

1. ✅ Check browser console for errors
2. ✅ Open React Query DevTools → Check query state
3. ✅ Network tab → Verify API calls succeed
4. ✅ Check MSW console logs (request/response)
5. ✅ Verify backend is running and healthy
6. ✅ Check Zod validation errors (schema mismatch)
7. ✅ Test in incognito mode (clear cache/cookies)

---

**Created by**: Claude
**Last Updated**: 2025-01-19
**Version**: 1.0.0

Happy coding! 🚀
