import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentService } from '@/services/payment';
import { useAuthStore } from '@/stores/useAuthStore';
import { ordersKeys } from './useOrdersQueries';
import type {
  PaymentReadyRequest,
  PaymentRefundRequest,
} from '@/schemas/payment';

/**
 * Payment Query Keys Factory
 * Centralized query key management for payment-related queries
 */
export const paymentKeys = {
  all: ['payments'] as const,
  statuses: () => [...paymentKeys.all, 'status'] as const,
  status: (orderId: number) => [...paymentKeys.statuses(), orderId] as const,
};

/**
 * usePaymentStatus query
 * Fetches payment status for an order
 * Only enabled when user is authenticated
 *
 * @param orderId - Order ID to check payment status
 * @param options - Query options (enabled, etc.)
 * @example
 * const { data: paymentStatus, isLoading } = usePaymentStatus(123);
 * // paymentStatus.data.payment_status: 'pending' | 'completed' | 'failed' | 'refunded'
 */
export function usePaymentStatus(
  orderId: number,
  options?: { enabled?: boolean }
) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: paymentKeys.status(orderId),
    queryFn: () => paymentService.getPaymentStatus(orderId),
    enabled: (options?.enabled ?? true) && isAuthenticated,
    staleTime: 1000 * 30, // 30 seconds (payment status changes frequently)
    refetchInterval: (query) => {
      // Auto-refetch every 3 seconds if payment is pending
      const status = query.state.data?.data.payment_status;
      return status === 'pending' ? 3000 : false;
    },
  });
}

/**
 * useInitiateKakaoPay mutation
 * Initiates Kakao Pay payment flow for an order
 * Returns redirect URLs to Kakao Pay payment page
 *
 * @example
 * const { mutate: initiatePayment, isPending } = useInitiateKakaoPay();
 * initiatePayment(
 *   { order_id: 123 },
 *   {
 *     onSuccess: (data) => {
 *       // Redirect to appropriate URL based on device
 *       const isMobile = /Mobile/i.test(navigator.userAgent);
 *       window.location.href = isMobile
 *         ? data.data.next_redirect_mobile_url
 *         : data.data.next_redirect_pc_url;
 *     }
 *   }
 * );
 */
export function useInitiateKakaoPay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: PaymentReadyRequest) =>
      paymentService.initiateKakaoPay(request),
    onSuccess: (data, variables) => {
      // Invalidate payment status for this order
      void queryClient.invalidateQueries({
        queryKey: paymentKeys.status(variables.order_id),
      });

      // Invalidate order detail to show updated payment_status
      void queryClient.invalidateQueries({
        queryKey: ordersKeys.detail(variables.order_id),
      });
    },
  });
}

/**
 * usePaymentSuccess mutation
 * Handles payment success callback from Kakao Pay
 * Backend automatically approves payment using pg_token
 *
 * @example
 * const { mutate: handleSuccess, isPending } = usePaymentSuccess();
 * // In PaymentSuccessPage component
 * handleSuccess({ orderId: 123, pgToken: 'abc123' });
 */
export function usePaymentSuccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      pgToken,
    }: {
      orderId: number;
      pgToken: string;
    }) => paymentService.handlePaymentSuccess(orderId, pgToken),
    onSuccess: (data) => {
      const orderId = data.data.order_id;

      // Invalidate payment status
      void queryClient.invalidateQueries({
        queryKey: paymentKeys.status(orderId),
      });

      // Invalidate order detail and list (payment now completed)
      void queryClient.invalidateQueries({
        queryKey: ordersKeys.detail(orderId),
      });
      void queryClient.invalidateQueries({
        queryKey: ordersKeys.list(),
      });
    },
  });
}

/**
 * useRefundPayment mutation
 * Refunds/cancels a completed payment
 * Can be partial or full refund
 *
 * @example
 * const { mutate: refundPayment, isPending } = useRefundPayment();
 * refundPayment({
 *   orderId: 123,
 *   request: { cancel_amount: 50000 }
 * });
 */
export function useRefundPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      request,
    }: {
      orderId: number;
      request: PaymentRefundRequest;
    }) => paymentService.refundPayment(orderId, request),
    onSuccess: (data) => {
      const orderId = data.data.order_id;

      // Invalidate payment status
      void queryClient.invalidateQueries({
        queryKey: paymentKeys.status(orderId),
      });

      // Invalidate order detail and list (payment now refunded)
      void queryClient.invalidateQueries({
        queryKey: ordersKeys.detail(orderId),
      });
      void queryClient.invalidateQueries({
        queryKey: ordersKeys.list(),
      });
    },
  });
}
