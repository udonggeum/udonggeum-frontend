/**
 * Authentication Error Messages and Codes
 * Centralized error message constants for consistency and easy maintenance
 *
 * Usage:
 * - Import in Zod schemas, components, MSW handlers, and tests
 * - Use constants instead of hardcoded strings
 * - Error codes help with tracking and debugging
 */

/**
 * Error Codes for Tracking
 * Format: AUTH_XXX for authentication errors
 */
export const ERROR_CODES = {
  // Form validation errors (001-099)
  VALIDATION_FAILED: 'AUTH_001',
  EMAIL_REQUIRED: 'AUTH_002',
  EMAIL_INVALID: 'AUTH_003',
  PASSWORD_REQUIRED: 'AUTH_004',
  PASSWORD_TOO_SHORT: 'AUTH_005',
  PASSWORD_WEAK: 'AUTH_006',
  PASSWORD_CONFIRM_REQUIRED: 'AUTH_007',
  PASSWORD_MISMATCH: 'AUTH_008',
  NAME_REQUIRED: 'AUTH_009',
  PHONE_REQUIRED: 'AUTH_010',
  PHONE_INVALID: 'AUTH_011',

  // API/Business logic errors (100-199)
  EMAIL_IN_USE: 'AUTH_100',
  INVALID_CREDENTIALS: 'AUTH_101',
  SESSION_EXPIRED: 'AUTH_102',
  UNAUTHORIZED: 'AUTH_103',
  AUTH_FAILED: 'AUTH_104',
  USER_NOT_FOUND: 'AUTH_105',

  // System errors (900-999)
  NETWORK_ERROR: 'SYS_900',
  SERVER_ERROR: 'SYS_901',
  NOT_FOUND: 'SYS_902',
} as const;

/**
 * Authentication Error Messages
 * User-facing Korean error messages
 */
export const AUTH_ERRORS = {
  // ============================================
  // FORM VALIDATION ERRORS
  // These are shown during form input validation
  // ============================================

  /** 이메일 필드가 비어있을 때 */
  EMAIL_REQUIRED: '이메일을 입력하세요',

  /** 이메일 형식이 올바르지 않을 때 */
  EMAIL_INVALID: '유효한 이메일을 입력하세요',

  /** 비밀번호 필드가 비어있을 때 */
  PASSWORD_REQUIRED: '비밀번호를 입력하세요',

  /** 비밀번호가 최소 길이 미만일 때 (8자 기준) */
  PASSWORD_MIN_LENGTH: '비밀번호는 최소 8자 이상이어야 합니다',

  /** 비밀번호가 복잡도 요구사항을 충족하지 못할 때 */
  PASSWORD_COMPLEXITY: '비밀번호는 영문 대소문자, 숫자를 포함해야 합니다',

  /** 비밀번호 확인 필드가 비어있을 때 */
  PASSWORD_CONFIRM_REQUIRED: '비밀번호 확인을 입력하세요',

  /** 비밀번호와 비밀번호 확인이 일치하지 않을 때 */
  PASSWORD_MISMATCH: '비밀번호가 일치하지 않습니다',

  /** 이름 필드가 비어있을 때 */
  NAME_REQUIRED: '이름을 입력하세요',

  /** 휴대폰 번호 필드가 비어있을 때 (선택 필드이지만 입력 시) */
  PHONE_REQUIRED: '휴대폰 번호를 입력하세요',

  /** 휴대폰 번호 형식이 올바르지 않을 때 */
  PHONE_INVALID: '올바른 전화번호 형식이 아닙니다',

  /** 일반적인 입력 검증 실패 메시지 */
  VALIDATION_ERROR: '입력값을 확인해주세요',

  // ============================================
  // API/BUSINESS LOGIC ERRORS
  // These are returned from API calls
  // ============================================

  /** 회원가입 시 이메일이 이미 사용 중일 때 (409 Conflict) */
  EMAIL_IN_USE: '이미 사용 중인 이메일입니다',

  /** 로그인 시 이메일 또는 비밀번호가 틀렸을 때 (401 Unauthorized) */
  INVALID_CREDENTIALS: '이메일 또는 비밀번호가 올바르지 않습니다',

  /** 토큰이 만료되어 재로그인이 필요할 때 (401 Unauthorized) */
  SESSION_EXPIRED: '세션이 만료되었습니다. 다시 로그인해주세요',

  /** 인증이 필요한 요청에 토큰이 없을 때 (401 Unauthorized) */
  UNAUTHORIZED: '인증이 필요합니다',

  /**
   * 일반적인 인증 실패 메시지 (사용자 열거 공격 방지)
   * 사용자 존재 여부를 노출하지 않기 위해 사용
   */
  AUTH_FAILED: '인증에 실패했습니다',

  // ============================================
  // SYSTEM ERRORS
  // Generic system-level errors
  // ============================================

  /** 네트워크 연결 실패 */
  NETWORK_ERROR: '네트워크 연결을 확인해주세요',

  /** 서버 내부 오류 (500) */
  SERVER_ERROR: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요',

  /** 요청한 리소스를 찾을 수 없음 (404) */
  NOT_FOUND: '요청한 정보를 찾을 수 없습니다',

  /** 접근 권한 없음 (403) */
  FORBIDDEN: '접근 권한이 없습니다',
} as const;

/**
 * Success Messages
 * User-facing Korean success messages
 */
export const AUTH_SUCCESS = {
  /** 회원가입 완료 */
  REGISTER_SUCCESS: '회원가입이 완료되었습니다',

  /** 로그인 성공 */
  LOGIN_SUCCESS: '로그인에 성공했습니다',

  /** 로그아웃 완료 */
  LOGOUT_SUCCESS: '로그아웃되었습니다',
} as const;

/**
 * Type for auth error messages
 */
export type AuthErrorMessage = typeof AUTH_ERRORS[keyof typeof AUTH_ERRORS];

/**
 * Type for error codes
 */
export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

/**
 * API Error Response Structure
 * Standard format for error responses from API
 */
export interface ApiErrorResponse {
  /** User-facing error message */
  error: string;
  /** Error code for tracking */
  code?: ErrorCode;
  /** Additional details (only in development) */
  details?: unknown;
}
