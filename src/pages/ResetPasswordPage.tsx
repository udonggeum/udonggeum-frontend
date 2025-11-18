/**
 * ResetPasswordPage Component
 * Allows users to reset their password using a token from email
 */

import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';
import { useResetPassword } from '@/hooks/queries';
import { ResetPasswordRequestSchema } from '@/schemas/auth';
import PasswordInput from '@/components/PasswordInput';
import { AUTH_ERRORS } from '@/constants/errors';

interface FormData {
  password: string;
  passwordConfirm: string;
}

interface FormErrors {
  password?: string;
  passwordConfirm?: string;
  token?: string;
}

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const { mutate: resetPassword, isPending, isError, error, isSuccess } = useResetPassword();

  const [formData, setFormData] = useState<FormData>({
    password: '',
    passwordConfirm: '',
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Validate token exists
  useEffect(() => {
    if (!token) {
      setFormErrors((prev) => ({
        ...prev,
        token: '유효하지 않은 재설정 링크입니다.',
      }));
    }
  }, [token]);

  // Redirect to login on success
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        void navigate('/login');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, navigate]);

  /**
   * Validate a single field
   */
  const validateField = (name: string, value: string): string | undefined => {
    try {
      if (name === 'password') {
        ResetPasswordRequestSchema.pick({ password: true }).parse({ password: value });
      } else if (name === 'passwordConfirm') {
        if (value !== formData.password) {
          return AUTH_ERRORS.PASSWORD_MISMATCH;
        }
      }
      return undefined;
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'issues' in err) {
        const issues = (err as { issues: Array<{ message: string }> }).issues;
        if (issues && issues.length > 0) {
          return issues[0].message;
        }
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

    // Validate password
    const passwordError = validateField('password', formData.password);
    if (passwordError) {
      errors.password = passwordError;
      isValid = false;
    }

    // Validate password confirmation
    const passwordConfirmError = validateField('passwordConfirm', formData.passwordConfirm);
    if (passwordConfirmError) {
      errors.passwordConfirm = passwordConfirmError;
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  /**
   * Handle input change
   */
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field if touched
    if (touched[name]) {
      const error = validateField(name, value);
      setFormErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  /**
   * Handle input blur
   */
  const handleBlur = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setTouched((prev) => ({ ...prev, [name]: true }));

    const error = validateField(name, value);
    setFormErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  /**
   * Handle form submit
   */
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Check token validity
    if (!token) {
      return;
    }

    // Mark all fields as touched
    setTouched({
      password: true,
      passwordConfirm: true,
    });

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Submit
    resetPassword({ token, password: formData.password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <Link to="/login" className="btn btn-ghost btn-sm btn-circle">
              <ArrowLeft size={20} />
            </Link>
            <h2 className="card-title text-2xl">비밀번호 재설정</h2>
          </div>

          {/* Success Message */}
          {isSuccess && (
            <div className="alert alert-success mb-4">
              <Lock size={20} />
              <div>
                <div className="font-semibold">비밀번호가 변경되었습니다.</div>
                <div className="text-sm">잠시 후 로그인 페이지로 이동합니다...</div>
              </div>
            </div>
          )}

          {/* Token Error */}
          {formErrors.token && (
            <div className="alert alert-error mb-4">
              <span>{formErrors.token}</span>
            </div>
          )}

          {/* API Error */}
          {isError && (
            <div className="alert alert-error mb-4">
              <span>{error instanceof Error ? error.message : '오류가 발생했습니다.'}</span>
            </div>
          )}

          {!isSuccess && !formErrors.token && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-base-content/70">
                새로운 비밀번호를 입력하세요.
              </p>

              {/* Password Field */}
              <div className="form-control">
                <label htmlFor="password" className="label">
                  <span className="label-text">새 비밀번호</span>
                </label>
                <PasswordInput
                  id="password"
                  name="password"
                  placeholder="최소 8자 이상"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isPending}
                  error={touched.password ? formErrors.password : undefined}
                  autoComplete="new-password"
                />
              </div>

              {/* Password Confirm Field */}
              <div className="form-control">
                <label htmlFor="passwordConfirm" className="label">
                  <span className="label-text">비밀번호 확인</span>
                </label>
                <PasswordInput
                  id="passwordConfirm"
                  name="passwordConfirm"
                  placeholder="비밀번호를 다시 입력하세요"
                  value={formData.passwordConfirm}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isPending}
                  error={touched.passwordConfirm ? formErrors.passwordConfirm : undefined}
                  autoComplete="new-password"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary w-full gap-2"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    변경 중...
                  </>
                ) : (
                  <>
                    <Lock size={20} />
                    비밀번호 변경
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer Links */}
          <div className="divider"></div>
          <div className="text-center">
            <Link to="/login" className="link link-primary text-sm">
              로그인 페이지로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
