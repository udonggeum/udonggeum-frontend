/**
 * LoadingSpinner Component
 *
 * Displays a loading spinner using daisyUI.
 * Used for async data fetching, form submission, etc.
 */

interface LoadingSpinnerProps {
  /**
   * Loading message
   * @default '로딩 중...'
   */
  message?: string;

  /**
   * Spinner size
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Whether to show message
   * @default true
   */
  showMessage?: boolean;

  /**
   * Full screen overlay mode
   * @default false
   */
  fullScreen?: boolean;
}

export default function LoadingSpinner({
  message = '로딩 중...',
  size = 'md',
  showMessage = true,
  fullScreen = false,
}: LoadingSpinnerProps) {
  // Size classes for spinner
  const sizeClasses: Record<string, string> = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  // Container classes
  const containerClasses = fullScreen
    ? 'fixed inset-0 bg-black/20 z-50'
    : '';

  const contentClasses = 'flex flex-col items-center justify-center gap-4';

  const innerContent = (
    <>
      <span className={`loading loading-spinner text-primary ${sizeClasses[size]}`} />
      {showMessage && <p className="text-[var(--color-text)]/70">{message}</p>}
    </>
  );

  if (fullScreen) {
    return (
      <div className={containerClasses}>
        <div className={`h-full ${contentClasses}`}>{innerContent}</div>
      </div>
    );
  }

  return <div className={contentClasses}>{innerContent}</div>;
}
