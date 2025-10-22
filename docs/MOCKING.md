# Mock API Guide (MSW)

Mock Service Worker (MSW)를 사용한 백엔드 목업 가이드입니다.

## 개요

프로젝트는 **Mock Service Worker (MSW)**를 사용하여 백엔드가 없어도 프론트엔드 개발을 할 수 있습니다.

### 왜 MSW인가?

- ✅ **네트워크 레벨 인터셉트**: Service Worker로 실제 HTTP 요청을 가로채어 응답 제공
- ✅ **제로 코드 수정**: API 클라이언트 코드를 전혀 변경할 필요 없음
- ✅ **프로덕션과 동일한 경험**: 실제 네트워크 요청처럼 동작 (딜레이, 에러 시뮬레이션)
- ✅ **타입 안전**: Zod 스키마와 통합하여 타입 안전성 보장

## 빠른 시작

### 1. Mock API 활성화

`.env.development` 파일 또는 `.env.local` 파일에 추가:

```bash
VITE_MOCK_API=true
```

### 2. 개발 서버 재시작

```bash
npm run dev
```

브라우저 콘솔에 `🎭 Mock API Enabled` 메시지가 표시되면 성공!

### 3. 테스트

`http://localhost:5173/apidemo` 페이지에서 모든 API 엔드포인트를 테스트할 수 있습니다.

## Mock API 엔드포인트

### 인증 (Authentication)

#### POST `/api/v1/auth/register`
새 사용자 등록

**요청 예시:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "테스트 사용자",
  "phone": "010-1234-5678"
}
```

**응답 예시:**
```json
{
  "message": "회원가입이 완료되었습니다.",
  "user": {
    "id": 3,
    "email": "user@example.com",
    "name": "테스트 사용자",
    "phone": "010-1234-5678",
    "role": "user",
    "created_at": "2025-01-22T12:00:00Z",
    "updated_at": "2025-01-22T12:00:00Z"
  },
  "tokens": {
    "access_token": "mock.jwt.token",
    "refresh_token": "mock.refresh.token"
  }
}
```

#### POST `/api/v1/auth/login`
로그인

**기본 계정:**
- 일반 사용자: `user@example.com` / `password123`
- 관리자: `admin@example.com` / `admin123`

**요청 예시:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### GET `/api/v1/auth/me` 🔒
현재 로그인 사용자 정보 (인증 필요)

**헤더:**
```
Authorization: Bearer <access_token>
```

---

### 매장 (Stores)

#### GET `/api/v1/stores`
매장 목록 조회

**쿼리 파라미터:**
- `region` (optional): 지역 필터 (예: "서울")
- `district` (optional): 구 필터 (예: "강남구")
- `page` (optional): 페이지 번호 (기본: 1)
- `page_size` (optional): 페이지 크기 (기본: 10)

#### GET `/api/v1/stores/locations`
가능한 지역 및 구 목록

**응답 예시:**
```json
{
  "regions": [
    {
      "region": "서울",
      "districts": ["강남구", "마포구", "중구", "송파구", "서초구"]
    }
  ]
}
```

#### GET `/api/v1/stores/:id`
매장 상세 조회

**쿼리 파라미터:**
- `include_products` (optional): `true`로 설정 시 해당 매장의 상품 포함

---

### 상품 (Products)

#### GET `/api/v1/products`
상품 목록 조회

**쿼리 파라미터:**
- `category` (optional): 카테고리 필터 (ring, necklace, earring, bracelet)
- `page`, `page_size`: 페이지네이션

#### GET `/api/v1/products/popular`
인기 상품 조회

**쿼리 파라미터:**
- `category` (optional): 카테고리 필터
- `limit` (optional): 결과 개수 제한

#### GET `/api/v1/products/:id`
상품 상세 조회 (옵션 포함)

---

### 장바구니 (Cart) 🔒

> 모든 장바구니 API는 인증이 필요합니다.

#### GET `/api/v1/cart`
내 장바구니 조회

#### POST `/api/v1/cart`
장바구니에 상품 추가

**요청 예시:**
```json
{
  "product_id": 1,
  "product_option_id": 101,
  "quantity": 2
}
```

#### PUT `/api/v1/cart/:id`
장바구니 상품 수량 변경

**요청 예시:**
```json
{
  "quantity": 3
}
```

#### DELETE `/api/v1/cart/:id`
장바구니에서 상품 제거

#### DELETE `/api/v1/cart`
장바구니 비우기

---

### 주문 (Orders) 🔒

> 모든 주문 API는 인증이 필요합니다.

#### GET `/api/v1/orders`
내 주문 목록 조회

#### POST `/api/v1/orders`
주문 생성 (장바구니에서)

**요청 예시 (배송):**
```json
{
  "fulfillment_type": "delivery",
  "shipping_address": "서울시 강남구 테헤란로 123"
}
```

**요청 예시 (픽업):**
```json
{
  "fulfillment_type": "pickup",
  "pickup_store_id": 1
}
```

#### GET `/api/v1/orders/:id`
주문 상세 조회

---

## Mock 데이터 관리

### 영속성 (Persistence)

Mock 데이터는 **localStorage**에 저장되어 페이지 새로고침 후에도 유지됩니다.

- **사용자 계정**: 새로 가입한 계정도 저장됨
- **장바구니**: 로그인 사용자의 장바구니 유지
- **주문**: 생성한 주문 이력 유지

### 데이터 초기화

브라우저 개발자 도구 콘솔에서:

```javascript
// Mock 데이터 완전 초기화
localStorage.removeItem('msw_mock_db');
location.reload();
```

---

## 아키텍처

```
src/mocks/
├── browser.ts              # MSW 브라우저 설정
├── handlers/
│   ├── auth.ts            # 인증 API 핸들러
│   ├── stores.ts          # 매장 API 핸들러
│   ├── products.ts        # 상품 API 핸들러
│   ├── cart.ts            # 장바구니 API 핸들러
│   ├── orders.ts          # 주문 API 핸들러
│   └── index.ts           # 핸들러 통합
├── data/
│   ├── stores.ts          # Mock 매장 데이터
│   └── products.ts        # Mock 상품 데이터
└── utils/
    ├── db.ts              # Mock 데이터베이스 (localStorage)
    └── auth.ts            # Mock JWT 유틸리티
```

### 설계 원칙

1. **Service Layer Pattern**: 실제 서비스 레이어 구조를 그대로 따름
2. **Schema-First**: Zod 스키마를 재사용하여 검증
3. **DRY**: 중복 없이 재사용 가능한 데이터 생성기
4. **KISS**: 단순하고 명확한 핸들러 구현
5. **YAGNI**: 실제 필요한 엔드포인트만 목업

---

## 개발 가이드

### 새 API 엔드포인트 추가하기

1. **핸들러 파일에 추가** (`src/mocks/handlers/[domain].ts`)

```typescript
export const myHandlers = [
  http.get('/api/v1/my-endpoint', () => {
    return HttpResponse.json({
      message: 'Success',
      data: mockData,
    });
  }),
];
```

2. **`src/mocks/handlers/index.ts`에 export**

```typescript
import { myHandlers } from './my-handlers';

export const handlers = [
  ...authHandlers,
  ...myHandlers, // 추가
];
```

3. **테스트**: ApiDemo 페이지에서 확인

### 인증 필요한 엔드포인트 추가하기

```typescript
http.get('/api/v1/protected', ({ request }) => {
  const userId = getUserIdFromAuth(request.headers.get('Authorization'));

  if (!userId) {
    return HttpResponse.json(
      { error: '인증이 필요합니다.' },
      { status: 401 }
    );
  }

  // Protected logic here
});
```

---

## 트러블슈팅

### Mock이 활성화되지 않음

1. `.env.development` 또는 `.env.local`에 `VITE_MOCK_API=true` 확인
2. 개발 서버 재시작 (`npm run dev`)
3. 브라우저 콘솔에서 `🎭 Mock API Enabled` 메시지 확인

### 401 Unauthorized 에러

- 로그인 후 받은 `access_token`을 Custom Headers에 추가:
  ```json
  {
    "Authorization": "Bearer <your_access_token>"
  }
  ```

### Mock 데이터가 이상함

- localStorage 초기화:
  ```javascript
  localStorage.removeItem('msw_mock_db');
  location.reload();
  ```

---

## 참고 자료

- [MSW 공식 문서](https://mswjs.io/)
- [프로젝트 아키텍처 가이드](./ARCHITECTURE.md)
- [API Demo 페이지](http://localhost:5173/apidemo)
