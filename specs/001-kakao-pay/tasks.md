# Kakao Pay Payment Integration - Implementation Tasks

**Feature Branch**: `feat-kakao-pay`
**Generated**: 2025-01-19
**Status**: Ready for Implementation

This document contains dependency-ordered implementation tasks for the Kakao Pay payment integration feature. Tasks are organized by phase and user story, with clear dependencies and parallelization opportunities marked.

---

## Task Format

Each task follows this format:
```
- [ ] [TaskID] [P?] [Story?] Description with file path
```

Where:
- `TaskID`: Unique identifier (e.g., T001)
- `[P]`: Optional marker indicating task can be parallelized with others
- `[Story]`: User story reference (US1-US5)
- Description: What needs to be done and which file(s) to modify

---

## Phase 1: Setup & Infrastructure (3 tasks)

**Goal**: Initialize payment infrastructure and update project configuration

### 1.1 Project Configuration

- [X] [T001] [P] Update API constants to add Kakao Pay endpoint definitions in src/constants/api.ts
- [X] [T002] [P] Update route configuration to add payment routes in src/App.tsx
- [X] [T003] Add payment error messages to centralized error constants in src/constants/errors.ts (optional, can use generic errors - SKIPPED, using generic)

---

## Phase 2: Foundational Layer - Schemas (2 tasks)

**Goal**: Define Zod schemas as single source of truth for payment types

**Dependencies**: None (can start immediately after Phase 1)

### 2.1 Payment Schemas

- [X] [T004] Create complete payment schemas file with 8 Zod schemas (PaymentReadyRequest, PaymentReadyResponse, PaymentApprovalResponse, PaymentStatusResponse, PaymentRefundRequest, PaymentRefundResponse, PaymentSuccessCallback, PaymentFailCallback, PaymentCancelCallback) and type exports in src/schemas/payment.ts

### 2.2 Order Schema Updates

- [X] [T005] Extend Order schema with payment fields (payment_status, payment_provider, payment_tid, payment_aid, payment_method, payment_approved_at) in src/schemas/orders.ts

---

## Phase 3: Service Layer (2 tasks)

**Goal**: Implement payment API service with Zod validation

**Dependencies**: Requires Phase 2 complete (schemas must exist)

### 3.1 Payment Service

- [X] [T006] Create PaymentService class with 4 methods (initiateKakaoPay, handlePaymentSuccess, handlePaymentCancel, handlePaymentFail, getPaymentStatus) in src/services/payment.ts

### 3.2 Service Exports

- [X] [T007] Export payment schemas from schema index file in src/schemas/index.ts

---

## Phase 4: React Query Integration (1 task)

**Goal**: Create TanStack Query hooks for payment mutations and queries

**Dependencies**: Requires Phase 3 complete (service layer must exist)

### 4.1 Payment Query Hooks

- [X] [T008] Create payment query keys factory (paymentKeys) and 4 React Query hooks (useInitiateKakaoPay, usePaymentSuccess, usePaymentStatus, useRefundPayment) with auto-invalidation in src/hooks/queries/usePaymentQueries.ts

---

## Phase 5: User Story 1 (P1) - Core Payment Flow (3 tasks)

**Goal**: Implement complete payment initiation and success flow

**Dependencies**: Requires Phase 4 complete (hooks must exist)

### 5.1 Payment Initiation Page

- [X] [T009] [US1] Create payment initiation page component with order summary, loading states, device detection, and "결제하기" button in src/pages/PaymentPage.tsx

### 5.2 Payment Success Page

- [X] [T010] [US1] Create payment success callback page component displaying order number, payment details (TID, AID, method, timestamp), and navigation to order history in src/pages/PaymentSuccessPage.tsx

### 5.3 Success Flow Integration

- [X] [T011] [US1] Update order creation redirect logic to navigate to /payment/:orderId instead of /cart in src/pages/OrderPage.tsx

---

## Phase 6: User Story 5 (P1) - Duplicate Payment Prevention (1 task)

**Goal**: Prevent duplicate payments for completed orders

**Dependencies**: Requires Phase 5.1 complete (PaymentPage must exist)

### 6.1 Payment Status Guard

- [X] [T012] [US5] Add payment status check with redirect logic to prevent duplicate payments in PaymentPage component (useEffect that checks payment_status and redirects if 'completed') in src/pages/PaymentPage.tsx

---

## Phase 7: User Story 2 (P2) - Cancellation Handling (2 tasks)

**Goal**: Handle payment cancellation scenario

**Dependencies**: Requires Phase 4 complete (hooks must exist)

### 7.1 Payment Cancel Page

- [X] [T013] [US2] Create payment cancellation callback page component with order number display, cancellation message, and "다시 결제하기" button in src/pages/PaymentCancelPage.tsx

### 7.2 Cancel Flow Service Integration

- [X] [T014] [US2] Ensure PaymentService.handlePaymentCancel properly parses callback query parameters and returns order information in src/services/payment.ts (N/A - cancel/fail are GET redirects from Kakao Pay, parsed client-side with Zod schemas)

---

## Phase 8: User Story 3 (P2) - Failure Handling (2 tasks)

**Goal**: Handle payment failure scenario

**Dependencies**: Requires Phase 4 complete (hooks must exist)

### 8.1 Payment Failure Page

- [X] [T015] [US3] Create payment failure callback page component with error message display, order number, and "다시 결제하기" button in src/pages/PaymentFailPage.tsx

### 8.2 Failure Flow Service Integration

- [X] [T016] [US3] Ensure PaymentService.handlePaymentFail properly parses callback query parameters including error_msg and returns order information in src/services/payment.ts (N/A - cancel/fail are GET redirects from Kakao Pay, parsed client-side with Zod schemas)

---

## Phase 9: User Story 4 (P3) - Payment Status Display (2 tasks)

**Goal**: Display payment status across order UI components

**Dependencies**: Requires Phase 2 complete (Order schema with payment fields must exist)

### 9.1 Order Status Badge Updates

- [X] [T017] [P] [US4] Update OrderStatusBadge component to handle payment_status values (결제대기, 결제완료, 결제실패, 환불완료) with appropriate badge colors in src/components/OrderStatusBadge.tsx (Already implemented - PaymentStatusBadge exists)

### 9.2 Order Card Payment Display

- [X] [T018] [P] [US4] Update OrderCard component to display payment status badge, transaction ID (if completed), payment method, and approval timestamp in Korean format in src/components/OrderCard.tsx

---

## Phase 10: MSW Mock Development (2 tasks)

**Goal**: Create MSW handlers for local development and testing

**Dependencies**: Requires Phase 2 complete (schemas must exist for validation)

### 10.1 Payment Mock Handlers

- [X] [T019] [P] Create MSW handlers for 6 payment endpoints (POST /ready, GET /success, GET /fail, GET /cancel, GET /status/:id, POST /refund) with realistic response data in src/mocks/handlers/payment.ts

### 10.2 Mock Data Integration

- [X] [T020] [P] Update MSW handler exports to include payment handlers in src/mocks/handlers/index.ts

---

## Phase 11: Documentation & Polish (3 tasks)

**Goal**: Complete integration documentation and final cleanup

**Dependencies**: All implementation phases complete

### 11.1 Documentation

- [X] [T021] [P] Review and validate integration guide completeness in docs/KAKAO_PAY_INTEGRATION.md (Existing guide is comprehensive and accurate)
- [X] [T022] [P] Update CLAUDE.md with payment system implementation notes if needed (CLAUDE.md update not needed - payment system follows existing architecture patterns)

### 11.2 Code Quality

- [X] [T023] Run linter and fix any payment-related code style issues across all modified files (All payment-specific lint errors fixed - remaining errors are pre-existing)

---

## Task Summary by User Story

### US1: Complete Payment for Order (P1) - 3 tasks
- T009: Payment initiation page
- T010: Payment success page
- T011: Order page redirect update

### US2: Handle Payment Cancellation (P2) - 2 tasks
- T013: Payment cancel page
- T014: Cancel flow service integration

### US3: Handle Payment Failure (P2) - 2 tasks
- T015: Payment failure page
- T016: Failure flow service integration

### US4: View Payment Status in Order Details (P3) - 2 tasks
- T017: Order status badge updates
- T018: Order card payment display

### US5: Prevent Duplicate Payments (P1) - 1 task
- T012: Payment status guard

---

## Task Summary by Phase

| Phase | Tasks | Can Start After | Parallelizable |
|-------|-------|-----------------|----------------|
| Phase 1: Setup | 3 | Immediate | Yes (all 3) |
| Phase 2: Schemas | 2 | Phase 1 | No (T005 may reference T004) |
| Phase 3: Service | 2 | Phase 2 | No (T007 depends on T006) |
| Phase 4: Hooks | 1 | Phase 3 | No |
| Phase 5: US1 (P1) | 3 | Phase 4 | Partial (T009-T010 sequential, T011 parallel) |
| Phase 6: US5 (P1) | 1 | Phase 5.1 | No |
| Phase 7: US2 (P2) | 2 | Phase 4 | Partial (T013 first, T014 can be done earlier) |
| Phase 8: US3 (P2) | 2 | Phase 4 | Partial (T015 first, T016 can be done earlier) |
| Phase 9: US4 (P3) | 2 | Phase 2 | Yes (both parallel) |
| Phase 10: MSW | 2 | Phase 2 | Yes (both parallel) |
| Phase 11: Polish | 3 | All phases | Yes (all 3) |

---

## Critical Path

The minimum viable payment flow (MVP) requires completing:
1. Phase 1: Setup (all tasks)
2. Phase 2: Schemas (both tasks)
3. Phase 3: Service layer (both tasks)
4. Phase 4: Hooks (T008)
5. Phase 5: US1 Core flow (T009, T010, T011)
6. Phase 6: US5 Duplicate prevention (T012)
7. Phase 10: MSW mocks (T019, T020) - for development testing

**Total MVP Tasks**: 13 tasks
**Estimated MVP Time**: 8-12 hours (based on existing auth implementation patterns)

---

## Parallelization Opportunities

**After Phase 1 complete**:
- Phase 2 schemas can start

**After Phase 2 complete**:
- Phase 3 service layer
- Phase 9 UI updates (T017, T018)
- Phase 10 MSW mocks (T019, T020)

**After Phase 4 complete**:
- Phase 5, 7, 8 page components can be built in parallel (T009, T010, T013, T015)
- Service integration tasks (T014, T016) can be done earlier if service layer is ready

**After all implementation**:
- Phase 11 polish tasks (T021, T022, T023) can all be done in parallel

---

## Implementation Notes

### Schema-First Approach
- Always define Zod schemas before implementing service methods
- All types are derived from `z.infer<typeof Schema>`
- Runtime validation happens in service layer using `Schema.parse()`

### Service Layer Pattern
- PaymentService class with no React dependencies
- All methods validate requests and responses with Zod
- Errors are converted to custom error classes (ApiError, ValidationError)

### React Query Patterns
- Query keys factory pattern (`paymentKeys`) for consistent caching
- Mutations automatically invalidate related queries via `onSuccess`
- Use `enabled` option for conditional queries (payment status checks)

### Component Patterns
- Loading states for all async operations
- Korean error messages from constants
- DaisyUI components (cards, buttons, badges, alerts)
- Device detection via navigator.userAgent for mobile redirects

### MSW Mock Patterns
- Handlers simulate Kakao Pay redirect behavior
- Realistic TID/AID generation for testing
- Support all success, failure, and cancellation scenarios

---

## Testing Strategy (Optional - Not in MVP)

If tests are requested later, implement in this order:
1. Unit tests for PaymentService methods
2. Unit tests for payment query hooks
3. Integration tests for payment flow (success, cancel, fail)
4. Component tests for payment pages
5. Manual E2E testing using MSW mocks

---

## Related Documentation

- Feature Specification: `specs/001-kakao-pay/spec.md`
- Implementation Plan: `specs/001-kakao-pay/plan.md`
- Data Model: `specs/001-kakao-pay/data-model.md`
- Developer Quickstart: `specs/001-kakao-pay/quickstart.md`
- API Contracts: `specs/001-kakao-pay/contracts/*.yaml`
- Integration Guide: `docs/KAKAO_PAY_INTEGRATION.md`

---

**Total Tasks**: 23
**MVP Tasks**: 13
**User Stories Covered**: 5 (US1-US5)
**Estimated Total Time**: 12-16 hours

**Generated by**: Claude Code
**Last Updated**: 2025-01-19
