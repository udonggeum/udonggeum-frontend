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
import { AUTH_ERRORS, AUTH_SUCCESS, ERROR_CODES } from '@/constants/errors';

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
        {
          error: AUTH_ERRORS.VALIDATION_ERROR,
          code: ERROR_CODES.VALIDATION_FAILED,
          // Only include validation details in development for debugging
          ...(import.meta.env.DEV && { details: parseResult.error.issues }),
        },
        { status: 400 }
      );
    }

    const { email, password, name, phone } = parseResult.data;

    // Check if user already exists
    const existingUser = mockDB.getUserByEmail(email);
    if (existingUser) {
      return HttpResponse.json(
        {
          error: AUTH_ERRORS.EMAIL_IN_USE,
          code: ERROR_CODES.EMAIL_IN_USE,
        },
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
    const { password: _password, ...userWithoutPassword } = newUser;

    const response: AuthResponse = {
      message: AUTH_SUCCESS.REGISTER_SUCCESS,
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
        {
          error: AUTH_ERRORS.VALIDATION_ERROR,
          code: ERROR_CODES.VALIDATION_FAILED,
          // Only include validation details in development for debugging
          ...(import.meta.env.DEV && { details: parseResult.error.issues }),
        },
        { status: 400 }
      );
    }

    const { email, password } = parseResult.data;

    // Find user
    const user = mockDB.getUserByEmail(email);
    if (!user) {
      return HttpResponse.json(
        {
          error: AUTH_ERRORS.INVALID_CREDENTIALS,
          code: ERROR_CODES.INVALID_CREDENTIALS,
        },
        { status: 401 }
      );
    }

    // Check password (in real app, this would use bcrypt)
    if (user.password !== password) {
      return HttpResponse.json(
        {
          error: AUTH_ERRORS.INVALID_CREDENTIALS,
          code: ERROR_CODES.INVALID_CREDENTIALS,
        },
        { status: 401 }
      );
    }

    // Generate tokens
    const access_token = generateMockToken(user.id);
    const refresh_token = generateMockToken(user.id);

    // Remove password from response
    const { password: _password, ...userWithoutPassword } = user;

    const response: AuthResponse = {
      message: AUTH_SUCCESS.LOGIN_SUCCESS,
      user: userWithoutPassword,
      tokens: {
        access_token,
        refresh_token,
      },
    };

    return HttpResponse.json(response, { status: 200 });
  }),

  /**
   * POST /api/v1/auth/logout
   * Logout user (clears session on backend)
   */
  http.post(`${BASE_URL}/auth/logout`, () => {
    // Return 204 No Content for successful logout
    return new HttpResponse(null, { status: 204 });
  }),

  /**
   * POST /api/v1/auth/refresh
   * Refresh access token using refresh token
   */
  http.post(`${BASE_URL}/auth/refresh`, async ({ request }) => {
    const body = (await request.json()) as { refresh_token: string };

    // Validate refresh token format
    if (!body.refresh_token) {
      return HttpResponse.json(
        {
          error: AUTH_ERRORS.SESSION_EXPIRED,
          code: ERROR_CODES.SESSION_EXPIRED,
        },
        { status: 401 }
      );
    }

    // Handle special test tokens for integration tests
    if (body.refresh_token === 'valid-refresh-token') {
      // Return new tokens for test user ID 1
      const access_token = generateMockToken(1);
      const refresh_token = generateMockToken(1);

      return HttpResponse.json(
        {
          access_token,
          refresh_token,
        },
        { status: 200 }
      );
    }

    // Extract user ID from token
    const userId = getUserIdFromAuth(`Bearer ${body.refresh_token}`);

    if (!userId) {
      return HttpResponse.json(
        {
          error: AUTH_ERRORS.SESSION_EXPIRED,
          code: ERROR_CODES.SESSION_EXPIRED,
        },
        { status: 401 }
      );
    }

    // Generate new tokens
    const access_token = generateMockToken(userId);
    const refresh_token = generateMockToken(userId);

    return HttpResponse.json(
      {
        access_token,
        refresh_token,
      },
      { status: 200 }
    );
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
        {
          error: AUTH_ERRORS.UNAUTHORIZED,
          code: ERROR_CODES.UNAUTHORIZED,
        },
        { status: 401 }
      );
    }

    // Find user
    const user = mockDB.getUserById(userId);
    if (!user) {
      // SECURITY: Don't reveal if user exists - use generic auth failure message
      // This prevents user enumeration attacks
      return HttpResponse.json(
        {
          error: AUTH_ERRORS.AUTH_FAILED,
          code: ERROR_CODES.AUTH_FAILED,
        },
        { status: 401 }
      );
    }

    // Remove password from response
    const { password: _password, ...userWithoutPassword } = user;

    const response: MeResponse = {
      user: userWithoutPassword,
    };

    return HttpResponse.json(response, { status: 200 });
  }),

  /**
   * Test endpoints for token refresh integration tests
   * These handlers simulate protected endpoints that require authentication
   */
  http.get(`${BASE_URL}/test-protected-endpoint`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    const userId = getUserIdFromAuth(authHeader);

    // If token is "expired-access-token", return 401 to trigger refresh
    if (authHeader?.includes('expired-access-token')) {
      return HttpResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    if (!userId) {
      return HttpResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    return HttpResponse.json({ message: 'Success', data: { userId } }, { status: 200 });
  }),

  http.get(`${BASE_URL}/test-endpoint`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    // Handle special test tokens
    if (authHeader?.includes('test-access-token')) {
      return HttpResponse.json({ message: 'Success', data: { userId: 1 } }, { status: 200 });
    }

    const userId = getUserIdFromAuth(authHeader);

    if (!userId) {
      return HttpResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    return HttpResponse.json({ message: 'Success', data: { userId } }, { status: 200 });
  }),

  http.get(`${BASE_URL}/endpoint1`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    // If token is "expired-access-token", return 401
    if (authHeader?.includes('expired-access-token')) {
      return HttpResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    return HttpResponse.json({ message: 'Endpoint 1 success' }, { status: 200 });
  }),

  http.get(`${BASE_URL}/endpoint2`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    // If token is "expired-access-token", return 401
    if (authHeader?.includes('expired-access-token')) {
      return HttpResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    return HttpResponse.json({ message: 'Endpoint 2 success' }, { status: 200 });
  }),

  http.get(`${BASE_URL}/endpoint3`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    // If token is "expired-access-token", return 401
    if (authHeader?.includes('expired-access-token')) {
      return HttpResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    return HttpResponse.json({ message: 'Endpoint 3 success' }, { status: 200 });
  }),
];
