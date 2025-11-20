/**
 * ProfileEditPage Component
 * Allows authenticated users to update their profile information (name, phone)
 */

import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { User as UserIcon, ArrowLeft, Save, Lock, Edit3, Shield, Mail, Phone, Key } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useUpdateProfile } from '@/hooks/queries/useAuthQueries';
import { UpdateProfileRequestSchema, type UpdateProfileRequest } from '@/schemas/auth';
import { Navbar, Footer, ErrorAlert, LoadingSpinner, Button } from '@/components';
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
    <div className="flex min-h-screen flex-col">
      <Navbar navigationItems={NAV_ITEMS} />

      <main className="flex-grow py-8">
        <section className="container mx-auto px-4 max-w-3xl">
          {/* Page Header */}
          <div className="mb-8">
            <Button onClick={() => navigate('/mypage')}
              variant="outline"
              size="sm"
              className="gap-2 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              마이페이지로 돌아가기
            </Button>
            <h1 className="text-3xl font-bold text-[var(--color-text)]">프로필 수정</h1>
            <p className="mt-2 text-[var(--color-text)]/60">
              회원 정보를 수정하세요
            </p>
          </div>

          {/* Form Card */}
          <div className="card bg-[var(--color-primary)] shadow border border-[var(--color-text)]/10">
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
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* 🔒 계정 정보 (변경 불가) */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Lock className="w-5 h-5 text-[var(--color-text)]/70" />
                    <h3 className="text-lg font-bold text-[var(--color-text)]">계정 정보</h3>
                    <span className="badge badge-sm bg-[var(--color-text)]/10 text-[var(--color-text)]/70 border-none">변경 불가</span>
                  </div>

                  <div className="bg-[var(--color-secondary)] p-4 rounded-lg border border-[var(--color-text)]/10">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-[var(--color-text)]/50" />
                      <div className="flex-1">
                        <p className="text-xs text-[var(--color-text)]/70 mb-1">이메일</p>
                        <p className="text-sm font-semibold text-[var(--color-text)]">{user?.email || '-'}</p>
                      </div>
                      <Lock className="w-4 h-4 text-[var(--color-text)]/30" />
                    </div>
                    <p className="text-xs text-[var(--color-text)]/60 mt-3 ml-8">
                      이메일은 계정 식별에 사용되어 변경할 수 없습니다
                    </p>
                  </div>
                </div>

                {/* ✏️ 개인 정보 */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Edit3 className="w-5 h-5 text-[var(--color-gold)]" />
                    <h3 className="text-lg font-bold text-[var(--color-text)]">개인 정보</h3>
                    <span className="badge badge-sm bg-[var(--color-gold)]/10 text-[var(--color-gold)] border-none">수정 가능</span>
                  </div>

                  <div className="space-y-4">
                    {/* Name */}
                    <div className="form-control">
                      <label className="label pb-2" htmlFor="name">
                        <span className="label-text font-medium text-[var(--color-text)] flex items-center gap-2">
                          <UserIcon className="w-4 h-4" />
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
                        className={`input input-bordered bg-[var(--color-secondary)] text-[var(--color-text)] border-[var(--color-text)]/20 h-12 ${
                          touched.name && formErrors.name ? 'input-error' : ''
                        }`}
                        placeholder="홍길동"
                        disabled={isPending}
                        required
                      />
                      {touched.name && formErrors.name && (
                        <label className="label pt-2">
                          <span className="label-text-alt text-error">
                            {formErrors.name}
                          </span>
                        </label>
                      )}
                    </div>

                    {/* Phone */}
                    <div className="form-control">
                      <label className="label pb-2" htmlFor="phone">
                        <span className="label-text font-medium text-[var(--color-text)] flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          전화번호
                        </span>
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone || ''}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`input input-bordered bg-[var(--color-secondary)] text-[var(--color-text)] border-[var(--color-text)]/20 h-12 ${
                          touched.phone && formErrors.phone ? 'input-error' : ''
                        }`}
                        placeholder="010-1234-5678"
                        disabled={isPending}
                      />
                      {touched.phone && formErrors.phone && (
                        <label className="label pt-2">
                          <span className="label-text-alt text-error">
                            {formErrors.phone}
                          </span>
                        </label>
                      )}
                      <label className="label pt-2">
                        <span className="label-text-alt text-[var(--color-text)]/60">
                          형식: 010-1234-5678 또는 01012345678
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* 🔐 보안 설정 */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="w-5 h-5 text-[var(--color-text)]/70" />
                    <h3 className="text-lg font-bold text-[var(--color-text)]">보안 설정</h3>
                  </div>

                  <div className="bg-[var(--color-secondary)] p-4 rounded-lg border border-[var(--color-text)]/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Key className="w-5 h-5 text-[var(--color-text)]/50" />
                        <div>
                          <p className="text-sm font-semibold text-[var(--color-text)]">비밀번호</p>
                          <p className="text-xs text-[var(--color-text)]/60 mt-1">
                            계정 보안을 위해 정기적으로 변경하세요
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // TODO: 비밀번호 변경 페이지로 이동
                          alert('비밀번호 변경 기능은 곧 제공될 예정입니다');
                        }}
                      >
                        변경하기
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="divider my-6"></div>

                {/* Submit Button */}
                <div className="flex justify-end gap-3 pt-2">
                  <Button onClick={() => navigate('/mypage')}
                    variant="outline"
                    disabled={isPending}
                  >
                    취소
                  </Button>
                  <Button type="submit" variant="primary" className="gap-2"
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
                        <span>변경사항 저장</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>

        </section>
      </main>

      <Footer />
    </div>
  );
}
