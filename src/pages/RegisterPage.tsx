import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ErrorAlert from '@/components/ErrorAlert';
import { NAV_ITEMS } from '@/constants/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRegister } from '@/hooks/queries/useAuthQueries';
import { RegisterRequestSchema } from '@/schemas/auth';
import { ApiError, NetworkError, ValidationError } from '@/utils/errors';
import { CheckCircle2, Circle, Mail, Lock, User as UserIcon } from 'lucide-react';

type RegisterFormState = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const PASSWORD_RULES = [
  {
    id: 'length',
    label: '8자 이상',
    test: (value: string) => value.length >= 8,
  },
  {
    id: 'letter',
    label: '영문 포함',
    test: (value: string) => /[A-Za-z]/.test(value),
  },
  {
    id: 'number',
    label: '숫자 포함',
    test: (value: string) => /\d/.test(value),
  },
  {
    id: 'special',
    label: '특수문자 포함',
    test: (value: string) => /[^A-Za-z0-9]/.test(value),
  },
];

const mapRegisterErrorToMessage = (error: unknown): string => {
  if (!error) {
    return '';
  }
  if (
    error instanceof ValidationError ||
    error instanceof ApiError ||
    error instanceof NetworkError
  ) {
    return error.message;
  }
  return '알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const registerMutation = useRegister({ autoLogin: false });

  const [form, setForm] = useState<RegisterFormState>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      void navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const emailValidation = RegisterRequestSchema.shape.email.safeParse(form.email);
  const emailError =
    (showErrors || form.email.length > 0) && !emailValidation.success
      ? emailValidation.error.issues[0]?.message ?? '유효한 이메일을 입력하세요'
      : '';

  const nameError =
    (showErrors || form.name.length > 0) && form.name.trim().length === 0
      ? '이름을 입력하세요'
      : '';

  const passwordChecks = PASSWORD_RULES.map((rule) => ({
    id: rule.id,
    label: rule.label,
    passed: rule.test(form.password),
  }));
  const isPasswordValid = passwordChecks.every((rule) => rule.passed);
  const passwordError =
    (showErrors || form.password.length > 0) && !isPasswordValid
      ? '영문, 숫자, 특수문자를 포함한 8자 이상의 비밀번호를 입력하세요'
      : '';

  const confirmPasswordError =
    (showErrors || form.confirmPassword.length > 0) &&
    form.confirmPassword !== form.password
      ? '비밀번호가 일치하지 않습니다'
      : '';

  const isFormValid =
    emailValidation.success &&
    form.name.trim().length > 0 &&
    isPasswordValid &&
    form.password === form.confirmPassword;

  const generalError = mapRegisterErrorToMessage(registerMutation.error);

  const handleChange =
    (field: keyof RegisterFormState) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      if (registerMutation.error) {
        registerMutation.reset();
      }
      setForm((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setShowErrors(true);

    if (!isFormValid || registerMutation.isPending) {
      return;
    }

    registerMutation.mutate(
      {
        email: form.email.trim(),
        password: form.password,
        name: form.name.trim(),
      },
      {
        onSuccess: () => {
          void navigate('/login', {
            replace: true,
            state: {
              registeredEmail: form.email.trim(),
              registeredName: form.name.trim(),
            },
          });
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-base-200">
      <Navbar navigationItems={NAV_ITEMS} />
      <main className="flex-grow">
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div className="space-y-6">
                <h1 className="text-4xl font-bold text-base-content">
                  우동금 회원가입
                </h1>
                <p className="text-lg text-base-content/70 leading-relaxed">
                  주변 금·보석 매장의 상품을 빠르게 확인하고,
                  맞춤 추천과 장바구니, 주문 서비스를 이용해보세요.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="p-6 rounded-lg bg-base-100 shadow-md border border-base-200">
                    <h2 className="font-semibold text-base-content mb-2">
                      맞춤 상품 추천
                    </h2>
                    <p className="text-sm text-base-content/70">
                      선호 지역과 카테고리를 등록하면 취향에 맞는 상품을
                      빠르게 찾아드려요.
                    </p>
                  </div>
                  <div className="p-6 rounded-lg bg-base-100 shadow-md border border-base-200">
                    <h2 className="font-semibold text-base-content mb-2">
                      쉽고 안전한 주문
                    </h2>
                    <p className="text-sm text-base-content/70">
                      장바구니부터 주문까지 간편하게 진행하고, 구매 이력도
                      한눈에 확인할 수 있어요.
                    </p>
                  </div>
                </div>
                <div className="hidden md:block">
                  <img
                    src="/images/base-image.png"
                    alt="우동금 회원가입 안내 이미지"
                    className="w-full max-w-md rounded-2xl shadow-xl border border-base-200 object-cover"
                    loading="lazy"
                  />
                </div>
              </div>

              <div className="card bg-base-100 shadow-2xl">
                <div className="card-body">
                  <h2 className="card-title text-2xl mb-2">회원가입</h2>
                  <p className="text-base-content/70">
                    서비스를 이용하기 위해 정보를 입력해주세요.
                  </p>

                  {generalError && (
                    <div className="mt-6">
                      <ErrorAlert message={generalError} />
                    </div>
                  )}

                  <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
                    <div className="form-control">
                      <label className="label" htmlFor="name">
                        <span className="label-text font-semibold flex items-center gap-2">
                          <UserIcon className="w-4 h-4" />
                          이름
                        </span>
                      </label>
                      <input
                        id="name"
                        type="text"
                        placeholder="이름을 입력하세요"
                        className={`input input-bordered w-full ${
                          nameError ? 'input-error' : ''
                        }`}
                        value={form.name}
                        onChange={handleChange('name')}
                        autoComplete="name"
                      />
                      {nameError && (
                        <p className="mt-1 text-sm text-error">{nameError}</p>
                      )}
                    </div>

                    <div className="form-control">
                      <label className="label" htmlFor="email">
                        <span className="label-text font-semibold flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          이메일
                        </span>
                      </label>
                      <input
                        id="email"
                        type="email"
                        placeholder="example@email.com"
                        className={`input input-bordered w-full ${
                          emailError ? 'input-error' : ''
                        }`}
                        value={form.email}
                        onChange={handleChange('email')}
                        autoComplete="email"
                      />
                      {emailError && (
                        <p className="mt-1 text-sm text-error">{emailError}</p>
                      )}
                    </div>

                    <div className="form-control">
                      <label className="label" htmlFor="password">
                        <span className="label-text font-semibold flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          비밀번호
                        </span>
                      </label>
                      <input
                        id="password"
                        type="password"
                        placeholder="비밀번호를 입력하세요"
                        className={`input input-bordered w-full ${
                          passwordError ? 'input-error' : ''
                        }`}
                        value={form.password}
                        onChange={handleChange('password')}
                        autoComplete="new-password"
                      />
                      {passwordError && (
                        <p className="mt-1 text-sm text-error">{passwordError}</p>
                      )}
                      <ul className="mt-3 space-y-1 text-sm">
                        {passwordChecks.map((rule) => (
                          <li
                            key={rule.id}
                            className={`flex items-center gap-2 ${
                              rule.passed
                                ? 'text-success font-medium'
                                : 'text-base-content/60'
                            }`}
                          >
                            {rule.passed ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <Circle className="w-4 h-4" />
                            )}
                            {rule.label}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="form-control">
                      <label className="label" htmlFor="confirmPassword">
                        <span className="label-text font-semibold flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          비밀번호 확인
                        </span>
                      </label>
                      <input
                        id="confirmPassword"
                        type="password"
                        placeholder="비밀번호를 다시 입력하세요"
                        className={`input input-bordered w-full ${
                          confirmPasswordError ? 'input-error' : ''
                        }`}
                        value={form.confirmPassword}
                        onChange={handleChange('confirmPassword')}
                        autoComplete="new-password"
                      />
                      {confirmPasswordError && (
                        <p className="mt-1 text-sm text-error">
                          {confirmPasswordError}
                        </p>
                      )}
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="btn btn-primary w-full"
                        disabled={!isFormValid || registerMutation.isPending}
                      >
                        {registerMutation.isPending && (
                          <span className="loading loading-spinner" aria-hidden />
                        )}
                        회원가입
                      </button>
                    </div>
                  </form>

                  <div className="mt-6 text-center text-sm text-base-content/70">
                    이미 계정이 있으신가요?{' '}
                    <Link to="/login" className="link link-primary">
                      로그인하기
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
