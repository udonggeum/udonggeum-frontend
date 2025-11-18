/**
 * ProfileEditPage Component
 * Allows authenticated users to update their profile information (name, phone)
 */

import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { User as UserIcon, ArrowLeft, Save } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useUpdateProfile } from '@/hooks/queries/useAuthQueries';
import { UpdateProfileRequestSchema, type UpdateProfileRequest } from '@/schemas/auth';
import { Navbar, Footer, ErrorAlert, LoadingSpinner } from '@/components';
import { NAV_ITEMS } from '@/constants/navigation';

interface FormErrors {
  name?: string;
  phone?: string;
}

export default function ProfileEditPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { mutate: updateProfile, isPending, isError, error, isSuccess } = useUpdateProfile();

  const [formData, setFormData] = useState<UpdateProfileRequest>({
    name: user?.name || '',
    phone: user?.phone || '',
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Navigate back to MyPage on success
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        navigate('/mypage');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, navigate]);

  /**
   * Validate a single field
   */
  const validateField = (name: string, value: string): string | undefined => {
    try {
      if (name === 'name') {
        UpdateProfileRequestSchema.pick({ name: true }).parse({ name: value });
      } else if (name === 'phone') {
        // Allow empty phone (it's optional)
        if (value === '') return undefined;
        UpdateProfileRequestSchema.pick({ phone: true }).parse({ phone: value });
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

    // Validate name
    const nameError = validateField('name', formData.name);
    if (nameError) {
      errors.name = nameError;
      isValid = false;
    }

    // Validate phone (if provided)
    if (formData.phone) {
      const phoneError = validateField('phone', formData.phone);
      if (phoneError) {
        errors.phone = phoneError;
        isValid = false;
      }
    }

    setFormErrors(errors);
    return isValid;
  };

  /**
   * Handle input change
   */
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  /**
   * Handle input blur (mark as touched and validate)
   */
  const handleBlur = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    // Validate on blur
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

    // Mark all fields as touched
    setTouched({ name: true, phone: true });

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Submit form
    updateProfile(formData);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-base-100">
      <Navbar navigationItems={NAV_ITEMS} />

      <main className="flex-grow">
        <section className="container mx-auto px-4 py-10">
          {/* Page Header */}
          <div className="mb-8">
            <button
              type="button"
              onClick={() => navigate('/mypage')}
              className="btn btn-ghost btn-sm gap-2 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              마이페이지로 돌아가기
            </button>
            <h1 className="text-3xl font-bold">프로필 수정</h1>
            <p className="mt-2 text-base-content/70">
              회원 정보를 수정하세요
            </p>
          </div>

          {/* Form Card */}
          <div className="card bg-base-100 shadow-xl max-w-2xl mx-auto">
            <div className="card-body">
              {/* Success Message */}
              {isSuccess && (
                <div className="alert alert-success mb-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="stroke-current shrink-0 h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>프로필이 성공적으로 업데이트되었습니다!</span>
                </div>
              )}

              {/* Error Alert */}
              {isError && error && (
                <div className="mb-6">
                  <ErrorAlert
                    title="프로필 업데이트 실패"
                    message={
                      error instanceof Error
                        ? error.message
                        : '프로필을 업데이트하는 중 오류가 발생했습니다.'
                    }
                  />
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email (Read-only) */}
                <div className="form-control">
                  <label className="label" htmlFor="email">
                    <span className="label-text font-semibold">이메일</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={user?.email || ''}
                    disabled
                    className="input input-bordered bg-base-200 cursor-not-allowed"
                  />
                  <label className="label">
                    <span className="label-text-alt text-base-content/60">
                      이메일은 변경할 수 없습니다
                    </span>
                  </label>
                </div>

                {/* Name */}
                <div className="form-control">
                  <label className="label" htmlFor="name">
                    <span className="label-text font-semibold">
                      이름 <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`input input-bordered ${
                      touched.name && formErrors.name ? 'input-error' : ''
                    }`}
                    placeholder="홍길동"
                    disabled={isPending}
                    required
                  />
                  {touched.name && formErrors.name && (
                    <label className="label">
                      <span className="label-text-alt text-error">
                        {formErrors.name}
                      </span>
                    </label>
                  )}
                </div>

                {/* Phone */}
                <div className="form-control">
                  <label className="label" htmlFor="phone">
                    <span className="label-text font-semibold">전화번호</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`input input-bordered ${
                      touched.phone && formErrors.phone ? 'input-error' : ''
                    }`}
                    placeholder="010-1234-5678"
                    disabled={isPending}
                  />
                  {touched.phone && formErrors.phone && (
                    <label className="label">
                      <span className="label-text-alt text-error">
                        {formErrors.phone}
                      </span>
                    </label>
                  )}
                  <label className="label">
                    <span className="label-text-alt text-base-content/60">
                      형식: 010-1234-5678 또는 01012345678
                    </span>
                  </label>
                </div>

                <div className="divider"></div>

                {/* Submit Button */}
                <div className="card-actions justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/mypage')}
                    className="btn btn-outline"
                    disabled={isPending}
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary gap-2"
                    disabled={isPending}
                  >
                    {isPending ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span>저장 중...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>저장</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Info Card */}
          <div className="alert alert-info max-w-2xl mx-auto mt-6">
            <UserIcon className="w-5 h-5" />
            <div>
              <p className="font-semibold">비밀번호 변경</p>
              <p className="text-sm">
                비밀번호를 변경하시려면 별도의 비밀번호 변경 페이지를 이용해주세요.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
