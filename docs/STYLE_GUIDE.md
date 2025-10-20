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
