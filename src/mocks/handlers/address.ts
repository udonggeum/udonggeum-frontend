/**
 * MSW handlers: Addresses
 */

import { http, HttpResponse } from 'msw';
import { mockDB } from '../utils/db';
import { getUserIdFromAuth } from '../utils/auth';

const BASE_URL = '/api/v1';

export const addressHandlers = [
  /**
   * GET /api/v1/addresses
   * Get user's addresses (requires authentication)
   */
  http.get(`${BASE_URL}/addresses`, ({ request }) => {
    const userId = getUserIdFromAuth(request.headers.get('Authorization'));
    if (!userId) {
      return HttpResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const addresses = mockDB.getAddressesByUserId(userId);

    return HttpResponse.json({
      addresses,
    });
  }),

  /**
   * POST /api/v1/addresses
   * Add new address (requires authentication)
   */
  http.post(`${BASE_URL}/addresses`, async ({ request }) => {
    const userId = getUserIdFromAuth(request.headers.get('Authorization'));
    if (!userId) {
      return HttpResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, recipient, phone, zip_code, address, detail_address, is_default } = body as {
      name: string;
      recipient: string;
      phone: string;
      zip_code?: string;
      address: string;
      detail_address?: string;
      is_default?: boolean;
    };

    // Validate required fields
    if (!name || !recipient || !phone || !address) {
      return HttpResponse.json(
        { error: '필수 항목을 모두 입력해주세요.' },
        { status: 400 }
      );
    }

    // Add address
    const newAddress = mockDB.addAddress({
      user_id: userId,
      name,
      recipient,
      phone,
      zip_code: zip_code || '',
      address,
      detail_address: detail_address || '',
      is_default: is_default || false,
    });

    return HttpResponse.json(
      {
        message: '배송지가 추가되었습니다.',
        address: newAddress,
      },
      { status: 201 }
    );
  }),

  /**
   * PUT /api/v1/addresses/:id
   * Update address (requires authentication)
   */
  http.put(`${BASE_URL}/addresses/:id`, async ({ params, request }) => {
    const userId = getUserIdFromAuth(request.headers.get('Authorization'));
    if (!userId) {
      return HttpResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const id = parseInt(params.id as string, 10);
    const body = await request.json();
    const { name, recipient, phone, zip_code, address, detail_address } = body as {
      name?: string;
      recipient?: string;
      phone?: string;
      zip_code?: string;
      address?: string;
      detail_address?: string;
    };

    // Check if address exists and belongs to user
    const existingAddress = mockDB.getAddressById(id);
    if (!existingAddress) {
      return HttpResponse.json(
        { error: '배송지를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (existingAddress.user_id !== userId) {
      return HttpResponse.json(
        { error: '접근 권한이 없습니다.' },
        { status: 403 }
      );
    }

    // Update address
    const updatedAddress = mockDB.updateAddress(id, {
      name,
      recipient,
      phone,
      zip_code,
      address,
      detail_address,
    });

    return HttpResponse.json({
      message: '배송지가 수정되었습니다.',
      address: updatedAddress,
    });
  }),

  /**
   * DELETE /api/v1/addresses/:id
   * Delete address (requires authentication)
   */
  http.delete(`${BASE_URL}/addresses/:id`, ({ params, request }) => {
    const userId = getUserIdFromAuth(request.headers.get('Authorization'));
    if (!userId) {
      return HttpResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const id = parseInt(params.id as string, 10);

    // Check if address exists and belongs to user
    const existingAddress = mockDB.getAddressById(id);
    if (!existingAddress) {
      return HttpResponse.json(
        { error: '배송지를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (existingAddress.user_id !== userId) {
      return HttpResponse.json(
        { error: '접근 권한이 없습니다.' },
        { status: 403 }
      );
    }

    // Delete address
    const success = mockDB.deleteAddress(id);
    if (!success) {
      return HttpResponse.json(
        { error: '배송지 삭제에 실패했습니다.' },
        { status: 500 }
      );
    }

    return HttpResponse.json({
      message: '배송지가 삭제되었습니다.',
    });
  }),

  /**
   * PUT /api/v1/addresses/:id/default
   * Set address as default (requires authentication)
   */
  http.put(`${BASE_URL}/addresses/:id/default`, ({ params, request }) => {
    const userId = getUserIdFromAuth(request.headers.get('Authorization'));
    if (!userId) {
      return HttpResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const id = parseInt(params.id as string, 10);

    // Check if address exists and belongs to user
    const existingAddress = mockDB.getAddressById(id);
    if (!existingAddress) {
      return HttpResponse.json(
        { error: '배송지를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (existingAddress.user_id !== userId) {
      return HttpResponse.json(
        { error: '접근 권한이 없습니다.' },
        { status: 403 }
      );
    }

    // Set as default
    const updatedAddress = mockDB.setDefaultAddress(id, userId);
    if (!updatedAddress) {
      return HttpResponse.json(
        { error: '기본 배송지 설정에 실패했습니다.' },
        { status: 500 }
      );
    }

    return HttpResponse.json({
      message: '기본 배송지로 설정되었습니다.',
      address: updatedAddress,
    });
  }),
];
