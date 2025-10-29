## 1️⃣ Style Guide

*목적*: 코드 스타일 규칙으로, 파일 구조, 함수 구조, 네이밍 컨벤션, 에러 처리 방식을 정의합니다.

---

### 📁 파일명 규칙

- **컴포넌트**: `PascalCase` (예: `UserProfile.tsx`, `LoginForm.tsx`)
- **유틸리티**: `camelCase` (예: `formatDate.ts`, `apiClient.ts`)
- **상수**: `UPPER_SNAKE_CASE` (예: `API_CONSTANTS.ts`)
- **테스트**: `*.test.ts` 또는 `*.spec.ts`

---

### ⚛️ React 컴포넌트 구조

```tsx
// 1. Imports (외부 → 내부 → 타입 → 스타일 순서)
import React, { useState, useEffect } from 'react';
import { Button } from '@/components';
import { formatDate } from '@/utils';
import type { User } from '@/types';

// 2. Types/Interfaces
interface UserProfileProps {
  userId: string;
  onUpdate?: (user: User) => void;
}

// 3. Constants
const MAX_RETRY = 3;

// 4. Component
export default function UserProfile({ userId, onUpdate }: UserProfileProps) {
  // 상태 선언
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 이펙트
  useEffect(() => {
    fetchUser();
  }, [userId]);

  // 핸들러
  const handleUpdate = () => {
    // ...
  };

  // 렌더링
  if (isLoading) return <div>Loading...</div>;
  return <div>{user?.name}</div>;
}
```

---

### 🔧 함수 구조 (4단계)

모든 함수는 다음 구조를 따릅니다:

```ts
function processUserData(user: User) {
  // 1️⃣ [설명] - JSDoc 주석

  // 2️⃣ [입력 검증]
  if (!user || !user.id) {
    throw new ValidationError('Invalid user data');
  }

  // 3️⃣ [핵심 로직]
  const processed = {
    id: user.id,
    name: user.name.trim(),
    email: user.email.toLowerCase()
  };

  // 4️⃣ [결과 반환]
  return processed;
}
```

---

### 🏷️ 네이밍 컨벤션

| 타입 | 규칙 | 예시 |
|------|------|------|
| **Boolean** | `is*`, `has*`, `should*` | `isLoading`, `hasError`, `shouldUpdate` |
| **함수** | 동사로 시작 | `fetchUser()`, `handleClick()`, `validateForm()` |
| **Custom Hook** | `use*` 접두사 | `useAuth()`, `useFetch()` |
| **상수** | 대문자 스네이크 케이스 | `MAX_RETRY_COUNT`, `API_BASE_URL` |
| **타입/인터페이스** | `PascalCase` | `User`, `ApiResponse`, `ButtonProps` |

---

### 🎯 TypeScript 규칙

- **Interface vs Type**: Props는 `interface`, Union/Tuple은 `type` 사용
- **any 금지**: `unknown` 사용 후 타입 가드로 좁히기
- **Optional**: `?.` 체이닝 적극 활용
- **Generic**: 명확한 이름 사용 (❌ `T`, ✅ `TData`, `TResponse`)

```ts
// ✅ 좋은 예
interface UserProps {
  user: User;
  onUpdate?: (user: User) => void;
}

type Status = 'idle' | 'loading' | 'success' | 'error';
```

---

### ⚠️ 에러 처리

- **모든 async 함수에 try-catch 필수**
- **커스텀 에러 클래스 사용**
- **React: Error Boundary로 컴포넌트 에러 처리**

```ts
async function fetchUserData(userId: string) {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    if (error.status === 404) {
      throw new NotFoundError(`User ${userId} not found`);
    }
    throw new ApiError('Failed to fetch user data', error);
  }
}
```

---

### 💬 주석 규칙

- **Why(왜)**를 설명 (How는 코드로 표현)
- **복잡한 비즈니스 로직만 주석 작성**

```ts
// ❌ 나쁜 예
// 유저 ID를 1 증가시킴
const newId = userId + 1;

// ✅ 좋은 예
// 레거시 시스템과의 ID 동기화를 위해 1 증가
const newId = userId + 1;
```

---

### 🎨 코드 포맷팅

- **Prettier/ESLint** 설정 준수
- **최대 줄 길이**: 100자
- **Trailing comma**: 항상 사용
- **세미콜론**: 항상 사용

---

### ♿ 접근성 (a11y)

- 모든 `<img>`에 `alt` 속성 필수
- 버튼은 `<button>`, 링크는 `<a>` 사용
- 폼 입력에는 `<label>` 연결
- 키보드 네비게이션 고려

```tsx
// ✅ 좋은 예
<button onClick={handleClick} aria-label="닫기">
  <CloseIcon />
</button>
```

---

### 🎨 daisyUI 컴포넌트 패턴

이 프로젝트는 **daisyUI**를 주요 컴포넌트 라이브러리로 사용합니다. 모든 UI 컴포넌트는 daisyUI 클래스를 사용하여 일관성, 테마 지원, 접근성을 유지합니다.

#### 🎯 시맨틱 컬러 시스템

**항상 시맨틱 컬러를 사용하고, 절대 하드코딩된 컬러를 사용하지 마세요.**

```tsx
// ✅ 좋은 예 - 시맨틱 컬러 사용
<button className="btn btn-primary">저장</button>
<div className="bg-base-100 text-base-content">컨텐츠</div>
<span className="text-error">에러 메시지</span>

// ❌ 나쁜 예 - 하드코딩된 컬러
<button className="bg-indigo-600 text-white">저장</button>
<button className="bg-red-500 hover:bg-red-700">삭제</button>
<span className="text-red-600">에러</span>
```

**사용 가능한 시맨틱 컬러:**

| 카테고리 | 컬러 | 용도 |
|---------|------|------|
| **테마** | `primary`, `secondary`, `accent`, `neutral` | 주요 액션, 보조 액션, 강조, 중립 |
| **상태** | `info`, `success`, `warning`, `error` | 정보, 성공, 경고, 에러 |
| **배경** | `base-100`, `base-200`, `base-300` | 주요 배경, 보조 배경, 구분선 |
| **텍스트** | `base-content` | 주요 텍스트 색상 |

#### 🔘 Button 컴포넌트

모든 버튼은 daisyUI `btn` 클래스 시스템을 사용합니다.

```tsx
// 기본 사용
<button className="btn btn-primary">저장</button>

// 크기: xs, sm, md(기본), lg, xl
<button className="btn btn-sm">작게</button>
<button className="btn btn-lg">크게</button>

// 변형: primary, secondary, accent, ghost, outline
<button className="btn btn-primary">채워진 버튼</button>
<button className="btn btn-outline">아웃라인 버튼</button>
<button className="btn btn-ghost">고스트 버튼</button>

// 수정자
<button className="btn btn-wide">넓은 버튼</button>
<button className="btn btn-block">전체 너비</button>
<button className="btn loading">로딩 중...</button>

// 아이콘과 함께
<button className="btn btn-sm">
  <svg>...</svg>
  삭제
</button>
```

**커스텀 Button 컴포넌트를 만들지 마세요.** daisyUI를 래핑한 `src/components/Button.tsx`를 사용하세요.

#### 🚨 Alert 컴포넌트

에러, 경고, 정보, 성공 메시지는 daisyUI alert를 사용합니다.

```tsx
// 에러 알림
<div role="alert" className="alert alert-error alert-soft">
  <svg>...</svg>
  <div>
    <h3 className="font-bold">에러 제목</h3>
    <div className="text-sm">에러 메시지 상세</div>
  </div>
</div>

// 성공 알림
<div role="alert" className="alert alert-success alert-soft">
  <svg>...</svg>
  <div>성공 메시지</div>
</div>
```

**접근성 요구사항:**
- 항상 `role="alert"` 포함
- 동적 알림은 `aria-live="polite"` 포함
- 전체 메시지 읽기를 위해 `aria-atomic="true"` 포함
- 아이콘은 `aria-hidden="true"`로 숨김

#### 📱 반응형 디자인

Tailwind 브레이크포인트를 일관되게 사용:

```tsx
// 모바일 우선 그리드
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
  {/* 모바일: 1열, 태블릿: 2열, 데스크톱: 3열 */}
</div>

// 화면 크기에 따라 숨김/표시
<div className="hidden lg:flex">데스크톱 전용</div>
<div className="lg:hidden">모바일 전용</div>

// 반응형 크기
<button className="btn btn-sm md:btn-md lg:btn-lg">반응형 버튼</button>
```

#### ♿ 접근성 체크리스트

- [ ] 모든 인터랙티브 요소에 `aria-label` 또는 visible text 포함
- [ ] 폼 입력은 `<label htmlFor="...">`로 적절히 레이블 지정
- [ ] 정보 전달에 색상만 사용하지 않음 (아이콘 + 텍스트 사용)
- [ ] 대비율 최소 3:1 (daisyUI가 자동 처리)
- [ ] 키보드 네비게이션 작동 (Tab 키)
- [ ] 스크린 리더가 중요 콘텐츠를 알림 (`role` 속성 사용)

```tsx
// ✅ 접근성 예시
<button aria-label="메뉴 열기">Menu</button>
<div role="alert" aria-live="polite" aria-atomic="true">Error</div>
<svg aria-hidden="true">Icon</svg>
<label htmlFor="region-id">지역</label>
<select id="region-id">...</select>
```

#### 🎨 테마 통합

daisyUI는 테마 설정을 준수합니다. 모든 시맨틱 컬러는 테마 변경 시 자동으로 업데이트됩니다.

**절대 하지 말아야 할 것:**
- 하드코딩된 컬러 값 사용
- daisyUI 유틸리티 클래스 오버라이드
- 시맨틱하지 않은 컬러 이름 사용

#### 📦 재사용 가능한 컴포넌트

프로젝트에서 사용 가능한 재사용 컴포넌트:

```tsx
// ErrorAlert - 에러/경고/정보 표시
import ErrorAlert from '@/components/ErrorAlert';

<ErrorAlert
  title="상품을 불러올 수 없습니다"
  message="네트워크 연결을 확인해주세요."
  onRetry={() => refetch()}
  variant="error"
/>

// LoadingSpinner - 로딩 상태
import LoadingSpinner from '@/components/LoadingSpinner';

<LoadingSpinner message="상품을 불러오는 중..." size="md" />

// Button - daisyUI 래퍼
import Button from '@/components/Button';

<Button variant="primary" size="lg" loading={isLoading}>
  저장
</Button>
```

---

### 🧪 테스트

- **파일명**: `ComponentName.test.tsx`
- **구조**: Arrange → Act → Assert
- **커버리지**: 핵심 비즈니스 로직 우선

```ts
describe('UserProfile', () => {
  it('should display user name when loaded', async () => {
    // Arrange
    const user = { id: '1', name: 'John' };

    // Act
    render(<UserProfile userId="1" />);

    // Assert
    expect(await screen.findByText('John')).toBeInTheDocument();
  });
});
```
