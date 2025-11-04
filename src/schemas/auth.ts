import { z } from 'zod';
import { AUTH_ERRORS } from '@/constants/errors';

/**
 * User schema
 * Validates user data from API responses and localStorage
 */
export const UserSchema = z.object({
  id: z.number().int().positive(),
  email: z.string().email(AUTH_ERRORS.EMAIL_INVALID),
  name: z.string().min(1, AUTH_ERRORS.NAME_REQUIRED),
  phone: z
    .string()
    .regex(
      /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/,
      AUTH_ERRORS.PHONE_INVALID
    )
    .optional(),
  role: z.enum(['user', 'admin']),
  created_at: z.iso.datetime().optional(),
  updated_at: z.iso.datetime().optional(),
});

export type User = z.infer<typeof UserSchema>;

/**
 * Tokens schema
 * Validates JWT tokens from authentication responses
 * NOTE: These are validated from API responses, NOT user input.
 * If validation fails, it indicates a server error, not a user error.
 */
export const TokensSchema = z.object({
  access_token: z.string().min(1), // Internal validation - no user-facing message needed
  refresh_token: z.string().min(1), // Internal validation - no user-facing message needed
});

export type Tokens = z.infer<typeof TokensSchema>;

/**
 * Auth response schema
 * Validates complete authentication response from login/register endpoints
 */
export const AuthResponseSchema = z.object({
  message: z.string(),
  user: UserSchema,
  tokens: TokensSchema,
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;

/**
 * Login request schema
 * Validates user input for login
 * NOTE: Using 8 character minimum for better security (aligned with RegisterPage)
 */
export const LoginRequestSchema = z.object({
  email: z.string().min(1, AUTH_ERRORS.EMAIL_REQUIRED).email(AUTH_ERRORS.EMAIL_INVALID),
  password: z.string().min(1, AUTH_ERRORS.PASSWORD_REQUIRED).min(8, AUTH_ERRORS.PASSWORD_MIN_LENGTH),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

/**
 * Register request schema
 * Validates user input for registration
 * NOTE: Using 8 character minimum for better security (aligned with RegisterPage)
 */
export const RegisterRequestSchema = z.object({
  email: z.string().min(1, AUTH_ERRORS.EMAIL_REQUIRED).email(AUTH_ERRORS.EMAIL_INVALID),
  password: z.string().min(1, AUTH_ERRORS.PASSWORD_REQUIRED).min(8, AUTH_ERRORS.PASSWORD_MIN_LENGTH),
  name: z.string().min(1, AUTH_ERRORS.NAME_REQUIRED),
  phone: z
    .string()
    .regex(
      /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/,
      AUTH_ERRORS.PHONE_INVALID
    )
    .optional(),
});

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

/**
 * Me response schema
 * Validates response from /auth/me endpoint
 */
export const MeResponseSchema = z.object({
  user: UserSchema,
});

export type MeResponse = z.infer<typeof MeResponseSchema>;
