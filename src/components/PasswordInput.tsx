import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  label?: string;
  disabled?: boolean;
  autoComplete?: string;
}

/**
 * PasswordInput Component
 *
 * Accessible password input with visibility toggle
 * - Eye icon button to show/hide password
 * - WCAG compliant with aria-label
 * - DaisyUI styling for consistency
 * - Keyboard accessible
 *
 * @example
 * <PasswordInput
 *   id="password"
 *   name="password"
 *   value={password}
 *   onChange={(e) => setPassword(e.target.value)}
 *   error={errors.password}
 *   placeholder="비밀번호 (최소 6자)"
 *   required
 * />
 */
export default function PasswordInput({
  id,
  name,
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  required,
  label = '비밀번호',
  disabled,
  autoComplete,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="form-control w-full">
      <label htmlFor={id} className="label">
        <span className="label-text text-[var(--color-text)]">{label}</span>
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          className={`input input-bordered w-full pr-10 bg-[var(--color-primary)] text-[var(--color-text)] placeholder:text-[var(--color-text)]/40 focus:border-[var(--color-gold)] focus:outline-none [&:-webkit-autofill]:bg-[var(--color-primary)] [&:-webkit-autofill]:text-[var(--color-text)] [&:-webkit-autofill]:shadow-[0_0_0px_1000px_var(--color-primary)_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:var(--color-text)] ${
            error ? 'border-red-400' : 'border-[var(--color-text)]/20'
          }`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보이기'}
          className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-ghost btn-sm btn-circle text-[var(--color-text)]"
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" aria-hidden="true" />
          ) : (
            <Eye className="w-5 h-5" aria-hidden="true" />
          )}
        </button>
      </div>
      {error && (
        <label className="label">
          <span className="label-text-alt text-red-400">{error}</span>
        </label>
      )}
    </div>
  );
}
