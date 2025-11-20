/**
 * LoginPage Component
 * Handles user login with client-side validation and redirect support
 */

import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useLogin } from '@/hooks/queries/useAuthQueries';
import { LoginRequestSchema, type LoginRequest } from '@/schemas/auth';
import { ZodError } from 'zod';
import PasswordInput from '@/components/PasswordInput';

interface FormErrors {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const { mutate: login, isPending, isError, error } = useLogin();

  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: '',
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Redirect authenticated users away from login page
  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectParam = searchParams.get('redirect');
      if (redirectParam) {
        void navigate(redirectParam, { replace: true });
      } else {
        // Redirect based on user role
        const defaultPath = user.role === 'admin' ? '/seller/dashboard' : '/';
        void navigate(defaultPath, { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, searchParams]);

  /**
   * Validate a single field
   */
  const validateField = (name: string, value: string): string | undefined => {
    try {
      if (name === 'email') {
        LoginRequestSchema.pick({ email: true }).parse({ email: value });
      } else if (name === 'password') {
        LoginRequestSchema.pick({ password: true }).parse({ password: value });
      }
      return undefined;
    } catch (err: unknown) {
      if (err instanceof ZodError && err.issues.length > 0) {
        return err.issues[0]?.message;
      }

      return '유효하지 않은 값입니다.';
    }
  };

  /**
   * Validate entire form
   */
  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    // Validate email
    const emailError = validateField('email', formData.email);
    if (emailError) {
      errors.email = emailError;
      isValid = false;
    }

    // Validate password
    const passwordError = validateField('password', formData.password);
    if (passwordError) {
      errors.password = passwordError;
      isValid = false;
    }

    setFormErrors(errors);
    setTouched({ email: true, password: true });

    return isValid;
  };

  /**
   * Handle input change
   */
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field if it exists
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  /**
   * Handle input blur (mark field as touched)
   */
  const handleBlur = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    // Validate field on blur
    const error = validateField(name, value);
    if (error) {
      setFormErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Parse and validate data with Zod
    const validatedData = LoginRequestSchema.parse(formData);

    // Get redirect URL from query params
    const redirectParam = searchParams.get('redirect');

    // Call login mutation
    login(validatedData, {
      onSuccess: (response) => {
        // If redirect parameter exists, use it
        if (redirectParam) {
          void navigate(redirectParam, { replace: true });
          return;
        }

        // Otherwise, redirect based on user role
        const defaultPath = response.user.role === 'admin'
          ? '/seller/dashboard'
          : '/';
        void navigate(defaultPath, { replace: true });
      },
    });
  };

  return (
    <div className="w-full max-w-md">
      <div className="card shadow-xl bg-[var(--color-secondary)]">
        <div className="card-body">
          {/* Header with icon */}
          <div className="flex flex-col items-center mb-6">
            <LogIn className="w-12 h-12 mb-3 text-[var(--color-gold)]" aria-hidden="true" />
            <h1 className="text-2xl font-bold text-[var(--color-text)]">
              로그인
            </h1>
            <p className="text-sm mt-1 text-[var(--color-text)] opacity-70">
              우동금 서비스에 로그인하세요
            </p>
          </div>

          {/* Error Alert */}
          {isError && error && (
            <div role="alert" aria-label="error" className="alert alert-error mb-4">
              <span>{error.message}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} noValidate>
            {/* Email Input */}
            <div className="form-control w-full mb-4">
              <label htmlFor="email" className="label">
                <span className="label-text text-[var(--color-text)]">
                  이메일
                </span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="example@email.com"
                required
                className={`input input-bordered w-full bg-[var(--color-primary)] text-[var(--color-text)] ${
                  touched.email && formErrors.email
                    ? 'border-red-400'
                    : 'border-[var(--color-text)]/20'
                }`}
              />
              {touched.email && formErrors.email && (
                <label className="label">
                  <span className="label-text-alt text-red-400">
                    {formErrors.email}
                  </span>
                </label>
              )}
            </div>

            {/* Password Input */}
            <div className="mb-2">
              <PasswordInput
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.password ? formErrors.password : undefined}
                placeholder="비밀번호를 입력하세요"
                required
                label="비밀번호"
              />
            </div>

            {/* Forgot Password Link */}
            <div className="text-right mb-6">
              <Link to="/forgot-password" className="link text-sm text-[var(--color-gold)] hover:opacity-80">
                비밀번호를 잊으셨나요?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="btn w-full mb-4 bg-[var(--color-gold)] text-[var(--color-primary)] border-none hover:opacity-80"
            >
              {isPending ? '로그인 중...' : '로그인'}
            </button>

            {/* Register Link */}
            <div className="text-center text-sm">
              <span className="text-[var(--color-text)] opacity-70">계정이 없으신가요? </span>
              <Link to="/register" className="link text-[var(--color-gold)] hover:opacity-80">
                회원가입
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
