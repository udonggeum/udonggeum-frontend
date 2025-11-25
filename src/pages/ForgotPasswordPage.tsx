/**
 * ForgotPasswordPage Component
 * Allows users to request a password reset email
 */

import { useState, type FormEvent, type ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { useForgotPassword } from '@/hooks/queries';
import { ForgotPasswordRequestSchema, type ForgotPasswordRequest } from '@/schemas/auth';
import Button from '@/components/Button';

interface FormErrors {
  email?: string;
}

export default function ForgotPasswordPage() {
  const { mutate: forgotPassword, isPending, isError, error, isSuccess } = useForgotPassword();

  const [formData, setFormData] = useState<ForgotPasswordRequest>({
    email: '',
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  /**
   * Validate a single field
   */
  const validateField = (name: string, value: string): string | undefined => {
    try {
      if (name === 'email') {
        ForgotPasswordRequestSchema.pick({ email: true }).parse({ email: value });
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

    // Validate email
    const emailError = validateField('email', formData.email);
    if (emailError) {
      errors.email = emailError;
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

    // Mark all fields as touched
    setTouched({
      email: true,
    });

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Submit
    forgotPassword(formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-secondary)] px-4">
      <div className="card w-full max-w-md bg-[var(--color-primary)] shadow-xl">
        <div className="card-body">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <Link to="/login">
              <Button variant="circle" size="sm">
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <h2 className="card-title text-2xl">비밀번호 찾기</h2>
          </div>

          {/* Success Message */}
          {isSuccess && (
            <div className="alert alert-success mb-4">
              <Mail size={20} />
              <span>이메일로 비밀번호 재설정 링크를 전송했습니다.</span>
            </div>
          )}

          {/* Error Message */}
          {isError && (
            <div className="alert alert-error mb-4">
              <span>{error instanceof Error ? error.message : '오류가 발생했습니다.'}</span>
            </div>
          )}

          {!isSuccess && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-[var(--color-text)]/70">
                가입하신 이메일 주소를 입력하시면, 비밀번호 재설정 링크를 보내드립니다.
              </p>

              {/* Email Field */}
              <div className="form-control">
                <label htmlFor="email" className="label">
                  <span className="label-text">이메일</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="user@example.com"
                  className={`input input-bordered ${touched.email && formErrors.email ? 'input-error' : ''}`}
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isPending}
                  autoComplete="email"
                />
                {touched.email && formErrors.email && (
                  <label className="label">
                    <span className="label-text-alt text-error">{formErrors.email}</span>
                  </label>
                )}
              </div>

              {/* Submit Button */}
              <Button type="submit" variant="primary" block className="gap-2"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    전송 중...
                  </>
                ) : (
                  <>
                    <Mail size={20} />
                    재설정 링크 전송
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Footer Links */}
          <div className="divider"></div>
          <div className="text-center space-y-2">
            <Link to="/login" className="link link-primary text-sm">
              로그인 페이지로 돌아가기
            </Link>
            <div className="text-sm text-[var(--color-text)]/70">
              계정이 없으신가요?{' '}
              <Link to="/register" className="link link-primary">
                회원가입
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
