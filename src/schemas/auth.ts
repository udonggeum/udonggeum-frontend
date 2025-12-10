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
  nickname: z.string().min(2, '닉네임은 최소 2자 이상이어야 합니다').max(20, '닉네임은 최대 20자까지 가능합니다'),
  phone: z
    .string()
    .regex(
      /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/,
      AUTH_ERRORS.PHONE_INVALID
    )
    .optional(),
  address: z.string().optional(), // 사용자 주소
  role: z.enum(['user', 'admin']),
  store_id: z.number().int().positive().optional().nullable(), // 매장 사장님의 매장 ID
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

/**
 * Update profile request schema
 * Validates user input for profile update
 * NOTE: Only name, nickname, and phone can be updated (email and password have separate flows)
 */
export const UpdateProfileRequestSchema = z.object({
  name: z.string().min(1, AUTH_ERRORS.NAME_REQUIRED).optional(),
  nickname: z.string().min(2, '닉네임은 최소 2자 이상이어야 합니다').max(20, '닉네임은 최대 20자까지 가능합니다').optional(),
  phone: z
    .string()
    .regex(
      /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/,
      AUTH_ERRORS.PHONE_INVALID
    )
    .optional(),
  address: z.string()
    .optional(),
});

export type UpdateProfileRequest = z.infer<typeof UpdateProfileRequestSchema>;

/**
 * Update profile response schema
 * Validates response from PUT /auth/me endpoint
 */
export const UpdateProfileResponseSchema = z.object({
  message: z.string(),
  user: UserSchema,
});

export type UpdateProfileResponse = z.infer<typeof UpdateProfileResponseSchema>;

/**
 * Forgot password request schema
 * Validates user input for password reset request
 */
export const ForgotPasswordRequestSchema = z.object({
  email: z.string().min(1, AUTH_ERRORS.EMAIL_REQUIRED).email(AUTH_ERRORS.EMAIL_INVALID),
});

export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordRequestSchema>;

/**
 * Reset password request schema
 * Validates user input for password reset (token + new password)
 */
export const ResetPasswordRequestSchema = z.object({
  token: z.string().min(1, '재설정 토큰이 필요합니다'),
  password: z.string().min(1, AUTH_ERRORS.PASSWORD_REQUIRED).min(8, AUTH_ERRORS.PASSWORD_MIN_LENGTH),
});

export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>;

/**
 * Message response schema
 * Validates generic success/error messages from API endpoints
 */
export const MessageResponseSchema = z.object({
  message: z.string(),
});

export type MessageResponse = z.infer<typeof MessageResponseSchema>;

/**
 * Check nickname request schema
 * Validates nickname for duplicate check
 */
export const CheckNicknameRequestSchema = z.object({
  nickname: z.string().min(2, '닉네임은 최소 2자 이상이어야 합니다').max(20, '닉네임은 최대 20자까지 가능합니다'),
});

export type CheckNicknameRequest = z.infer<typeof CheckNicknameRequestSchema>;

/**
 * Check nickname response schema
 * Validates response from nickname duplicate check
 */
export const CheckNicknameResponseSchema = z.object({
  available: z.boolean(),
  message: z.string(),
});

export type CheckNicknameResponse = z.infer<typeof CheckNicknameResponseSchema>;
