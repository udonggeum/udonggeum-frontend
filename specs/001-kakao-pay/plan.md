# Implementation Plan: Kakao Pay Payment Integration

**Branch**: `001-kakao-pay` | **Date**: 2025-01-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-kakao-pay/spec.md`

## Summary

Integrate Kakao Pay as the payment provider for the Udonggeum jewelry marketplace. Users will complete orders through a redirect-based payment flow where they are sent to Kakao Pay for payment authorization, then returned to the application with payment confirmation. The system must handle success, failure, and cancellation scenarios, display payment status in order history, and prevent duplicate payments.

**Technical Approach**: Implement schema-first payment service layer with Zod validation, create React Query hooks for payment mutations, build four new pages (payment initiation, success, failure, cancel), extend Order schema with payment fields, and integrate with existing cart/order flow. Use MSW for development mocking of Kakao Pay API.

## Technical Context

**Language/Version**: TypeScript 5.9 + React 19
**Primary Dependencies**: TanStack Query v5 (server state), Zustand v5 (client state), Zod v3 (validation), Axios (HTTP client), React Router v6 (routing), react-hook-form (forms)
**Storage**: localStorage via Zustand persist middleware (auth tokens), TanStack Query cache (API data)
**Testing**: Vitest + React Testing Library, MSW (Mock Service Worker) for API mocking
**Target Platform**: Web (SPA), modern browsers (Chrome 90+, Safari 14+, Firefox 88+), responsive mobile/desktop
**Project Type**: Web frontend (single React app with Vite)
**Performance Goals**:
- Payment flow completion <2 minutes
- Page transitions <1 second
- API response validation <100ms
- Payment status updates reflected within 3 seconds
**Constraints**:
- Browser redirect required (Kakao Pay limitation)
- localStorage for tokens (acceptable for MVP)
- Client-side validation only (backend handles business rules)
- Korean language UI only
**Scale/Scope**:
- 4 new pages (payment, success, failure, cancel)
- 1 new service module (payment.ts)
- 1 new schema file (payment.ts)
- 1 new hooks file (usePaymentQueries.ts)
- Update 2 existing schemas (orders.ts, index.ts)
- Update 2 existing components (OrderCard, OrderStatusBadge)
- Update 1 existing page (OrderPage redirect logic)
- 6 new API endpoints to integrate
- ~15 new tests (unit + integration)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Design Check (Phase 0)

| Principle | Requirement | Compliance | Notes |
|-----------|-------------|------------|-------|
| **I. Type Safety & Schema Validation** | Zod schemas before TypeScript types | ✅ PASS | Payment schemas will be defined in `schemas/payment.ts` before service layer |
| **I. Type Safety & Schema Validation** | API responses validated at service layer | ✅ PASS | `paymentService` methods will parse with Zod schemas |
| **I. Type Safety & Schema Validation** | No `any` types | ✅ PASS | All payment types derived from Zod schemas |
| **II. Component Testing Standards** | Tests for critical business logic | ✅ PASS | Tests required for payment service, hooks, and integration flows |
| **II. Component Testing Standards** | MSW for API mocking | ✅ PASS | MSW handlers for all 6 payment endpoints |
| **III. User Experience Consistency** | TailwindCSS + DaisyUI styling | ✅ PASS | Payment pages use DaisyUI cards, buttons, badges |
| **III. User Experience Consistency** | Loading states for async ops | ✅ PASS | Loading indicators during payment initiation and approval |
| **III. User Experience Consistency** | Korean error messages | ✅ PASS | All payment errors in Korean per spec |
| **IV. Performance Requirements** | Minimize re-renders | ✅ PASS | Zustand selectors, React Query caching |
| **IV. Performance Requirements** | Code splitting | ✅ PASS | Payment pages can be lazy-loaded |
| **V. State Management Separation** | TanStack Query for server state | ✅ PASS | All payment API calls through React Query |
| **V. State Management Separation** | Zustand for client state only | ✅ PASS | Only auth state from Zustand (already exists) |
| **Service Layer Pattern** | Pure services with Zod validation | ✅ PASS | `paymentService` class with Zod parsing |
| **Query Keys Factory Pattern** | Centralized query keys | ✅ PASS | `paymentKeys` factory in `usePaymentQueries.ts` |

**Result**: ✅ ALL GATES PASSED - No constitutional violations. Proceed to Phase 0.

### Post-Design Check (Phase 1)

| Principle | Requirement | Compliance | Notes |
|-----------|-------------|------------|-------|
| **I. Type Safety & Schema Validation** | Zod schemas implemented | ✅ PASS | All 8 payment schemas defined in data-model.md with Zod syntax |
| **I. Type Safety & Schema Validation** | Service layer validates responses | ✅ PASS | PaymentService class methods parse all responses with Zod |
| **I. Type Safety & Schema Validation** | No `any` types in design | ✅ PASS | All types derived from z.infer<typeof Schema> |
| **II. Component Testing Standards** | Test strategy documented | ✅ PASS | quickstart.md includes unit, integration, and manual test plans |
| **II. Component Testing Standards** | MSW patterns defined | ✅ PASS | quickstart.md documents MSW mock setup and test data factories |
| **III. User Experience Consistency** | UI components specified | ✅ PASS | Payment pages use DaisyUI (cards, buttons, badges, alerts) |
| **III. User Experience Consistency** | Korean error messages | ✅ PASS | All error responses in contracts include Korean messages |
| **III. User Experience Consistency** | Loading states designed | ✅ PASS | LoadingSpinner components in payment flow (quickstart.md) |
| **IV. Performance Requirements** | Cache strategy defined | ✅ PASS | React Query staleTime: 10min for payment status, 5min for orders |
| **IV. Performance Requirements** | Bundle impact estimated | ✅ PASS | ~150KB added (4 pages + service + hooks), within budget |
| **V. State Management Separation** | TanStack Query usage | ✅ PASS | All payment mutations and queries use React Query hooks |
| **V. State Management Separation** | No inappropriate Zustand use | ✅ PASS | No new Zustand stores; only existing useAuthStore accessed |
| **Service Layer Pattern** | Pure service class | ✅ PASS | PaymentService class with no React dependencies (data-model.md) |
| **Service Layer Pattern** | Zod validation in service | ✅ PASS | All service methods validate responses before returning |
| **Query Keys Factory Pattern** | paymentKeys factory | ✅ PASS | Hierarchical keys defined: paymentKeys.all, paymentKeys.status(id) |
| **API Contracts** | OpenAPI 3.0 compliance | ✅ PASS | 6 contract files follow OpenAPI 3.0 spec |
| **Code Organization** | Follows project structure | ✅ PASS | All files in established directories (schemas/, services/, hooks/, pages/) |

**Result**: ✅ ALL GATES PASSED - Design artifacts comply with all constitutional principles.

**Design Quality Highlights**:
- Complete Zod schema definitions with runtime validation
- Comprehensive error handling with Korean messages
- State machine diagram for payment lifecycle
- MSW mock patterns for development/testing
- Performance considerations (cache timing, bundle size)
- Developer-friendly documentation (quickstart guide)

## Project Structure

### Documentation (this feature)

```text
specs/001-kakao-pay/
├── spec.md                  # Feature specification (✅ COMPLETE)
├── plan.md                  # Implementation plan (✅ COMPLETE)
├── research.md              # Phase 0 research output (✅ COMPLETE)
├── data-model.md            # Phase 1 data model (✅ COMPLETE - 29KB)
├── quickstart.md            # Phase 1 developer guide (✅ COMPLETE - 20KB)
├── contracts/               # Phase 1 API contracts (✅ COMPLETE - 6 files)
│   ├── payment-ready.yaml       # POST /ready endpoint
│   ├── payment-success.yaml     # GET /success callback
│   ├── payment-fail.yaml        # GET /fail callback
│   ├── payment-cancel.yaml      # GET /cancel callback
│   ├── payment-status.yaml      # GET /status/:id endpoint
│   └── payment-refund.yaml      # POST /refund endpoint
├── checklists/
│   └── requirements.md      # Spec validation (✅ COMPLETE)
└── tasks.md                 # Phase 2 output (⏳ PENDING - use /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── api/
│   └── client.ts                     # EXISTING - Axios instance with interceptors
│
├── schemas/
│   ├── payment.ts                    # NEW - Payment schemas (PaymentReadyRequest, PaymentReadyResponse, etc.)
│   ├── orders.ts                     # UPDATE - Add payment fields to OrderSchema
│   └── index.ts                      # UPDATE - Export payment schemas
│
├── services/
│   ├── payment.ts                    # NEW - Payment service class (initiateKakaoPay, getPaymentStatus, etc.)
│   ├── orders.ts                     # EXISTING - Order service (no changes needed)
│   └── auth.ts                       # EXISTING - Auth service (no changes needed)
│
├── stores/
│   ├── useAuthStore.ts               # EXISTING - Auth state (no changes needed)
│   └── useUIStore.ts                 # EXISTING - UI state (no changes needed)
│
├── hooks/
│   └── queries/
│       ├── usePaymentQueries.ts      # NEW - Payment React Query hooks (paymentKeys, useInitiateKakaoPay, etc.)
│       ├── useOrdersQueries.ts       # EXISTING - Order hooks (will be invalidated by payment mutations)
│       └── useAuthQueries.ts         # EXISTING - Auth hooks (no changes needed)
│
├── pages/
│   ├── PaymentPage.tsx               # NEW - Payment initiation page (/payment/:orderId)
│   ├── PaymentSuccessPage.tsx        # NEW - Payment success callback (/payment/success)
│   ├── PaymentFailPage.tsx           # NEW - Payment failure callback (/payment/fail)
│   ├── PaymentCancelPage.tsx         # NEW - Payment cancel callback (/payment/cancel)
│   ├── OrderPage.tsx                 # UPDATE - Change redirect from /cart to /payment/:orderId
│   ├── MyPage.tsx                    # EXISTING - Order history (will show updated payment status)
│   └── [other pages]                 # EXISTING - No changes
│
├── components/
│   ├── OrderCard.tsx                 # UPDATE - Display payment status badge and TID
│   ├── OrderStatusBadge.tsx          # UPDATE - Handle payment status (결제대기/결제완료/결제실패/환불완료)
│   ├── Button.tsx                    # EXISTING - Reused in payment pages
│   ├── LoadingSpinner.tsx            # EXISTING - Reused in payment pages
│   └── ErrorAlert.tsx                # EXISTING - Reused for payment errors
│
├── constants/
│   ├── api.ts                        # UPDATE - Add PAYMENTS.KAKAO endpoints
│   └── errors.ts                     # EXISTING - Generic error messages (may add payment-specific)
│
├── utils/
│   ├── errors.ts                     # EXISTING - Custom error classes (ApiError, etc.)
│   └── apiLogger.ts                  # EXISTING - Request/response logging
│
├── mocks/
│   └── handlers/
│       ├── payment.ts                # NEW - MSW handlers for payment endpoints
│       ├── orders.ts                 # EXISTING - Order handlers (no changes needed)
│       └── auth.ts                   # EXISTING - Auth handlers (no changes needed)
│
└── App.tsx                           # UPDATE - Add payment routes

tests/
├── integration/
│   ├── payment-flow.test.tsx         # NEW - Full payment flow test
│   ├── payment-cancellation.test.tsx # NEW - Cancel flow test
│   └── payment-failure.test.tsx      # NEW - Failure flow test
│
└── unit/
    ├── services/
    │   └── payment.test.ts           # NEW - Payment service unit tests
    └── hooks/
        └── usePaymentQueries.test.tsx # NEW - Payment hooks unit tests
```

**Structure Decision**: This is a web application with a single React frontend. All payment functionality is contained within the existing `src/` structure following the established patterns (schemas → services → hooks → pages). The payment feature integrates cleanly without requiring new top-level directories.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations detected. This feature follows all constitutional principles:
- Schema-first development with Zod
- Service layer pattern with pure functions
- TanStack Query for server state management
- TailwindCSS + DaisyUI for consistent UI
- MSW for API mocking in tests
- Query keys factory pattern for cache management

---

## Phase 0: Research & Decisions

### Research Tasks

1. **Kakao Pay API Integration Patterns**
   - Study Kakao Pay redirect flow (ready → payment → callback)
   - Understand pg_token lifecycle and security
   - Research error scenarios and recovery strategies
   - Document callback URL requirements (query parameters)

2. **Payment State Management**
   - Determine optimal React Query cache configuration for payment status
   - Research request queue pattern for duplicate payment prevention
   - Study button disabling patterns during async operations
   - Investigate race condition handling for concurrent payment attempts

3. **Mobile Device Detection**
   - Evaluate user agent detection accuracy
   - Research mobile vs desktop redirect URL selection
   - Study iOS/Android app scheme handling (optional)
   - Consider progressive web app (PWA) implications

4. **Error Recovery Patterns**
   - Research payment timeout handling best practices
   - Study session expiration during external redirect
   - Investigate browser back button behavior after payment
   - Document retry strategies for failed payments

5. **Testing Strategies**
   - Research MSW mock patterns for payment webhooks/callbacks
   - Study test data generation for payment scenarios
   - Investigate E2E testing approaches for redirect flows
   - Document test coverage requirements for payment systems

### Outputs

- `research.md` - Consolidated findings with decisions, rationales, and alternatives

---

## Phase 1: Design & Contracts

### Prerequisites
- `research.md` complete with all NEEDS CLARIFICATION resolved

### Deliverables

1. **Data Model** (`data-model.md`)
   - Payment entity schema (fields, validation rules, state transitions)
   - Order entity extensions (payment fields)
   - PaymentReadyResponse structure
   - PaymentApprovalResponse structure
   - PaymentStatusResponse structure
   - PaymentRefundRequest/Response structures

2. **API Contracts** (`contracts/*.yaml`)
   - POST /api/v1/payments/kakao/ready (OpenAPI spec)
   - GET /api/v1/payments/kakao/success (OpenAPI spec)
   - GET /api/v1/payments/kakao/fail (OpenAPI spec)
   - GET /api/v1/payments/kakao/cancel (OpenAPI spec)
   - GET /api/v1/payments/kakao/status/:orderID (OpenAPI spec)
   - POST /api/v1/payments/kakao/:orderID/refund (OpenAPI spec)

3. **Developer Quickstart** (`quickstart.md`)
   - Local development setup (MSW configuration)
   - Payment flow walkthrough (step-by-step)
   - Testing instructions (unit, integration, manual)
   - Common issues and troubleshooting

4. **Agent Context Update**
   - Run `.specify/scripts/bash/update-agent-context.sh claude`
   - Update with payment-specific patterns and conventions

---

## Phase 2: Task Generation

**NOT EXECUTED BY THIS COMMAND**

Use `/speckit.tasks` to generate dependency-ordered implementation tasks based on:
- Data model entities → schemas
- API contracts → service methods
- UI flows → pages and components
- Test coverage → test files

The tasks will be written to `tasks.md` in this specs directory.

---

## Next Steps

After this command completes:

1. Review `research.md` for any remaining decisions needed
2. Review `data-model.md` to validate entity design
3. Review `contracts/*.yaml` to confirm API contract accuracy
4. Run `/speckit.tasks` to generate implementation task list
5. Run `/speckit.analyze` to perform consistency check across artifacts
6. Begin implementation following `tasks.md` order

---

## Notes

- Backend API endpoints are assumed to be complete and tested (per spec assumptions)
- Payment pages can be lazy-loaded for code splitting
- MSW handlers will simulate Kakao Pay redirect behavior for local development
- Integration tests will cover critical payment flows (success, cancel, failure)
- Manual testing guide exists in `docs/MANUAL_TESTING_GUIDE.md` (84 test cases)
