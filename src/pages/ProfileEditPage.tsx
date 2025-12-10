/**
 * ProfileEditPage Component
 * Allows authenticated users to update their profile information
 */

import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Mail } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useUpdateProfile } from '@/hooks/queries/useAuthQueries';
import { UpdateProfileRequestSchema, type UpdateProfileRequest } from '@/schemas/auth';
import { Navbar } from '@/components';
import { NAVIGATION_ITEMS } from '@/constants/navigation';

interface FormErrors {
  name?: string;
  phone?: string;
  nickname?: string;
  address?: string;
}

export default function ProfileEditPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { mutate: updateProfile, isPending, isError, error, isSuccess } = useUpdateProfile();

  const backPath = '/mypage';

  const [formData, setFormData] = useState<UpdateProfileRequest>({
    name: user?.name || '',
    phone: user?.phone || '',
    nickname: user?.nickname || '',
    address: user?.address || '',
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Navigate back on success
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        navigate(backPath);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, navigate, backPath]);

  /**
   * Validate a single field
   */
  const validateField = (name: string, value: string): string | undefined => {
    try {
      if (name === 'name') {
        UpdateProfileRequestSchema.pick({ name: true }).parse({ name: value });
      } else if (name === 'phone') {
        if (value === '') return undefined;
        UpdateProfileRequestSchema.pick({ phone: true }).parse({ phone: value });
      } else if (name === 'nickname') {
        if (value === '') return undefined;
        UpdateProfileRequestSchema.pick({ nickname: true }).parse({ nickname: value });
      } else if (name === 'address') {
        if (value === '') return undefined;
        UpdateProfileRequestSchema.pick({ address: true }).parse({ address: value });
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

    const nameError = validateField('name', formData.name || '');
    if (nameError) {
      errors.name = nameError;
      isValid = false;
    }

    if (formData.phone) {
      const phoneError = validateField('phone', formData.phone);
      if (phoneError) {
        errors.phone = phoneError;
        isValid = false;
      }
    }

    if (formData.nickname) {
      const nicknameError = validateField('nickname', formData.nickname);
      if (nicknameError) {
        errors.nickname = nicknameError;
        isValid = false;
      }
    }

    if (formData.address) {
      const addressError = validateField('address', formData.address);
      if (addressError) {
        errors.address = addressError;
        isValid = false;
      }
    }

    setFormErrors(errors);
    return isValid;
  };

  /**
   * Handle input change
   */
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (formErrors[name as keyof FormErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  /**
   * Handle input blur
   */
  const handleBlur = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

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

    setTouched({ name: true, phone: true, nickname: true, address: true });

    if (!validateForm()) {
      return;
    }

    updateProfile(formData);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar navigationItems={NAVIGATION_ITEMS} />

      <div className="container mx-auto px-4 py-8 max-w-[900px]">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-8">프로필 수정</h2>

            {/* Success Message */}
            {isSuccess && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="stroke-green-600 shrink-0 w-5 h-5 mt-0.5"
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
                <span className="text-sm text-green-700">프로필이 성공적으로 업데이트되었습니다!</span>
              </div>
            )}

            {/* Error Alert */}
            {isError && error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="stroke-red-600 shrink-0 w-5 h-5 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p className="text-sm font-medium text-red-700">프로필 업데이트 실패</p>
                  <p className="text-sm text-red-600 mt-1">
                    {error instanceof Error ? error.message : '프로필을 업데이트하는 중 오류가 발생했습니다.'}
                  </p>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email (Read-only) */}
              <div className="form-control">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  이메일 (변경 불가)
                </label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-700">{user?.email || '-'}</span>
                </div>
              </div>

              {/* Name */}
              <div className="form-control">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full p-3 rounded-lg border ${
                    touched.name && formErrors.name ? 'border-red-500' : 'border-gray-200'
                  } focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent`}
                  placeholder="홍길동"
                  disabled={isPending}
                  required
                />
                {touched.name && formErrors.name && (
                  <p className="mt-2 text-sm text-red-500">{formErrors.name}</p>
                )}
              </div>

              {/* Nickname */}
              <div className="form-control">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  닉네임
                  {user?.role === 'admin' && (
                    <span className="ml-2 text-xs text-gray-500">(매장 이름과 자동 동기화)</span>
                  )}
                </label>
                <input
                  type="text"
                  id="nickname"
                  name="nickname"
                  value={formData.nickname || ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full p-3 rounded-lg border ${
                    touched.nickname && formErrors.nickname ? 'border-red-500' : 'border-gray-200'
                  } focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
                    user?.role === 'admin' ? 'bg-gray-50 cursor-not-allowed' : ''
                  }`}
                  placeholder="닉네임을 입력하세요"
                  disabled={isPending || user?.role === 'admin'}
                />
                {user?.role === 'admin' ? (
                  <p className="mt-2 text-sm text-gray-500">
                    금은방 사장님의 닉네임은 매장 이름으로 자동 설정됩니다.
                  </p>
                ) : touched.nickname && formErrors.nickname ? (
                  <p className="mt-2 text-sm text-red-500">{formErrors.nickname}</p>
                ) : (
                  <p className="mt-2 text-sm text-gray-500">2-20자 이내로 입력하세요</p>
                )}
              </div>

              {/* Phone */}
              <div className="form-control">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  전화번호
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full p-3 rounded-lg border ${
                    touched.phone && formErrors.phone ? 'border-red-500' : 'border-gray-200'
                  } focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent`}
                  placeholder="010-1234-5678"
                  disabled={isPending}
                />
                {touched.phone && formErrors.phone ? (
                  <p className="mt-2 text-sm text-red-500">{formErrors.phone}</p>
                ) : (
                  <p className="mt-2 text-sm text-gray-500">010-1234-5678 형식으로 입력하세요</p>
                )}
              </div>

              {/* Address */}
              <div className="form-control">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  주소
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address || ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full p-3 rounded-lg border ${
                    touched.address && formErrors.address ? 'border-red-500' : 'border-gray-200'
                  } focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none`}
                  rows={3}
                  placeholder="서울특별시 강남구 테헤란로 123"
                  disabled={isPending}
                />
                {touched.address && formErrors.address ? (
                  <p className="mt-2 text-sm text-red-500">{formErrors.address}</p>
                ) : (
                  <p className="mt-2 text-sm text-gray-500">주소를 입력하세요</p>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-between pt-6 border-t">
                <button
                  type="button"
                  className="px-4 py-3 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={() => navigate(backPath)}
                  disabled={isPending}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></span>
                      <span>저장 중...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>저장하기</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
