import { z } from 'zod';

/**
 * Kakao Pay Payment Schemas
 * Schema-first development: All types derived from Zod schemas
 */

// ============================================================================
// Request Schemas
// ============================================================================

/**
 * PaymentReadyRequest
 * Request to initiate Kakao Pay payment flow
 */
export const PaymentReadyRequestSchema = z.object({
  order_id: z
    .number()
    .int('Order ID must be an integer')
    .positive('Order ID must be positive'),
});

export type PaymentReadyRequest = z.infer<typeof PaymentReadyRequestSchema>;

/**
 * PaymentRefundRequest
 * Request to refund/cancel a completed payment
 */
export const PaymentRefundRequestSchema = z.object({
  cancel_amount: z
    .number()
    .positive('Refund amount must be greater than zero')
    .describe('Amount to refund in KRW - can be partial or full'),
});

export type PaymentRefundRequest = z.infer<typeof PaymentRefundRequestSchema>;

// ============================================================================
// Response Schemas
// ============================================================================

/**
 * PaymentReadyResponse
 * Response from /ready endpoint containing Kakao Pay redirect URLs
 */
export const PaymentReadyDataSchema = z.object({
  tid: z
    .string()
    .min(1, 'Transaction ID cannot be empty')
    .describe('Kakao Pay transaction ID - store for approval call'),

  next_redirect_pc_url: z
    .string()
    .url('Must be a valid URL')
    .describe('Redirect URL for desktop/laptop browsers'),

  next_redirect_mobile_url: z
    .string()
    .url('Must be a valid URL')
    .describe('Redirect URL for mobile web browsers'),

  next_redirect_app_url: z
    .string()
    .url('Must be a valid URL')
    .describe('Redirect URL for in-app browsers (KakaoTalk, etc.)'),

  android_app_scheme: z
    .string()
    .describe('Deep link scheme for native Android apps'),

  ios_app_scheme: z.string().describe('Deep link scheme for native iOS apps'),
});

export const PaymentReadyResponseSchema = z.object({
  message: z.string(),
  data: PaymentReadyDataSchema,
});

export type PaymentReadyData = z.infer<typeof PaymentReadyDataSchema>;
export type PaymentReadyResponse = z.infer<typeof PaymentReadyResponseSchema>;

/**
 * PaymentApprovalResponse
 * Response from /success callback after Kakao Pay approval
 */
export const PaymentApprovalDataSchema = z.object({
  order_id: z
    .number()
    .int()
    .positive()
    .describe('Order ID that was paid'),

  aid: z
    .string()
    .min(1, 'Approval ID cannot be empty')
    .describe('Kakao Pay approval ID - proof of payment'),

  tid: z
    .string()
    .min(1, 'Transaction ID cannot be empty')
    .describe('Kakao Pay transaction ID - matches TID from /ready'),

  total_amount: z
    .number()
    .nonnegative('Amount cannot be negative')
    .describe('Total amount paid in KRW (Korean Won)'),

  payment_method: z
    .enum(['CARD', 'MONEY'])
    .describe(
      'Payment method - CARD (credit/debit card) or MONEY (Kakao Money)'
    ),

  approved_at: z
    .string()
    .datetime('Must be valid ISO 8601 datetime')
    .describe('Timestamp when payment was approved'),
});

export const PaymentApprovalResponseSchema = z.object({
  message: z.string(),
  data: PaymentApprovalDataSchema,
});

export type PaymentApprovalData = z.infer<typeof PaymentApprovalDataSchema>;
export type PaymentApprovalResponse = z.infer<
  typeof PaymentApprovalResponseSchema
>;

/**
 * PaymentStatusResponse
 * Response from /status/:orderID endpoint for checking payment state
 */
export const PaymentStatusDataSchema = z.object({
  order_id: z.number().int().positive(),

  payment_status: z
    .enum(['pending', 'completed', 'failed', 'refunded'])
    .describe('Current payment status'),

  payment_provider: z
    .string()
    .optional()
    .describe('Payment provider name - present when payment initiated'),

  payment_tid: z
    .string()
    .optional()
    .describe('Transaction ID - present when payment initiated'),

  payment_aid: z
    .string()
    .optional()
    .describe('Approval ID - present when payment completed'),

  payment_method: z
    .enum(['CARD', 'MONEY'])
    .optional()
    .describe('Payment method - present when payment completed'),

  payment_approved_at: z
    .string()
    .datetime()
    .nullable()
    .optional()
    .describe('Approval timestamp - present when payment completed'),

  total_amount: z.number().nonnegative().describe('Order total amount'),
});

export const PaymentStatusResponseSchema = z.object({
  message: z.string(),
  data: PaymentStatusDataSchema,
});

export type PaymentStatusData = z.infer<typeof PaymentStatusDataSchema>;
export type PaymentStatusResponse = z.infer<typeof PaymentStatusResponseSchema>;

/**
 * PaymentRefundResponse
 * Response from /refund endpoint after successful refund
 */
export const PaymentRefundDataSchema = z.object({
  order_id: z.number().int().positive(),

  tid: z.string().min(1).describe('Original transaction ID'),

  canceled_amount: z
    .number()
    .nonnegative()
    .describe('Amount refunded in this request'),

  remaining_amount: z
    .number()
    .nonnegative()
    .describe('Remaining amount not refunded (for partial refunds)'),

  canceled_at: z
    .string()
    .datetime()
    .describe('Timestamp when refund was processed'),
});

export const PaymentRefundResponseSchema = z.object({
  message: z.string(),
  data: PaymentRefundDataSchema,
});

export type PaymentRefundData = z.infer<typeof PaymentRefundDataSchema>;
export type PaymentRefundResponse = z.infer<typeof PaymentRefundResponseSchema>;

// ============================================================================
// Callback Query Parameter Schemas
// ============================================================================

/**
 * PaymentSuccessCallback
 * Query parameters from Kakao Pay success redirect
 * URL: /payment/success?order_id=123&pg_token=abc
 */
export const PaymentSuccessCallbackSchema = z.object({
  order_id: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive())
    .describe('Order ID that was paid'),

  pg_token: z
    .string()
    .min(1, 'pg_token is required')
    .describe('Single-use token for payment approval'),
});

export type PaymentSuccessCallback = z.infer<
  typeof PaymentSuccessCallbackSchema
>;

/**
 * PaymentFailCallback
 * Query parameters from Kakao Pay failure redirect
 * URL: /payment/fail?order_id=123&error_msg=Insufficient%20funds
 */
export const PaymentFailCallbackSchema = z.object({
  order_id: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive()),

  error_msg: z
    .string()
    .optional()
    .describe('Error message from Kakao Pay'),
});

export type PaymentFailCallback = z.infer<typeof PaymentFailCallbackSchema>;

/**
 * PaymentCancelCallback
 * Query parameters from Kakao Pay cancellation redirect
 * URL: /payment/cancel?order_id=123
 */
export const PaymentCancelCallbackSchema = z.object({
  order_id: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive()),
});

export type PaymentCancelCallback = z.infer<
  typeof PaymentCancelCallbackSchema
>;

// ============================================================================
// Error Response Schema
// ============================================================================

/**
 * PaymentErrorResponse
 * Standard error response from payment endpoints
 */
export const PaymentErrorResponseSchema = z.object({
  message: z.string(),
  error: z.string().optional(),
});

export type PaymentErrorResponse = z.infer<typeof PaymentErrorResponseSchema>;
