/**
 * MSW handlers: Authentication
 * Follows service layer pattern from architecture
 */

import { http, HttpResponse } from 'msw';
import { mockDB } from '../utils/db';
import { generateMockToken, getUserIdFromAuth } from '../utils/auth';
import {
  LoginRequestSchema,
  RegisterRequestSchema,
  type AuthResponse,
  type MeResponse,
} from '@/schemas/auth';

const BASE_URL = '/api/v1';

export const authHandlers = [
  /**
   * POST /api/v1/auth/register
   * Register new user
   */
  http.post(`${BASE_URL}/auth/register`, async ({ request }) => {
    const body = await request.json();

    // Validate input using existing Zod schema
    const parseResult = RegisterRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return HttpResponse.json(
        { error: '입력값을 확인해주세요.', details: parseResult.error.issues },
        { status: 400 }
      );
    }

    const { email, password, name, phone } = parseResult.data;

    // Check if user already exists
    const existingUser = mockDB.getUserByEmail(email);
    if (existingUser) {
      return HttpResponse.json(
        { error: '이미 사용 중인 이메일입니다.' },
        { status: 409 }
      );
    }

    // Create new user
    const newUser = mockDB.createUser({
      email: email.toLowerCase(),
      password, // In real app, this would be hashed
      name,
      phone,
      role: 'user',
    });

    // Generate tokens
    const access_token = generateMockToken(newUser.id);
    const refresh_token = generateMockToken(newUser.id);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    const response: AuthResponse = {
      message: '회원가입이 완료되었습니다.',
      user: userWithoutPassword,
      tokens: {
        access_token,
        refresh_token,
      },
    };

    return HttpResponse.json(response, { status: 201 });
  }),

  /**
   * POST /api/v1/auth/login
   * Login user
   */
  http.post(`${BASE_URL}/auth/login`, async ({ request }) => {
    const body = await request.json();

    // Validate input using existing Zod schema
    const parseResult = LoginRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return HttpResponse.json(
        { error: '입력값을 확인해주세요.', details: parseResult.error.issues },
        { status: 400 }
      );
    }

    const { email, password } = parseResult.data;

    // Find user
    const user = mockDB.getUserByEmail(email);
    if (!user) {
      return HttpResponse.json(
        { error: '이메일 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }

    // Check password (in real app, this would use bcrypt)
    if (user.password !== password) {
      return HttpResponse.json(
        { error: '이메일 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }

    // Generate tokens
    const access_token = generateMockToken(user.id);
    const refresh_token = generateMockToken(user.id);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    const response: AuthResponse = {
      message: '로그인에 성공했습니다.',
      user: userWithoutPassword,
      tokens: {
        access_token,
        refresh_token,
      },
    };

    return HttpResponse.json(response, { status: 200 });
  }),

  /**
   * GET /api/v1/auth/me
   * Get current user (requires authentication)
   */
  http.get(`${BASE_URL}/auth/me`, ({ request }) => {
    // Extract user ID from Authorization header
    const authHeader = request.headers.get('Authorization');
    const userId = getUserIdFromAuth(authHeader);

    if (!userId) {
      return HttpResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // Find user
    const user = mockDB.getUserById(userId);
    if (!user) {
      return HttpResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    const response: MeResponse = {
      user: userWithoutPassword,
    };

    return HttpResponse.json(response, { status: 200 });
  }),
];
