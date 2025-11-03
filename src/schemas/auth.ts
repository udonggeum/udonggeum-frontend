import { z } from 'zod';

const PHONE_REGEX = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;

/**
 * Optional phone schema
 * Trims input and allows empty strings/nullish values to be treated as undefined
 */
const OptionalPhoneSchema = z.preprocess(
  (value) => {
    if (typeof value !== 'string') {
      return value ?? undefined;
    }
    const trimmed = value.trim();
    return trimmed.length === 0 ? undefined : trimmed;
  },
  z
    .string()
    .regex(PHONE_REGEX, '올바른 전화번호 형식이 아닙니다')
    .optional()
);

/**
 * Timestamp schema
 * Accepts string/number/Date and normalizes to ISO string
 */
const TimestampSchema = z
  .union([z.string(), z.number(), z.date(), z.null()])
  .optional()
  .transform((value) => {
    if (value instanceof Date) {
      return value.toISOString();
    }
    if (typeof value === 'number') {
      return new Date(value).toISOString();
    }
    if (typeof value === 'string') {
      const parsed = new Date(value);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toISOString();
      }
    }
    return new Date().toISOString();
  });

/**
 * User schema
 * Validates user data from API responses and localStorage
 */
export const UserSchema = z.object({
  id: z.number().int().positive(),
  email: z.string().email('유효한 이메일을 입력하세요'),
  name: z.string().min(1, '이름을 입력하세요'),
  phone: OptionalPhoneSchema,
  role: z.enum(['user', 'admin']),
  created_at: TimestampSchema,
  updated_at: TimestampSchema,
});

export type User = z.infer<typeof UserSchema>;

/**
 * Tokens schema
 * Validates JWT tokens from authentication responses
 */
export const TokensSchema = z.object({
  access_token: z.string().min(1, 'Access token is required'),
  refresh_token: z.string().min(1, 'Refresh token is required'),
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
 */
export const LoginRequestSchema = z.object({
  email: z.string().email('유효한 이메일을 입력하세요'),
  password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다'),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

/**
 * Register request schema
 * Validates user input for registration
 */
export const RegisterRequestSchema = z.object({
  email: z.string().email('유효한 이메일을 입력하세요'),
  password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다'),
  name: z.string().min(1, '이름을 입력하세요'),
  phone: OptionalPhoneSchema,
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

/**
 * Logout response schema
 * Validates response from /auth/logout endpoint
 */
