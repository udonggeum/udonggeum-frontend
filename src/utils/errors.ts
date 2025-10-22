import type { ZodError, ZodIssue } from 'zod';

/**
 * Validation error
 * Thrown when input validation fails (typically from Zod validation)
 */
export class ValidationError extends Error {
  details?: unknown;

  constructor(message: string, details?: unknown) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }

  /**
   * Convert Zod error to ValidationError
   * Transforms Zod's detailed error format into user-friendly message
   */
  static fromZod(error: ZodError): ValidationError {
    const messages = error.issues.map(
      (err: ZodIssue) => `${err.path.join('.')}: ${err.message}`
    );
    return new ValidationError(messages.join(', '), error.issues);
  }
}

/**
 * API error
 * Thrown when API request fails with an error response
 */
export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

/**
 * Network error
 * Thrown when network request fails (no response from server)
 */
export class NetworkError extends Error {
  constructor(message = '네트워크 연결을 확인해주세요.') {
    super(message);
    this.name = 'NetworkError';
  }
}

/**
 * Not found error
 * Thrown when requested resource doesn't exist (404)
 */
export class NotFoundError extends Error {
  constructor(resource: string) {
    super(`${resource} not found`);
    this.name = 'NotFoundError';
  }
}
