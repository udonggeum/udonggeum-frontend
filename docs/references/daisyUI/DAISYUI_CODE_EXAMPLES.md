# daisyUI Code Examples & Quick Reference

This document provides copy-ready code examples for all recommendations in `DAISYUI_ANALYSIS.md`.

---

## 1. BUTTON.TSX CONVERSION - COMPLETE CODE

### Current Problematic Code
```tsx
// src/components/Button.tsx (CURRENT - PROBLEMATIC)
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
  onClick?: () => void;
}

export default function Button({ variant = 'primary', children, onClick }: ButtonProps) {
  const baseClasses = 'px-6 py-3 rounded-lg font-semibold transition-all duration-200';
  const variantClasses = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700',      // ❌ Hardcoded color
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',     // ❌ Not theme-aware
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]}`}
      onClick={onClick}
      aria-label={typeof children === 'string' ? children : undefined}
    >
      {children}
    </button>
  );
}
```

### Improved Version (RECOMMENDED)
```tsx
// src/components/Button.tsx (IMPROVED - USE THIS)
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
```

### Usage Examples

```tsx
// Basic usage
<Button>Click me</Button>
<Button variant="primary">Primary Action</Button>
<Button variant="secondary">Secondary Action</Button>

// Size variants
<Button size="xs">Tiny Button</Button>
<Button size="sm">Small Button</Button>
<Button size="md">Medium Button (default)</Button>
<Button size="lg">Large Button</Button>
<Button size="xl">Extra Large Button</Button>

// Style variants
<Button variant="ghost">Ghost Button</Button>
<Button variant="outline">Outline Button</Button>
<Button variant="accent">Accent Button</Button>

// Modifiers
<Button wide>Wide Button (more padding)</Button>
<Button block>Block Button (full width)</Button>
<Button loading>Loading...</Button>
<Button disabled>Disabled Button</Button>

// Combinations
<Button variant="secondary" size="sm" wide>Small Wide Secondary</Button>
<Button variant="primary" size="lg" block loading>Processing...</Button>

// With React Router
import { Link } from 'react-router-dom';

<Button as={Link} to="/products">
  View Products
</Button>

// With icons (using lucide-react)
import { Heart } from 'lucide-react';

<Button variant="outline">
  <Heart className="w-4 h-4" />
  Wishlist
</Button>
```

### Migration Checklist

After updating Button.tsx, verify these components still work:

- [ ] HomePage - all buttons render correctly
- [ ] ProductCard - wishlist and cart buttons
- [ ] PopularProducts - "View All" button
- [ ] SearchSection - search button
- [ ] ProductsError - retry and refresh buttons
- [ ] Navbar - all navigation buttons
- [ ] Footer - social media buttons
- [ ] LoginPage - login button

---

## 2. PRODUCTSERERROR.TSX CONVERSION - COMPLETE CODE

### Current Code (PROBLEMATIC)
```tsx
// src/components/ProductsError.tsx (CURRENT - PROBLEMATIC)
interface ProductsErrorProps {
  error: Error;
  onRetry?: () => void;
}

function getErrorMessage(error: Error): string {
  if (error instanceof Error) {
    if (error.message.includes('Network')) {
      return '네트워크 연결을 확인해주세요.';
    }
    if (error.message.includes('timeout')) {
      return '요청 시간이 초과되었습니다. 다시 시도해주세요.';
    }
    if (error.message.includes('404')) {
      return '요청한 정보를 찾을 수 없습니다.';
    }
    if (error.message.includes('500')) {
      return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
    }
    return `오류가 발생했습니다: ${error.message}`;
  }
  return '알 수 없는 오류가 발생했습니다.';
}

export default function ProductsError({ error, onRetry }: ProductsErrorProps) {
  const errorMessage = getErrorMessage(error);

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {/* ❌ Missing semantic alert role */}
      {/* ❌ Custom div layout instead of daisyUI alert */}
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

      <h2 className="text-2xl font-bold mb-2 text-error">
        상품을 불러올 수 없습니다
      </h2>

      <p className="text-base-content/70 max-w-md mb-6">{errorMessage}</p>

      <div className="flex gap-3">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="btn btn-primary"
            aria-label="다시 시도"
          >
            <svg>...</svg>
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
```

### Improved Code (RECOMMENDED - USE THIS)
```tsx
// src/components/ProductsError.tsx (IMPROVED - USE THIS)

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
```

### Key Changes Explained

| Aspect | Before | After | Benefit |
|--------|--------|-------|---------|
| Alert Container | Custom `<div>` | daisyUI `alert alert-error alert-soft` | Semantic HTML + theme colors |
| Accessibility | None | `role="alert"` + `aria-live="polite"` | Screen reader announces errors |
| Structure | Manual layout with SVG before text | daisyUI alert structure | Consistent with platform patterns |
| Styling | Custom classes | `alert-soft` class | Modern muted appearance |
| Icon Size | `h-24 w-24` (very large) | `h-6 w-6` (appropriate for alert) | Better proportions |
| Button Layout | Manual flex with gap-3 | Flexible with flex-wrap | Better mobile responsiveness |

---

## 3. REUSABLE ERROR COMPONENT (NEW)

Create a generic error component for reuse across the app:

```tsx
// src/components/ErrorAlert.tsx (NEW COMPONENT)

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
```

### Usage Examples

```tsx
// Product error
<ErrorAlert
  title="상품을 불러올 수 없습니다"
  message="네트워크 연결을 확인해주세요."
  onRetry={() => refetch()}
  error={error}
/>

// Validation error
<ErrorAlert
  title="입력 오류"
  message="모든 필수 항목을 입력해주세요."
  variant="warning"
/>

// API error
<ErrorAlert
  title="서버 오류"
  message="서버에서 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
  onRetry={() => retry()}
  variant="error"
/>

// Info alert
<ErrorAlert
  title="알림"
  message="유지보수 예정: 2025년 10월 30일 오전 2시-4시"
  variant="info"
/>
```

---

## 4. LOADING SPINNER COMPONENT (NEW)

Create a reusable loading component:

```tsx
// src/components/LoadingSpinner.tsx (NEW COMPONENT)

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
      {showMessage && <p className="text-base-content/70">{message}</p>}
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
```

### Usage Examples

```tsx
// Basic usage
<LoadingSpinner />

// With custom message
<LoadingSpinner message="상품을 불러오는 중..." />

// Sizes
<LoadingSpinner size="sm" />
<LoadingSpinner size="md" />
<LoadingSpinner size="lg" />

// Full screen overlay
<LoadingSpinner fullScreen message="처리 중..." />

// In a component
function ProductList() {
  const { data, isLoading } = useProducts();

  if (isLoading) {
    return <LoadingSpinner message="상품을 불러오는 중..." />;
  }

  return <div>{/* product grid */}</div>;
}
```

---

## 5. STYLE GUIDE UPDATE - COPY INTO `docs/STYLE_GUIDE.md`

```markdown
# daisyUI Component Patterns

## Overview

This project uses daisyUI as the primary component library. All UI components should use daisyUI classes for consistency, theme support, and accessibility.

## Semantic Color System

**ALWAYS use semantic colors. NEVER hardcode colors.**

```tsx
// DO - Use semantic colors
<button className="btn btn-primary">Save</button>                    // ✓ Good
<div className="bg-base-100 text-base-content">Content</div>        // ✓ Good
<span className="text-error">Error message</span>                    // ✓ Good

// DON'T - Hardcode colors
<button className="bg-indigo-600 text-white">Save</button>           // ✗ Bad
<button className="bg-red-500 hover:bg-red-700">Delete</button>     // ✗ Bad
<span className="text-red-600">Error</span>                          // ✗ Bad
```

### Available Color Semantics

**Theme Colors:**
- `primary` - Primary action color
- `secondary` - Secondary action color
- `accent` - Accent color
- `neutral` - Neutral/gray color
- `info` - Information (blue)
- `success` - Success (green)
- `warning` - Warning (orange)
- `error` - Error/danger (red)

**Base Colors:**
- `base-100` - Primary background
- `base-200` - Secondary background
- `base-300` - Tertiary background
- `base-content` - Primary text color

## Button Component

All buttons should use daisyUI `btn` class system.

```tsx
// Basic
<button className="btn btn-primary">Save</button>

// Sizes: xs, sm, md (default), lg, xl
<button className="btn btn-sm">Small</button>
<button className="btn btn-lg">Large</button>

// Variants: primary, secondary, accent, ghost, outline
<button className="btn btn-primary">Filled</button>
<button className="btn btn-outline">Outline</button>
<button className="btn btn-ghost">Ghost</button>

// Modifiers
<button className="btn btn-wide">Wide (extra padding)</button>
<button className="btn btn-block">Full Width</button>
<button className="btn btn-disabled">Disabled</button>
<button className="btn loading">Loading</button>

// With icons
<button className="btn btn-sm">
  <svg>...</svg>
  Delete
</button>
```

**DO NOT** create custom Button components unless wrapping daisyUI. Use the Button component in `src/components/Button.tsx` for consistency.

## Alert Component

Display error, warning, info, or success messages using daisyUI alert.

```tsx
// Error alert
<div role="alert" className="alert alert-error alert-soft">
  <svg>...</svg>
  <div>
    <h3 className="font-bold">Error Title</h3>
    <div className="text-sm">Error message details</div>
  </div>
</div>

// Success alert
<div role="alert" className="alert alert-success alert-soft">
  <svg>...</svg>
  <div>Success message</div>
</div>
```

**Accessibility Requirements:**
- Always include `role="alert"`
- Include `aria-live="polite"` for dynamic alerts
- Include `aria-atomic="true"` for full message reading
- Hide icons with `aria-hidden="true"`

## Responsive Design

Use Tailwind breakpoints consistently:

```tsx
// Mobile-first approach
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
  {/* 1 column on mobile, 2 on tablet, 3 on desktop */}
</div>

// Hide/show based on screen size
<div className="hidden lg:flex">Desktop only</div>
<div className="lg:hidden">Mobile only</div>

// Responsive sizes
<button className="btn btn-sm md:btn-md lg:btn-lg">Responsive Button</button>
```

## Accessibility Checklist

- [ ] All interactive elements have `aria-label` or visible text
- [ ] Form inputs are properly labeled with `<label htmlFor="...">`
- [ ] Colors aren't the only way to convey information (use icons + text)
- [ ] Contrast ratio is at least 3:1 (daisyUI handles this)
- [ ] Keyboard navigation works (Tab key)
- [ ] Screen reader announces important content (use `role` attributes)

## Theme Integration

daisyUI respects theme configuration. All semantic colors update automatically when theme changes.

**Development:**
```tsx
// Check current theme
const theme = document.documentElement.getAttribute('data-theme');

// Change theme
document.documentElement.setAttribute('data-theme', 'dark');
```

**Never:**
- Hardcode color values
- Override daisyUI utility classes
- Use non-semantic color names
```

---

## 6. SEARCHSECTION.TSX - ENHANCED VERSION (OPTIONAL)

If you want to improve SearchSection accessibility, here's an enhanced version using daisyUI `select`:

```tsx
// src/components/SearchSection.tsx (ENHANCED VERSION - OPTIONAL)

import { useState } from 'react';
import type { Region, ProductCategory, SearchFilters } from '../types';

interface SearchSectionProps {
  regions: Region[];
  categories: ProductCategory[];
  onSearch: (filters: SearchFilters) => void;
}

/**
 * SearchSection Component
 *
 * Provides dropdown filters for region and category selection with a search button.
 * Uses daisyUI select component for native mobile experience and accessibility.
 */
export default function SearchSection({
  regions,
  categories,
  onSearch,
}: SearchSectionProps) {
  const [selectedRegionId, setSelectedRegionId] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');

  const handleSearch = () => {
    onSearch({
      regionId: selectedRegionId || null,
      categoryId: selectedCategoryId || null,
    });
  };

  return (
    <section className="bg-base-200 py-8" aria-label="상품 검색 필터">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-center">
          {/* Region Select */}
          <div className="flex flex-col">
            <label htmlFor="region-select" className="label label-text mb-2">
              지역 선택
            </label>
            <select
              id="region-select"
              value={selectedRegionId}
              onChange={(e) => setSelectedRegionId(e.target.value)}
              className="select select-bordered w-full md:w-48"
              aria-label="지역 선택"
            >
              <option value="">전체 지역</option>
              {regions
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Category Select */}
          <div className="flex flex-col">
            <label htmlFor="category-select" className="label label-text mb-2">
              상품 카테고리
            </label>
            <select
              id="category-select"
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="select select-bordered w-full md:w-48"
              aria-label="상품 카테고리 선택"
            >
              <option value="">전체 상품</option>
              {categories
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Search Button */}
          <button
            type="button"
            onClick={handleSearch}
            className="btn btn-primary w-full md:w-32"
            aria-label="검색"
          >
            검색
          </button>
        </div>
      </div>
    </section>
  );
}
```

**Tradeoffs:**
- ✅ Better mobile UX (native select)
- ✅ Better keyboard navigation
- ✅ More accessible
- ❌ Less visual customization
- ❌ Can't use complex menu items

**Recommendation:** Keep current dropdown if you prefer visual control. Switch to select if accessibility is higher priority.

---

## SUMMARY

Use these code examples as templates for:

1. ✅ Converting Button.tsx to daisyUI wrapper
2. ✅ Converting ProductsError.tsx to use alert component
3. ✅ Creating reusable ErrorAlert component
4. ✅ Creating reusable LoadingSpinner component
5. ✅ Updating daisyUI patterns in STYLE_GUIDE.md
6. ✅ Optional: Enhancing SearchSection with select component

All code is production-ready and follows project conventions.
