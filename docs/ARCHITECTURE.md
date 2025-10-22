# 아키텍처 가이드라인

## 핵심 원칙

### DRY (Don't Repeat Yourself - 반복하지 마라)
- 공통 로직을 재사용 가능한 함수/훅으로 추출
- 반복되는 UI 패턴은 공유 컴포넌트로 생성
- 반복되는 값은 상수로 관리
- 설정과 API 엔드포인트를 중앙화

### KISS (Keep It Simple, Stupid - 단순하게 유지하라)
- 명확하고 직관적인 코드 작성
- 과도한 엔지니어링 지양
- 복잡한 추상화보다 단순한 패턴 선호
- 하나의 함수는 하나의 책임만

### YAGNI (You Aren't Gonna Need It - 필요할 때 만들어라)
- "혹시 몰라서"가 아닌 필요할 때 기능 구현
- 성급한 최적화 지양
- 사용하지 않는 의존성 추가 금지
- 죽은 코드는 정기적으로 제거

## 코드 구조

### 디렉토리 구조
```
src/
├── components/     # 재사용 가능한 UI 컴포넌트
├── hooks/          # 커스텀 React 훅
├── utils/          # 순수 유틸리티 함수
├── services/       # API 및 외부 서비스
├── constants/      # 앱 전역 상수
└── types/          # TypeScript 타입 정의
```

### 재사용성 가이드라인

**컴포넌트**
- 작고 집중된 컴포넌트
- 하드코딩된 값보다 Props 사용
- 상속보다 조합

**훅**
- 컴포넌트에서 상태 로직 추출
- 단일 책임 유지

**유틸**
- 순수 함수만 작성
- 잘 테스트되고 문서화
- 사이드 이펙트 없음

**서비스**
- 외부 API 호출 캡슐화
- 에러 처리 일관성 유지
- 타입이 지정된 응답 반환

## 모범 사례

1. **새 코드 작성 전에 기존 코드 확인** - 이미 있을 수 있음
2. **3번 사용 후 추출** - 두 번 중복, 세 번째에 추출
3. **단순하게 시작** - 패턴이 보일 때 리팩토링
4. **사용하지 않는 코드 삭제** - 주석 처리 말고 삭제
5. **주석보다 타입** - TypeScript로 코드 문서화

---

## 기술 스택 아키텍처

### 상태 관리 전략

우동금 프로젝트는 **서버 상태**와 **클라이언트 상태**를 명확히 분리합니다.

#### 서버 상태 - TanStack Query

**서버에서 가져오는 모든 데이터**는 TanStack Query로 관리합니다.

- ✅ 제품 목록, 상세 정보
- ✅ 장바구니 데이터
- ✅ 주문 내역
- ✅ 매장 정보
- ✅ 사용자 프로필

**특징:**
- 자동 캐싱 및 백그라운드 동기화
- 자동 리페칭 (윈도우 포커스, 네트워크 재연결)
- 중복 요청 제거
- Optimistic Updates 지원

#### 클라이언트 상태 - Zustand

**클라이언트에서만 관리하는 상태**는 Zustand로 관리합니다.

- ✅ 인증 상태 (user, tokens) - **localStorage 영속화**
- ✅ UI 상태 (theme, modals, toasts) - **런타임만**

**특징:**
- 최소한의 글로벌 상태만 관리
- Redux보다 간결한 API (보일러플레이트 없음)
- Persist middleware로 localStorage 연동
- `.getState()`로 React 외부 접근 가능

### Schema-First Development (Zod)

**스키마를 먼저 정의하고 타입을 자동 생성**합니다.

```typescript
// 1. Zod 스키마 정의 (검증 규칙 + 타입)
export const UserSchema = z.object({
  id: z.number(),
  email: z.string().email('유효한 이메일을 입력하세요'),
  name: z.string().min(1, '이름을 입력하세요'),
});

// 2. TypeScript 타입 자동 생성
export type User = z.infer<typeof UserSchema>;

// 3. 런타임 검증
const user = UserSchema.parse(data); // 실패 시 ZodError
```

**장점:**
- 타입과 검증 로직이 단일 소스
- 런타임 타입 안전성 보장
- 한국어 에러 메시지 지원
- API 응답 검증으로 타입 가드 불필요

### 데이터 흐름 아키텍처

```
┌─────────────┐
│  Component  │ React Component
└──────┬──────┘
       │
       ↓ 호출
┌─────────────────┐
│ TanStack Query  │ useQuery / useMutation
│      Hook       │
└──────┬──────────┘
       │
       ↓ 호출
┌─────────────────┐
│  Service Layer  │ 순수 API 호출 로직
└──────┬──────────┘
       │
       ↓ Zod 검증
┌─────────────────┐
│   API Client    │ Axios (interceptors)
└──────┬──────────┘
       │
       ↓ HTTP
┌─────────────────┐
│     Backend     │
└─────────────────┘
```

### 디렉토리 구조 (최신)

```
src/
├── api/                    # API 설정
│   └── client.ts           # Axios 인스턴스 + 인터셉터
│
├── schemas/                # Zod 스키마 (타입 + 검증)
│   ├── auth.ts
│   ├── products.ts
│   ├── cart.ts
│   ├── orders.ts
│   └── index.ts            # Barrel export
│
├── services/               # API 호출 로직
│   ├── auth.ts
│   ├── products.ts
│   ├── cart.ts
│   ├── orders.ts
│   └── stores.ts
│
├── stores/                 # Zustand 스토어
│   ├── useAuthStore.ts     # 인증 (persist)
│   └── useUIStore.ts       # UI (runtime)
│
├── hooks/
│   └── queries/            # TanStack Query 훅
│       ├── useAuthQueries.ts
│       ├── useProductsQueries.ts
│       ├── useCartQueries.ts
│       ├── useOrdersQueries.ts
│       ├── useStoresQueries.ts
│       └── index.ts
│
├── constants/              # 상수
│   └── api.ts              # API endpoints, 에러 메시지
│
└── utils/                  # 유틸리티
    └── errors.ts           # 커스텀 에러 클래스
```

---

## 재사용 가능한 패턴

### 1. Service Layer 패턴

**모든 API 호출은 서비스 레이어를 거칩니다.**

```typescript
// src/services/products.ts
class ProductsService {
  async getProducts(params?: ProductsRequest): Promise<ProductsResponse> {
    const response = await apiClient.get(ENDPOINTS.PRODUCTS.LIST, { params });

    // Zod 검증 - 런타임 타입 안전성
    return ProductsResponseSchema.parse(response.data);
  }
}

export const productsService = new ProductsService();
```

**원칙:**
- 서비스는 순수 API 호출만 담당 (React 의존성 없음)
- Zod 검증은 서비스 레이어에서 수행
- 에러 처리는 Axios interceptor에서 일관되게 처리

### 2. Query Keys Factory 패턴

**쿼리 키를 중앙에서 관리**합니다.

```typescript
// src/hooks/queries/useProductsQueries.ts
export const productsKeys = {
  all: ['products'] as const,
  lists: () => [...productsKeys.all, 'list'] as const,
  list: (params?: ProductsRequest) => [...productsKeys.lists(), params] as const,
  details: () => [...productsKeys.all, 'detail'] as const,
  detail: (id: number) => [...productsKeys.details(), id] as const,
};
```

**장점:**
- 캐시 키 오타 방지
- 관련 쿼리 일괄 무효화 가능 (`invalidateQueries({ queryKey: productsKeys.all })`)
- IntelliSense 지원

### 3. Auto-Invalidation 패턴

**뮤테이션 성공 시 관련 쿼리를 자동 무효화**합니다.

```typescript
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrderRequest) => ordersService.createOrder(data),
    onSuccess: () => {
      // 주문 목록 쿼리 무효화 → 자동 리페칭
      queryClient.invalidateQueries({ queryKey: ordersKeys.list() });

      // 장바구니 쿼리도 무효화 (주문 시 장바구니가 비워지므로)
      queryClient.invalidateQueries({ queryKey: cartKeys.detail() });
    },
  });
}
```

### 4. Conditional Queries 패턴

**조건부로 쿼리를 활성화**합니다.

```typescript
export function useCart() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: cartKeys.detail(),
    queryFn: () => cartService.getCart(),
    enabled: isAuthenticated, // 로그인 시에만 요청
  });
}
```

### 5. Zustand Selector 패턴

**필요한 상태만 선택**하여 불필요한 리렌더링을 방지합니다.

```typescript
function UserProfile() {
  // ✅ 좋은 예: user만 구독
  const user = useAuthStore((state) => state.user);

  // ❌ 나쁜 예: 전체 스토어 구독
  const { user, tokens, isAuthenticated } = useAuthStore();

  return <div>{user?.name}</div>;
}
```

### 6. Complex Validation 패턴

**Zod의 `.refine()`으로 복잡한 비즈니스 로직을 검증**합니다.

```typescript
export const CreateOrderRequestSchema = z
  .object({
    fulfillment_type: z.enum(['delivery', 'pickup']),
    shipping_address: z.string().optional(),
    pickup_store_id: z.number().optional(),
  })
  .refine(
    (data) => {
      // 배송은 주소 필수, 픽업은 매장 ID 필수
      if (data.fulfillment_type === 'delivery') return !!data.shipping_address;
      if (data.fulfillment_type === 'pickup') return !!data.pickup_store_id;
      return true;
    },
    {
      message: '배송 선택 시 주소가, 픽업 선택 시 매장 ID가 필요합니다',
      path: ['fulfillment_type'],
    }
  );
```

---

## 에러 처리 전략

### 1. Zod Validation Errors

**ValidationError 클래스로 변환**합니다.

```typescript
try {
  const data = LoginRequestSchema.parse(formData);
} catch (error) {
  if (error instanceof ZodError) {
    throw ValidationError.fromZod(error);
  }
}
```

### 2. API Errors

**Axios interceptor가 자동 변환**합니다.

```typescript
// src/api/client.ts
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (!error.response) {
      return Promise.reject(new NetworkError(ERROR_MESSAGES.NETWORK_ERROR));
    }

    const status = error.response.status;

    // 401 자동 처리
    if (status === 401) {
      useAuthStore.getState().clearAuth();
      window.location.href = '/login';
    }

    return Promise.reject(new ApiError(message, status));
  }
);
```

### 3. 컴포넌트에서 에러 처리

```typescript
function LoginPage() {
  const { mutate: login, error } = useLogin();

  return (
    <div>
      {error && <ErrorMessage>{error.message}</ErrorMessage>}
      <button onClick={() => login({ email, password })}>로그인</button>
    </div>
  );
}
```

---

## 성능 최적화 전략

### 1. TanStack Query 캐싱

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,      // 5분간 데이터 신선함
      gcTime: 1000 * 60 * 10,         // 10분간 캐시 유지
      refetchOnWindowFocus: true,     // 윈도우 포커스 시 리페칭
    },
  },
});
```

### 2. Zustand 셀렉터

**필요한 상태만 구독**하여 리렌더링 최소화:

```typescript
// ✅ 좋은 예
const user = useAuthStore((state) => state.user);

// ❌ 나쁜 예
const store = useAuthStore();
```

### 3. Prefetching

**다음에 필요할 데이터를 미리 로드**:

```typescript
const queryClient = useQueryClient();

const handleHover = (productId: number) => {
  queryClient.prefetchQuery({
    queryKey: productsKeys.detail(productId),
    queryFn: () => productsService.getProductDetail(productId),
  });
};
```

---

## 보안 고려사항

### 1. JWT 토큰 관리

- ✅ Access Token: localStorage (Zustand persist)
- ✅ Axios interceptor에서 자동 주입
- ✅ 401 에러 시 자동 로그아웃 및 리다이렉트

### 2. Zod 검증

- ✅ 클라이언트 입력 검증
- ✅ 서버 응답 검증 (타입 불일치 방지)

### 3. XSS 방지

- ✅ React의 기본 XSS 방지 (자동 이스케이핑)
- ✅ `dangerouslySetInnerHTML` 사용 금지

---

## 참고 문서

- [QUICK_START.md](./QUICK_START.md) - 빠른 시작 가이드
- [COMMIT_CONVENTION.md](./COMMIT_CONVENTION.md) - 커밋 컨벤션
- [Zod 공식 문서](https://zod.dev)
- [Zustand 공식 문서](https://zustand-demo.pmnd.rs)
- [TanStack Query 공식 문서](https://tanstack.com/query/latest)
