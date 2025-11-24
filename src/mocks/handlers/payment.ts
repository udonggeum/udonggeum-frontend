import { http, HttpResponse } from 'msw';

/**
 * MSW Payment Handlers
 * Mocks Kakao Pay API endpoints for development and testing
 *
 * Simulates realistic payment flow:
 * 1. /ready - Returns TID and redirect URLs
 * 2. /success - Approves payment (called by backend after pg_token validation)
 * 3. /status - Returns current payment status
 * 4. /refund - Processes refund
 * 5. /fail - Logs failure (backend-only, frontend parses query params)
 * 6. /cancel - Logs cancellation (backend-only, frontend parses query params)
 */

// In-memory payment state
const paymentState: Record<
  number,
  {
    tid: string;
    aid?: string;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    method?: 'CARD' | 'MONEY';
    approved_at?: string;
    refunded_amount?: number;
  }
> = {};

// Generate realistic TID (20 chars)
function generateTID(): string {
  return `T${Date.now()}${Math.random().toString(36).substring(2, 9)}`.toUpperCase();
}

// Generate realistic AID (20 chars)
function generateAID(): string {
  return `A${Date.now()}${Math.random().toString(36).substring(2, 9)}`.toUpperCase();
}

export const paymentHandlers = [
  // POST /api/v1/payments/kakao/ready
  // Initiates Kakao Pay payment
  http.post('/api/v1/payments/kakao/ready', async ({ request }) => {
    const body = (await request.json()) as { order_id: number };
    const { order_id } = body;

    if (!order_id || order_id <= 0) {
      return HttpResponse.json(
        { error: '유효하지 않은 주문 번호입니다' },
        { status: 400 }
      );
    }

    // Generate TID
    const tid = generateTID();

    // Store payment state as pending
    paymentState[order_id] = {
      tid,
      status: 'pending',
    };

    // Return redirect URLs (simulating Kakao Pay /ready response)
    return HttpResponse.json({
      message: 'Payment ready',
      data: {
        tid,
        next_redirect_pc_url: `http://localhost:5173/mock-kakao-pay?order_id=${order_id}&tid=${tid}&device=pc`,
        next_redirect_mobile_url: `http://localhost:5173/mock-kakao-pay?order_id=${order_id}&tid=${tid}&device=mobile`,
        next_redirect_app_url: `kakaotalk://kakao-pay?order_id=${order_id}&tid=${tid}`,
        android_app_scheme: `intent://kakao-pay?order_id=${order_id}#Intent;scheme=kakaopay;package=com.kakao.talk;end`,
        ios_app_scheme: `kakaotalk://kakao-pay?order_id=${order_id}`,
      },
    });
  }),

  // GET /api/v1/payments/kakao/success
  // Approves payment (called by backend after Kakao Pay redirect)
  http.get('/api/v1/payments/kakao/success', ({ request }) => {
    const url = new URL(request.url);
    const orderIdStr = url.searchParams.get('order_id');
    const pgToken = url.searchParams.get('pg_token');

    if (!orderIdStr || !pgToken) {
      return HttpResponse.json(
        { error: '결제 승인에 필요한 정보가 부족합니다' },
        { status: 400 }
      );
    }

    const order_id = parseInt(orderIdStr, 10);

    if (!paymentState[order_id]) {
      return HttpResponse.json(
        { error: '결제 정보를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    // Generate AID and mark as completed
    const aid = generateAID();
    const approved_at = new Date().toISOString();
    const method: 'CARD' | 'MONEY' = Math.random() > 0.5 ? 'CARD' : 'MONEY';

    paymentState[order_id] = {
      ...paymentState[order_id],
      aid,
      status: 'completed',
      method,
      approved_at,
    };

    // Simulate some processing time
    return HttpResponse.json({
      message: 'Payment approved',
      data: {
        order_id,
        tid: paymentState[order_id].tid,
        aid,
        total_amount: 50000, // Mock amount (should come from order)
        payment_method: method,
        approved_at,
      },
    });
  }),

  // GET /api/v1/payments/kakao/status/:orderID
  // Returns payment status for an order
  http.get('/api/v1/payments/kakao/status/:orderId', ({ params }) => {
    const orderId = parseInt(params.orderId as string, 10);

    if (!orderId || orderId <= 0) {
      return HttpResponse.json(
        { error: '유효하지 않은 주문 번호입니다' },
        { status: 400 }
      );
    }

    const payment = paymentState[orderId];

    if (!payment) {
      // Order exists but payment not initiated yet
      return HttpResponse.json({
        message: 'Payment status retrieved',
        data: {
          order_id: orderId,
          payment_status: 'pending' as const,
          total_amount: 50000, // Mock amount
        },
      });
    }

    return HttpResponse.json({
      message: 'Payment status retrieved',
      data: {
        order_id: orderId,
        payment_status: payment.status,
        payment_provider: 'kakaopay',
        payment_tid: payment.tid,
        payment_aid: payment.aid,
        payment_method: payment.method,
        payment_approved_at: payment.approved_at || null,
        total_amount: 50000, // Mock amount
      },
    });
  }),

  // POST /api/v1/payments/kakao/:orderID/refund
  // Refunds a completed payment
  http.post('/api/v1/payments/kakao/:orderId/refund', async ({ params, request }) => {
    const orderId = parseInt(params.orderId as string, 10);
    const body = (await request.json()) as { cancel_amount: number };
    const { cancel_amount } = body;

    if (!orderId || orderId <= 0) {
      return HttpResponse.json(
        { error: '유효하지 않은 주문 번호입니다' },
        { status: 400 }
      );
    }

    if (!cancel_amount || cancel_amount <= 0) {
      return HttpResponse.json(
        { error: '환불 금액이 유효하지 않습니다' },
        { status: 400 }
      );
    }

    const payment = paymentState[orderId];

    if (!payment || payment.status !== 'completed') {
      return HttpResponse.json(
        { error: '환불할 수 있는 결제가 아닙니다' },
        { status: 400 }
      );
    }

    // Mark as refunded
    payment.status = 'refunded';
    payment.refunded_amount = (payment.refunded_amount || 0) + cancel_amount;

    const total_amount = 50000; // Mock amount
    const remaining_amount = total_amount - payment.refunded_amount;

    return HttpResponse.json({
      message: 'Payment refunded',
      data: {
        order_id: orderId,
        tid: payment.tid,
        canceled_amount: cancel_amount,
        remaining_amount,
        canceled_at: new Date().toISOString(),
      },
    });
  }),

  // GET /api/v1/payments/kakao/fail
  // Logs payment failure (backend endpoint, frontend parses query params)
  http.get('/api/v1/payments/kakao/fail', ({ request }) => {
    const url = new URL(request.url);
    const orderIdStr = url.searchParams.get('order_id');
    const _errorMsg = url.searchParams.get('error_msg'); // Unused but received from Kakao Pay

    if (!orderIdStr) {
      return HttpResponse.json(
        { error: '주문 번호가 필요합니다' },
        { status: 400 }
      );
    }

    const order_id = parseInt(orderIdStr, 10);

    if (paymentState[order_id]) {
      paymentState[order_id].status = 'failed';
    }

    // In real backend, this would redirect to frontend /payment/fail
    // For MSW, we just return success (frontend will parse URL params)
    return HttpResponse.json({
      message: 'Payment failure logged',
    });
  }),

  // GET /api/v1/payments/kakao/cancel
  // Logs payment cancellation (backend endpoint, frontend parses query params)
  http.get('/api/v1/payments/kakao/cancel', ({ request }) => {
    const url = new URL(request.url);
    const orderIdStr = url.searchParams.get('order_id');

    if (!orderIdStr) {
      return HttpResponse.json(
        { error: '주문 번호가 필요합니다' },
        { status: 400 }
      );
    }

    const _order_id = parseInt(orderIdStr, 10);

    // Payment remains pending (user can retry)
    // No state change needed

    // In real backend, this would redirect to frontend /payment/cancel
    // For MSW, we just return success (frontend will parse URL params)
    return HttpResponse.json({
      message: 'Payment cancellation logged',
    });
  }),
];
