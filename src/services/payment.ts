import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/constants/api';
import {
  PaymentReadyRequest,
  PaymentReadyRequestSchema,
  PaymentReadyResponse,
  PaymentReadyResponseSchema,
  PaymentApprovalResponse,
  PaymentApprovalResponseSchema,
  PaymentStatusResponse,
  PaymentStatusResponseSchema,
  PaymentRefundRequest,
  PaymentRefundRequestSchema,
  PaymentRefundResponse,
  PaymentRefundResponseSchema,
} from '@/schemas/payment';

/**
 * Payment Service
 * Handles all Kakao Pay payment-related API calls with Zod validation
 */
class PaymentService {
  /**
   * Initiate Kakao Pay payment
   * Returns redirect URLs to Kakao Pay payment page
   */
  async initiateKakaoPay(
    request: PaymentReadyRequest
  ): Promise<PaymentReadyResponse> {
    // Validate request with Zod
    const validatedRequest = PaymentReadyRequestSchema.parse(request);

    // Call backend API
    const response = await apiClient.post(
      ENDPOINTS.PAYMENTS.KAKAO.READY,
      validatedRequest
    );

    // Validate and return response
    return PaymentReadyResponseSchema.parse(response.data);
  }

  /**
   * Get payment status for an order
   */
  async getPaymentStatus(orderId: number): Promise<PaymentStatusResponse> {
    const response = await apiClient.get(
      ENDPOINTS.PAYMENTS.KAKAO.STATUS(orderId)
    );

    return PaymentStatusResponseSchema.parse(response.data);
  }

  /**
   * Refund/cancel a payment
   */
  async refundPayment(
    orderId: number,
    request: PaymentRefundRequest
  ): Promise<PaymentRefundResponse> {
    // Validate request with Zod
    const validatedRequest = PaymentRefundRequestSchema.parse(request);

    // Call backend API
    const response = await apiClient.post(
      ENDPOINTS.PAYMENTS.KAKAO.REFUND(orderId),
      validatedRequest
    );

    // Validate and return response
    return PaymentRefundResponseSchema.parse(response.data);
  }

  /**
   * Handle payment success callback
   * This is called when Kakao Pay redirects back to success page
   * The backend automatically approves the payment
   */
  async handlePaymentSuccess(
    orderId: number,
    pgToken: string
  ): Promise<PaymentApprovalResponse> {
    const response = await apiClient.get(ENDPOINTS.PAYMENTS.KAKAO.SUCCESS, {
      params: { order_id: orderId, pg_token: pgToken },
    });

    return PaymentApprovalResponseSchema.parse(response.data);
  }
}

// Export singleton instance
export const paymentService = new PaymentService();
