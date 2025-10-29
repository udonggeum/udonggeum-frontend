// src/components/Button.tsx (IMPROVED - daisyUI Wrapper)
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Button style variant
   * Uses daisyUI color system: primary (default), secondary, ghost, outline, accent
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'accent';

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
  // Map variant prop to daisyUI classes
  const variantClasses: Record<string, string> = {
    primary: 'btn-primary',      // Theme-aware primary color
    secondary: 'btn-secondary',  // Theme-aware secondary color
    ghost: 'btn-ghost',          // Transparent with hover effect
    outline: 'btn-outline',      // Bordered style
    accent: 'btn-accent',        // Theme-aware accent color
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
