// src/components/Button.tsx (IMPROVED - daisyUI Wrapper)
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Button style variant
   * Uses daisyUI color system: primary (default), secondary, ghost, outline, accent, circle, link, error, danger
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'accent' | 'circle' | 'link' | 'error' | 'danger';

  /**
   * Button size
   * @default 'md'
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';

  /**
   * Full width button
   * @default false
   */
  block?: boolean;

  /**
   * Wide button (increased horizontal padding)
   * @default false
   */
  wide?: boolean;

  /**
   * Loading state (shows spinner)
   * @default false
   */
  loading?: boolean;

  /**
   * Disabled state
   * @default false
   */
  disabled?: boolean;

  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  block = false,
  wide = false,
  loading = false,
  disabled = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  // Map variant prop to custom gold theme classes
  const variantClasses: Record<string, string> = {
    primary: 'bg-[var(--color-gold)] hover:bg-[var(--color-gold)]/80 text-[var(--color-primary)] border-[var(--color-gold)]',
    secondary: 'bg-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/80 text-[var(--color-text)] border-[var(--color-text)]/20',
    ghost: 'btn-ghost text-[var(--color-text)]',
    outline: 'border-[var(--color-gold)] text-[var(--color-gold)] hover:bg-[var(--color-gold)] hover:text-[var(--color-primary)]',
    accent: 'bg-[var(--color-gold)] hover:bg-[var(--color-gold)]/80 text-[var(--color-primary)] border-[var(--color-gold)]',
    circle: 'btn-ghost btn-circle text-[var(--color-text)]',
    link: 'btn-link text-[var(--color-text)]/70',
    error: 'btn-error btn-outline',
    danger: 'btn-ghost text-[var(--color-gold)]',
  };

  // Build className string with daisyUI classes
  const baseClasses = 'btn';
  const sizeClasses = `btn-${size}`;
  const blockClasses = block ? 'w-full' : '';
  const wideClasses = wide ? 'btn-wide' : '';
  const loadingClasses = loading ? 'loading' : '';
  const variantClass = variantClasses[variant] || variantClasses.primary;

  const finalClassName = [
    baseClasses,
    variantClass,
    sizeClasses,
    wideClasses,
    blockClasses,
    loadingClasses,
    'transition-all duration-200',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={finalClassName}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {children}
    </button>
  );
}
