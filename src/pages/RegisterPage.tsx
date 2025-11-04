/**
 * RegisterPage Component
 * User registration page with form validation and error handling
 */

import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { useRegister } from '@/hooks/queries/useAuthQueries';
import { useAuthStore } from '@/stores/useAuthStore';
import { RegisterRequestSchema, type RegisterRequest } from '@/schemas/auth';
import { ValidationError } from '@/utils/errors';
import { AUTH_ERRORS } from '@/constants/errors';
import PasswordInput from '@/components/PasswordInput';

/**
 * Form field errors
 */
interface FormErrors {
  email?: string;
  password?: string;
  passwordConfirm?: string;
  name?: string;
  phone?: string;
}

/**
 * RegisterPage Component
 * Handles user registration with validation
 */
export default function RegisterPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { mutate: register, isPending, isError, error } = useRegister();

  // Form state
  const [formData, setFormData] = useState<RegisterRequest & { passwordConfirm: string }>({
    email: '',
    password: '',
    passwordConfirm: '',
    name: '',
    phone: '',
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  /**
   * Handle input change
   */
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear field error when user starts typing
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  /**
   * Handle input blur - validate single field
   */
  const handleBlur = (field: keyof FormErrors) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field);
  };

  /**
   * Validate single field
   */
  const validateField = (field: keyof FormErrors) => {
    const errors: FormErrors = {};

    switch (field) {
      case 'email':
        if (!formData.email) {
          errors.email = AUTH_ERRORS.EMAIL_REQUIRED;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          errors.email = AUTH_ERRORS.EMAIL_INVALID;
        }
        break;

      case 'password':
        if (!formData.password) {
          errors.password = AUTH_ERRORS.PASSWORD_REQUIRED;
        } else if (formData.password.length < 8) {
          errors.password = AUTH_ERRORS.PASSWORD_MIN_LENGTH;
        } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
          errors.password = AUTH_ERRORS.PASSWORD_COMPLEXITY;
        }
        break;

      case 'passwordConfirm':
        if (!formData.passwordConfirm) {
          errors.passwordConfirm = AUTH_ERRORS.PASSWORD_CONFIRM_REQUIRED;
        } else if (formData.password !== formData.passwordConfirm) {
          errors.passwordConfirm = AUTH_ERRORS.PASSWORD_MISMATCH;
        }
        break;

      case 'name':
        if (!formData.name) {
          errors.name = AUTH_ERRORS.NAME_REQUIRED;
        } else if (formData.name.trim().length === 0) {
          errors.name = AUTH_ERRORS.NAME_REQUIRED;
        }
        break;

      case 'phone':
        if (!formData.phone) {
          errors.phone = AUTH_ERRORS.PHONE_REQUIRED;
        } else if (!/^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/.test(formData.phone)) {
          errors.phone = AUTH_ERRORS.PHONE_INVALID;
        }
        break;
    }

    setFormErrors((prev) => ({ ...prev, ...errors }));
    return Object.keys(errors).length === 0;
  };

  /**
   * Validate entire form
   */
  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    // Email validation
    if (!formData.email) {
      errors.email = AUTH_ERRORS.EMAIL_REQUIRED;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = AUTH_ERRORS.EMAIL_INVALID;
    }

    // Password validation
    if (!formData.password) {
      errors.password = AUTH_ERRORS.PASSWORD_REQUIRED;
    } else if (formData.password.length < 8) {
      errors.password = AUTH_ERRORS.PASSWORD_MIN_LENGTH;
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = AUTH_ERRORS.PASSWORD_COMPLEXITY;
    }

    // Password confirmation validation
    if (!formData.passwordConfirm) {
      errors.passwordConfirm = AUTH_ERRORS.PASSWORD_CONFIRM_REQUIRED;
    } else if (formData.password !== formData.passwordConfirm) {
      errors.passwordConfirm = AUTH_ERRORS.PASSWORD_MISMATCH;
    }

    // Name validation
    if (!formData.name || formData.name.trim().length === 0) {
      errors.name = AUTH_ERRORS.NAME_REQUIRED;
    }

    // Phone validation
    if (!formData.phone) {
      errors.phone = AUTH_ERRORS.PHONE_REQUIRED;
    } else if (!/^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/.test(formData.phone)) {
      errors.phone = AUTH_ERRORS.PHONE_INVALID;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      email: true,
      password: true,
      passwordConfirm: true,
      name: true,
      phone: true,
    });

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Prepare data for submission (exclude passwordConfirm)
    const { passwordConfirm, ...registerData } = formData;

    try {
      // Validate with Zod schema
      const validatedData = RegisterRequestSchema.parse(registerData);

      // Call register mutation
      register(validatedData, {
        onSuccess: () => {
          // Navigate to home on success (handled by useRegister hook)
          navigate('/', { replace: true });
        },
      });
    } catch (err) {
      if (err instanceof ValidationError) {
        // Handle Zod validation errors (shouldn't happen if client validation is correct)
        console.error('Validation error:', err);
      }
    }
  };

  // Don't render form if already authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="w-full max-w-md">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          {/* Header */}
          <div className="flex flex-col items-center mb-6">
            <UserPlus className="w-12 h-12 text-primary mb-3" aria-hidden="true" />
            <h1 className="text-2xl font-bold">회원가입</h1>
            <p className="text-sm text-base-content/70 mt-1">
              우동금 서비스에 가입하세요
            </p>
          </div>

          {/* Error Alert */}
          {isError && error && (
            <div role="alert" aria-label="error" className="alert alert-error mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{error.message}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} noValidate>
            {/* Email Field */}
            <div className="form-control w-full mb-4">
              <label htmlFor="email" className="label">
                <span className="label-text">이메일</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={() => handleBlur('email')}
                placeholder="your@email.com"
                required
                className={`input input-bordered w-full ${
                  touched.email && formErrors.email ? 'input-error' : ''
                }`}
              />
              {touched.email && formErrors.email && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {formErrors.email}
                  </span>
                </label>
              )}
            </div>

            {/* Password Field */}
            <div className="mb-4">
              <PasswordInput
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={() => handleBlur('password')}
                error={touched.password ? formErrors.password : undefined}
                placeholder="비밀번호 (8자 이상, 영문 대소문자, 숫자 포함)"
                required
                label="비밀번호"
              />
            </div>

            {/* Password Confirmation Field */}
            <div className="mb-4">
              <PasswordInput
                id="passwordConfirm"
                name="passwordConfirm"
                value={formData.passwordConfirm}
                onChange={handleChange}
                onBlur={() => handleBlur('passwordConfirm')}
                error={touched.passwordConfirm ? formErrors.passwordConfirm : undefined}
                placeholder="비밀번호 재입력"
                required
                label="비밀번호 확인"
              />
            </div>

            {/* Name Field */}
            <div className="form-control w-full mb-4">
              <label htmlFor="name" className="label">
                <span className="label-text">이름</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                onBlur={() => handleBlur('name')}
                placeholder="홍길동"
                required
                className={`input input-bordered w-full ${
                  touched.name && formErrors.name ? 'input-error' : ''
                }`}
              />
              {touched.name && formErrors.name && (
                <label className="label">
                  <span className="label-text-alt text-error">{formErrors.name}</span>
                </label>
              )}
            </div>

            {/* Phone Field */}
            <div className="form-control w-full mb-6">
              <label htmlFor="phone" className="label">
                <span className="label-text">휴대폰 번호</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                onBlur={() => handleBlur('phone')}
                placeholder="010-1234-5678"
                required
                className={`input input-bordered w-full ${
                  touched.phone && formErrors.phone ? 'input-error' : ''
                }`}
              />
              {touched.phone && formErrors.phone && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {formErrors.phone}
                  </span>
                </label>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="btn btn-primary w-full mb-4"
            >
              {isPending ? (
                <>
                  <span className="loading loading-spinner"></span>
                  등록 중...
                </>
              ) : (
                '회원가입'
              )}
            </button>

            {/* Login Link */}
            <div className="text-center text-sm">
              <span className="text-base-content/70">이미 계정이 있으신가요? </span>
              <Link to="/login" className="link link-primary">
                로그인
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
