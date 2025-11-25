/**
 * Select Component
 * Reusable select dropdown with consistent styling
 */

import type { ReactNode } from 'react';

interface SelectProps {
  id?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: ReactNode;
  className?: string;
  label?: string;
  disabled?: boolean;
}

export default function Select({
  id,
  value,
  onChange,
  children,
  className = '',
  label,
  disabled = false,
}: SelectProps) {
  return (
    <div className="form-control w-full">
      {label && (
        <label htmlFor={id} className="label">
          <span className="label-text font-semibold">{label}</span>
        </label>
      )}
      <select
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`select select-bordered bg-[var(--color-secondary)] text-[var(--color-text)] border-[var(--color-text)]/20 w-full ${className}`}
      >
        {children}
      </select>
    </div>
  );
}
