import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { NAV_ITEMS } from '@/constants/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { useLogin } from '@/hooks/queries/useAuthQueries';
import { LoginRequestSchema } from '@/schemas/auth';
import { ApiError, NetworkError, ValidationError } from '@/utils/errors';
import { AlertCircle, LogIn, Mail, Lock, ShieldCheck } from 'lucide-react';

type LocationState = {
  registeredEmail?: string;
  registeredName?: string;
};

const mapAuthErrorToMessage = (error: unknown): string => {
  if (!error) {
    return '';
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error instanceof Error && error.message) {
    return error.message;
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

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = (location.state as LocationState) || {};
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const loginMutation = useLogin();

  const [form, setForm] = useState(() => ({
    email: locationState.registeredEmail ?? '',
    password: '',
  }));
  const [showErrors, setShowErrors] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      void navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const emailValidation = LoginRequestSchema.shape.email.safeParse(form.email);
  const emailError =
    (showErrors || form.email.length > 0) && !emailValidation.success
      ? emailValidation.error.issues[0]?.message ?? '유효한 이메일을 입력하세요'
      : '';

  const passwordError =
    (showErrors || form.password.length > 0) && form.password.length < 6
      ? '비밀번호는 최소 6자 이상 입력하세요'
      : '';

  const isFormValid =
    emailValidation.success && form.password.trim().length >= 6;

  useEffect(() => {
    if (loginMutation.isError) {
      setServerError(mapAuthErrorToMessage(loginMutation.error));
    }
  }, [loginMutation.isError, loginMutation.error]);

  const handleChange =
    (field: 'email' | 'password') =>
    (event: ChangeEvent<HTMLInputElement>) => {
      if (loginMutation.error) {
        loginMutation.reset();
      }
      if (serverError) {
        setServerError('');
      }
      setForm((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setShowErrors(true);

    if (!isFormValid || loginMutation.isPending) {
      return;
    }

    loginMutation.mutate(
      {
        email: form.email.trim(),
        password: form.password,
      },
      {
        onSuccess: () => {
          setServerError('');
          void navigate('/', { replace: true });
        },
        onError: (error) => {
          setServerError(mapAuthErrorToMessage(error));
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
            <div className="grid gap-12 lg:grid-cols-2 items-start">
              <div className="flex flex-col gap-8">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-3 px-4 py-2 bg-primary/10 text-primary rounded-full font-semibold">
                    <ShieldCheck className="w-5 h-5" />
                    안전한 로그인
                  </div>
                  <h1 className="text-4xl font-bold text-base-content">
                    우동금에 오신 것을 환영합니다
                  </h1>
                </div>

                <div className="card bg-base-100 shadow-2xl">
                  <div className="card-body">
                    <h2 className="card-title text-2xl mb-2">로그인</h2>
                    <p className="text-base-content/70">
                      등록한 이메일과 비밀번호로 로그인하세요.
                    </p>

                    {locationState.registeredEmail && (
                      <div className="alert alert-success mt-4">
                        <div className="flex items-center gap-2">
                          <LogIn className="w-5 h-5" />
                          <span>
                            {locationState.registeredName
                              ? `${locationState.registeredName}님, `
                              : ''}
                            회원가입이 완료되었습니다. 로그인 후 서비스를
                            이용해보세요.
                          </span>
                        </div>
                      </div>
                    )}

                    {serverError && (
                      <div role="alert" className="alert alert-error mt-4">
                        <AlertCircle className="w-5 h-5" />
                        <span>{serverError}</span>
                      </div>
                    )}

                    <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
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
                          autoComplete="current-password"
                        />
                        {passwordError && (
                          <p className="mt-1 text-sm text-error">{passwordError}</p>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-sm text-base-content/70 pt-1">
                        <span className="italic">
                          아이디/비밀번호 찾기 기능은 준비 중입니다.
                        </span>
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          className="btn btn-primary w-full"
                          disabled={!isFormValid || loginMutation.isPending}
                        >
                          {loginMutation.isPending && (
                            <span className="loading loading-spinner" aria-hidden />
                          )}
                          로그인
                        </button>
                      </div>
                    </form>

                    <div className="mt-6 text-center text-sm text-base-content/70">
                      우동금이 처음이신가요?{' '}
                      <Link to="/register" className="link link-primary">
                        회원가입하기
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="hidden md:block">
                <div
                  className="relative w-full max-w-lg mx-auto overflow-hidden rounded-3xl shadow-2xl border border-base-200"
                  style={{ aspectRatio: '4 / 5' }}
                >
                  <img
                    src="/images/base-image.png"
                    alt="우동금 서비스 소개 이미지"
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                  />
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
