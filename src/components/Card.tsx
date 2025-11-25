/**
 * Card Component
 * Reusable card component with consistent styling
 */

import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export default function Card({ children, className = '', onClick, hover = false }: CardProps) {
  const baseClasses = 'card bg-[var(--color-secondary)] shadow-md border border-[var(--color-text)]/10';
  const hoverClasses = hover ? 'hover:shadow-xl hover:border-[var(--color-gold)] transition-all cursor-pointer' : '';
  const clickableClasses = onClick ? 'cursor-pointer' : '';

  return (
    <div
      className={`${baseClasses} ${hoverClasses} ${clickableClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CardBody({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`card-body ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <h2 className={`card-title text-[var(--color-text)] ${className}`}>{children}</h2>;
}

export function CardActions({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`card-actions ${className}`}>{children}</div>;
}
