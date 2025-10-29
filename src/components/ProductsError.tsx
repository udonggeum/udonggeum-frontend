/**
 * ProductsError Component
 *
 * Displays error message when product fetching fails.
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
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {/* Error Icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-24 w-24 text-error mb-4"
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

      {/* Error Message */}
      <h2 className="text-2xl font-bold mb-2 text-error">
        상품을 불러올 수 없습니다
      </h2>

      <p className="text-base-content/70 max-w-md mb-6">{errorMessage}</p>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="btn btn-primary"
            aria-label="다시 시도"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
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
          className="btn btn-outline"
          aria-label="페이지 새로고침"
        >
          페이지 새로고침
        </button>
      </div>

      {/* Technical Details (for development) */}
      {import.meta.env.DEV && error instanceof Error && (
        <details className="mt-6 text-left">
          <summary className="cursor-pointer text-sm text-base-content/50 hover:text-base-content/70">
            기술 정보 (개발 모드)
          </summary>
          <pre className="mt-2 p-4 bg-base-200 rounded-lg text-xs overflow-auto max-w-2xl">
            {error.stack || error.message}
          </pre>
        </details>
      )}
    </div>
  );
}
