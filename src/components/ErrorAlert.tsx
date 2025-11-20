/**
 * ErrorAlert Component
 *
 * Reusable error alert using daisyUI.
 * Can be used for product fetch failures, validation errors, API errors, etc.
 */

interface ErrorAlertProps {
  /**
   * Alert title
   * @default '오류가 발생했습니다'
   */
  title?: string;

  /**
   * Error message to display
   */
  message: string;

  /**
   * Callback to retry the failed action
   */
  onRetry?: () => void;

  /**
   * Whether to show technical details (stack trace)
   * Only shown in development mode
   * @default import.meta.env.DEV
   */
  showTechnicalDetails?: boolean;

  /**
   * Error object for technical details
   */
  error?: Error;

  /**
   * Size of the alert
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Color variant
   * @default 'error'
   */
  variant?: 'error' | 'warning' | 'info';
}

export default function ErrorAlert({
  title = '오류가 발생했습니다',
  message,
  onRetry,
  showTechnicalDetails = import.meta.env.DEV,
  error,
  size = 'md',
  variant = 'error',
}: ErrorAlertProps) {
  // Map variant to daisyUI color class
  const variantClasses: Record<string, string> = {
    error: 'alert-error',
    warning: 'alert-warning',
    info: 'alert-info',
  };

  // Size responsive classes
  const sizeClasses: Record<string, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
  };

  return (
    <div className="flex items-center justify-center px-4">
      {/* Alert Container */}
      <div
        role="alert"
        className={`alert ${variantClasses[variant]} alert-soft ${sizeClasses[size]} w-full`}
        aria-live="polite"
        aria-atomic="true"
      >
        {/* Icon */}
        <div>
          {variant === 'error' && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          )}
          {variant === 'warning' && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
          {variant === 'info' && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
        </div>

        {/* Content */}
        <div className="text-left">
          <h2 className="font-bold text-lg">{title}</h2>
          <p className="text-sm mt-1">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-col sm:flex-row">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="btn btn-sm btn-primary"
              aria-label="다시 시도"
            >
              다시 시도
            </button>
          )}
        </div>
      </div>

      {/* Technical Details */}
      {showTechnicalDetails && import.meta.env.DEV && error instanceof Error && (
        <details className="mt-6 text-left max-w-2xl w-full px-4">
          <summary className="cursor-pointer text-sm text-[var(--color-text)]/50 hover:text-[var(--color-text)]/70 font-semibold">
            기술 정보 (개발 모드)
          </summary>
          <pre className="mt-2 p-4 bg-[var(--color-secondary)] rounded-lg text-xs overflow-auto">
            {error.stack || error.message}
          </pre>
        </details>
      )}
    </div>
  );
}
