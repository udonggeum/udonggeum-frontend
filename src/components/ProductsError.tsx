/**
 * ProductsError Component
 *
 * Displays error message when product fetching fails.
 * Uses daisyUI alert component for semantic HTML and accessibility.
 * Provides retry functionality and user-friendly error messages.
 */

interface ProductsErrorProps {
  /**
   * Error object from the failed request
   */
  error: Error;

  /**
   * Callback function to retry the failed request
   */
  onRetry?: () => void;
}

/**
 * Get user-friendly error message from error object
 */
function getErrorMessage(error: Error): string {
  if (error instanceof Error) {
    // Check for network errors
    if (error.message.includes('Network')) {
      return '네트워크 연결을 확인해주세요.';
    }

    // Check for timeout errors
    if (error.message.includes('timeout')) {
      return '요청 시간이 초과되었습니다. 다시 시도해주세요.';
    }

    // Check for API errors
    if (error.message.includes('404')) {
      return '요청한 정보를 찾을 수 없습니다.';
    }

    if (error.message.includes('500')) {
      return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
    }

    // Return generic error message with details
    return `오류가 발생했습니다: ${error.message}`;
  }

  return '알 수 없는 오류가 발생했습니다.';
}

export default function ProductsError({ error, onRetry }: ProductsErrorProps) {
  const errorMessage = getErrorMessage(error);

  return (
    <div className="flex items-center justify-center py-16 px-4">
      {/* daisyUI Alert Component */}
      <div
        role="alert"
        className="alert alert-error alert-soft w-full max-w-md"
        aria-live="polite"
        aria-atomic="true"
      >
        {/* Alert Icon (left side) */}
        <div>
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
        </div>

        {/* Alert Content (title and message) */}
        <div className="text-left">
          <h2 className="font-bold text-lg">상품을 불러올 수 없습니다</h2>
          <p className="text-sm mt-1">{errorMessage}</p>
        </div>

        {/* Alert Action Buttons (right side, stacked on mobile) */}
        <div className="flex gap-2 flex-wrap flex-col sm:flex-row">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="btn btn-sm btn-primary"
              aria-label="다시 시도"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              다시 시도
            </button>
          )}

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="btn btn-sm btn-outline"
            aria-label="페이지 새로고침"
          >
            새로고침
          </button>
        </div>
      </div>

      {/* Technical Details (for development only) */}
      {import.meta.env.DEV && error instanceof Error && (
        <details className="mt-6 text-left max-w-2xl">
          <summary className="cursor-pointer text-sm text-base-content/50 hover:text-base-content/70 font-semibold">
            기술 정보 (개발 모드)
          </summary>
          <pre className="mt-2 p-4 bg-base-200 rounded-lg text-xs overflow-auto">
            {error.stack || error.message}
          </pre>
        </details>
      )}
    </div>
  );
}
