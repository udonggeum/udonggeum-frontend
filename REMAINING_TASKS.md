# 우동금 프론트엔드 남은 작업 목록

마지막 업데이트: 2025-01-17

## ✅ 완료된 작업 (Phase 1)

### 인증 및 사용자 관리
- [x] 사용자 로그인/회원가입
- [x] 사용자 프로필 조회 (MyPage)
- [x] 사용자 프로필 수정 (ProfileEditPage)
- [x] 로그아웃
- [x] 자동 토큰 갱신

### 상품 관리
- [x] 상품 목록 조회 (ProductsPage)
- [x] 상품 상세 조회 (ProductDetailPage)
- [x] 카테고리 필터링 (멀티 선택)
- [x] 지역/상품/정렬 필터

### 가게 관리
- [x] 가게 목록 조회 (StoresPage)
- [x] 가게 상세 조회 (StoreDetailPage)

### 장바구니
- [x] 장바구니 기본 UI (CartPage)

### 주문
- [x] 주문 생성 기본 UI (OrderPage)
- [x] 주문 내역 조회 (OrderHistoryPage)
- [x] 주문 상태별 필터링

### 찜 기능
- [x] 찜 추가/삭제 (ProductCard 연동)
- [x] 찜 목록 조회 (WishlistPage)
- [x] 찜 목록 통계 (MyPage)

---

## 🚧 남은 작업 (우선순위별)

### Phase 2: 배송 주소 관리 (우선순위: 높음)

**백엔드 API: ✅ 완료**
- GET /api/v1/addresses - 주소 목록 조회
- POST /api/v1/addresses - 주소 추가
- PUT /api/v1/addresses/:id - 주소 수정
- DELETE /api/v1/addresses/:id - 주소 삭제
- PUT /api/v1/addresses/:id/default - 기본 배송지 설정

**프론트엔드 작업 필요:**

#### 5.1 주소 스키마 및 서비스 생성
```
파일: src/schemas/address.ts
- AddressSchema (id, user_id, name, recipient, phone, address, is_default, created_at, updated_at)
- AddressesResponseSchema (addresses: Address[])
- AddToAddressRequestSchema (name, recipient, phone, address, is_default)
- UpdateAddressRequestSchema (name?, recipient?, phone?, address?)
- AddressMessageResponseSchema (message: string)
```

```
파일: src/services/address.ts
- getAddresses(): Promise<AddressesResponse>
- addAddress(data: AddToAddressRequest): Promise<AddressMessageResponse>
- updateAddress(id: number, data: UpdateAddressRequest): Promise<AddressMessageResponse>
- deleteAddress(id: number): Promise<AddressMessageResponse>
- setDefaultAddress(id: number): Promise<AddressMessageResponse>
```

#### 5.2 TanStack Query 훅 생성
```
파일: src/hooks/queries/useAddressQueries.ts
- addressKeys (query key factory)
- useAddresses() - 주소 목록 조회
- useAddAddress() - 주소 추가 mutation
- useUpdateAddress() - 주소 수정 mutation
- useDeleteAddress() - 주소 삭제 mutation (낙관적 업데이트)
- useSetDefaultAddress() - 기본 배송지 설정 mutation
```

#### 5.3 AddressManagementPage 컴포넌트 생성
```
파일: src/pages/AddressManagementPage.tsx
기능:
- 저장된 주소 목록 표시 (카드 형태)
- 기본 배송지 표시 (배지)
- "주소 추가" 버튼 (모달 열기)
- 각 주소 카드: 수정/삭제 버튼
- 기본 배송지로 설정 버튼
- 빈 상태: "등록된 배송지가 없습니다"
```

#### 5.4 AddressFormModal 컴포넌트 생성
```
파일: src/components/AddressFormModal.tsx
기능:
- 주소 추가/수정 폼 (모달)
- 필드: 배송지명(name), 받는사람(recipient), 전화번호(phone), 주소(address)
- 체크박스: 기본 배송지로 설정
- Zod 유효성 검사 (react-hook-form + zodResolver)
```

#### 5.5 라우트 및 내비게이션 추가
```
파일: src/App.tsx
- /mypage/addresses → <AddressManagementPage /> (ProtectedRoute)
```

```
파일: src/pages/MyPage.tsx
- "배송지 관리" 버튼 추가 (회원 정보 섹션 아래)
```

---

### Phase 3: 비밀번호 재설정 (우선순위: 중간)

**백엔드 API: ✅ 완료**
- POST /api/v1/auth/forgot-password - 비밀번호 재설정 요청 (이메일로 토큰 전송)
- POST /api/v1/auth/reset-password - 비밀번호 재설정 (토큰 + 새 비밀번호)

**프론트엔드 작업 필요:**

#### 6.1 비밀번호 재설정 스키마 및 서비스
```
파일: src/schemas/auth.ts (기존 파일에 추가)
- ForgotPasswordRequestSchema (email: string)
- ResetPasswordRequestSchema (token: string, password: string)
- MessageResponseSchema (message: string)
```

```
파일: src/services/auth.ts (기존 파일에 추가)
- forgotPassword(email: string): Promise<MessageResponse>
- resetPassword(token: string, password: string): Promise<MessageResponse>
```

#### 6.2 TanStack Query 훅
```
파일: src/hooks/queries/useAuthQueries.ts (기존 파일에 추가)
- useForgotPassword() - 비밀번호 재설정 요청 mutation
- useResetPassword() - 비밀번호 재설정 mutation
```

#### 6.3 ForgotPasswordPage 컴포넌트
```
파일: src/pages/ForgotPasswordPage.tsx
기능:
- 이메일 입력 필드
- "재설정 링크 전송" 버튼
- 성공 시: "이메일로 재설정 링크를 전송했습니다" 메시지
- 로그인 페이지로 돌아가기 링크
```

#### 6.4 ResetPasswordPage 컴포넌트
```
파일: src/pages/ResetPasswordPage.tsx
기능:
- URL 쿼리에서 토큰 추출 (/reset-password?token=xxx)
- 새 비밀번호 입력 필드 (PasswordInput 사용)
- 비밀번호 확인 필드
- "비밀번호 변경" 버튼
- 성공 시: 로그인 페이지로 리다이렉트
```

#### 6.5 라우트 추가
```
파일: src/App.tsx
- /forgot-password → <ForgotPasswordPage /> (MinimalLayout)
- /reset-password → <ResetPasswordPage /> (MinimalLayout)
```

```
파일: src/pages/LoginPage.tsx
- "비밀번호를 잊으셨나요?" 링크 추가 (/forgot-password)
```

---

### Phase 4: 판매자 대시보드 (우선순위: 중간)

**백엔드 API: ✅ 완료**
- GET /api/v1/seller/dashboard - 판매자 통계 (총 주문, 매출, 상품 수 등)
- POST /api/v1/seller/stores - 가게 생성
- PUT /api/v1/seller/stores/:id - 가게 수정
- DELETE /api/v1/seller/stores/:id - 가게 삭제
- POST /api/v1/seller/products - 상품 생성
- PUT /api/v1/seller/products/:id - 상품 수정
- DELETE /api/v1/seller/products/:id - 상품 삭제
- GET /api/v1/seller/orders - 판매자 주문 목록
- PUT /api/v1/seller/orders/:id/status - 주문 상태 변경

**프론트엔드 작업 필요:**

#### 7.1 판매자 스키마 및 서비스
```
파일: src/schemas/seller.ts
- DashboardStatsSchema (total_orders, pending_orders, total_revenue, total_products 등)
- CreateStoreRequestSchema (name, description, address, phone, business_hours)
- UpdateStoreRequestSchema (name?, description?, address?, phone?, business_hours?)
- CreateProductRequestSchema (store_id, name, description, price, category, image_url)
- UpdateProductRequestSchema (name?, description?, price?, category?, image_url?)
- UpdateOrderStatusRequestSchema (status: 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled')
```

```
파일: src/services/seller.ts
- getDashboardStats(): Promise<DashboardStats>
- createStore(data: CreateStoreRequest): Promise<Store>
- updateStore(id: number, data: UpdateStoreRequest): Promise<Store>
- deleteStore(id: number): Promise<MessageResponse>
- createProduct(data: CreateProductRequest): Promise<Product>
- updateProduct(id: number, data: UpdateProductRequest): Promise<Product>
- deleteProduct(id: number): Promise<MessageResponse>
- getSellerOrders(): Promise<OrdersResponse>
- updateOrderStatus(id: number, status: string): Promise<MessageResponse>
```

#### 7.2 TanStack Query 훅
```
파일: src/hooks/queries/useSellerQueries.ts
- sellerKeys (query key factory)
- useDashboardStats() - 통계 조회
- useCreateStore() - 가게 생성 mutation
- useUpdateStore() - 가게 수정 mutation
- useDeleteStore() - 가게 삭제 mutation
- useCreateProduct() - 상품 생성 mutation
- useUpdateProduct() - 상품 수정 mutation
- useDeleteProduct() - 상품 삭제 mutation
- useSellerOrders() - 판매자 주문 목록 조회
- useUpdateOrderStatus() - 주문 상태 변경 mutation
```

#### 7.3 SellerDashboardPage 컴포넌트
```
파일: src/pages/seller/SellerDashboardPage.tsx
기능:
- 통계 카드: 총 주문, 대기중 주문, 총 매출, 상품 수, 평균 평점 등
- 최근 주문 미리보기 (5개)
- "내 가게 관리" 버튼 → /seller/stores
- "상품 관리" 버튼 → /seller/products
- "주문 관리" 버튼 → /seller/orders
```

#### 7.4 SellerStoresPage 컴포넌트
```
파일: src/pages/seller/SellerStoresPage.tsx
기능:
- 내 가게 목록 (카드 형태)
- "가게 추가" 버튼 (모달 열기)
- 각 가게 카드: 수정/삭제 버튼
- 빈 상태: "등록된 가게가 없습니다"
```

#### 7.5 SellerProductsPage 컴포넌트
```
파일: src/pages/seller/SellerProductsPage.tsx
기능:
- 내 상품 목록 (테이블 또는 그리드)
- "상품 추가" 버튼 (모달 열기)
- 각 상품: 수정/삭제 버튼
- 필터: 가게별, 카테고리별
```

#### 7.6 SellerOrdersPage 컴포넌트
```
파일: src/pages/seller/SellerOrdersPage.tsx
기능:
- 주문 목록 (OrderCard 재사용 가능)
- 주문 상태 변경 드롭다운
- 필터: 주문 상태별, 가게별
- 주문 상세 보기 (모달 또는 별도 페이지)
```

#### 7.7 라우트 추가 (판매자 전용)
```
파일: src/App.tsx
- /seller/dashboard → <SellerDashboardPage /> (ProtectedRoute + SellerOnly)
- /seller/stores → <SellerStoresPage /> (ProtectedRoute + SellerOnly)
- /seller/products → <SellerProductsPage /> (ProtectedRoute + SellerOnly)
- /seller/orders → <SellerOrdersPage /> (ProtectedRoute + SellerOnly)
```

#### 7.8 SellerRoute 컴포넌트 생성
```
파일: src/components/SellerRoute.tsx
기능:
- useAuthStore에서 user.role 확인
- role이 'seller' 또는 'admin'이 아니면 403 페이지로 리다이렉트
```

---

## 📝 추가 개선 사항 (선택 사항)

### 8. 주문 상세 페이지
```
파일: src/pages/OrderDetailPage.tsx
기능:
- 주문 번호, 주문 날짜, 주문 상태, 결제 상태
- 주문 상품 목록 (상품명, 수량, 가격, 옵션)
- 배송 정보 (배송 주소 또는 픽업 가게)
- 총 결제 금액
- 주문 취소 버튼 (상태가 'pending'일 때만)
```

### 9. 리뷰/평점 시스템
**백엔드 API 추가 필요**
- POST /api/v1/products/:id/reviews - 리뷰 작성
- GET /api/v1/products/:id/reviews - 리뷰 목록
- DELETE /api/v1/reviews/:id - 리뷰 삭제

### 10. 알림/푸시 시스템
**백엔드 API 추가 필요**
- GET /api/v1/notifications - 알림 목록
- PUT /api/v1/notifications/:id/read - 알림 읽음 처리

### 11. 검색 기능 개선
- 상품 전체 검색 (이름, 설명, 카테고리)
- 가게 검색
- 자동완성

### 12. 성능 최적화
- 이미지 레이지 로딩 (react-intersection-observer)
- 무한 스크롤 (useInfiniteQuery)
- 번들 사이즈 최적화

### 13. 접근성 개선
- ARIA 라벨 추가
- 키보드 내비게이션
- 스크린 리더 지원

### 14. 다국어 지원 (i18n)
- react-i18next 설정
- 한국어/영어 지원

---

## 🔧 버그 수정 및 기술 부채

### 15. ESLint 오류 수정
```
현재 린트 오류:
- LoginPage.test.tsx: TypeScript any 타입 사용
- client.ts: Promise rejection 타입
- ProductCard.tsx: Floating promises
- MyPage.tsx: Floating promises (navigate 호출)
- ProfileEditPage.tsx: Floating promises (navigate 호출)
```

**해결 방법:**
- 모든 navigate() 호출을 void 연산자로 감싸기: `void navigate('/')`
- 테스트 파일의 any 타입을 구체적인 타입으로 변경
- Promise rejection을 Error 타입으로 변경

### 16. MSW 핸들러 업데이트
```
파일: src/mocks/handlers/
- address.ts 추가 (배송 주소 API 모킹)
- seller.ts 추가 (판매자 API 모킹)
- auth.ts (비밀번호 재설정 핸들러 추가)
```

### 17. API 엔드포인트 상수 추가
```
파일: src/constants/api.ts (ENDPOINTS 객체에 추가)
- ADDRESSES: { LIST, ADD, UPDATE, DELETE, SET_DEFAULT }
- SELLER: { DASHBOARD, STORES, PRODUCTS, ORDERS }
- AUTH: { FORGOT_PASSWORD, RESET_PASSWORD } (기존 AUTH에 추가)
```

---

## 📋 작업 진행 체크리스트 템플릿

각 기능 구현 시 다음 체크리스트를 사용하세요:

- [ ] Zod 스키마 정의 (src/schemas/)
- [ ] 서비스 레이어 구현 (src/services/)
- [ ] TanStack Query 훅 구현 (src/hooks/queries/)
- [ ] 페이지/컴포넌트 구현 (src/pages/, src/components/)
- [ ] 라우트 추가 (src/App.tsx)
- [ ] MSW 핸들러 추가 (src/mocks/handlers/)
- [ ] API 엔드포인트 상수 추가 (src/constants/api.ts)
- [ ] 린트 검사 통과 (npm run lint)
- [ ] 타입 검사 통과 (npm run build)
- [ ] 수동 테스트 (브라우저에서 동작 확인)
- [ ] 빈 상태(Empty state) 처리
- [ ] 에러 상태(Error state) 처리
- [ ] 로딩 상태(Loading state) 처리
- [ ] 성공 메시지/토스트 표시

---

## 📚 참고 문서

- `docs/ARCHITECTURE.md` - 아키텍처 가이드
- `docs/STYLE_GUIDE.md` - 코드 스타일 가이드
- `CLAUDE.md` - 프로젝트 개요 및 컨벤션
- `docs/우동금_FigJam_페이지별_와이어프레임_흐름도.md` - UI/UX 플로우

---

**작업 우선순위 요약:**
1. 🔴 **Phase 2: 배송 주소 관리** (OrderPage에서 필요)
2. 🟡 **Phase 3: 비밀번호 재설정** (사용자 편의성)
3. 🟡 **Phase 4: 판매자 대시보드** (핵심 기능)
4. 🟢 **Phase 5+: 추가 개선 사항** (선택적)

---

**사용 방법:**
1. 위 목록에서 구현할 기능 선택
2. 해당 Phase의 세부 작업 항목 확인
3. 체크리스트 템플릿을 사용하여 단계별 구현
4. 완료 후 이 파일에서 [x] 표시로 업데이트

**Claude Code에게 작업 요청 시:**
```
"Phase 2의 5.1부터 5.5까지 작업해줘"
"배송 주소 관리 기능 전체 구현해줘"
"Phase 3 비밀번호 재설정 작업 진행해줘"
```


• - npm run lint 기준으로 아직 남은 오류들:
      - src/pages/OrderPage.tsx:345, 371, 385, 422에서 void navigate/void 처리 없이 Promise를 반환하는 핸들러들이 있어 no-floating-promises가 발생합니다.
      - src/pages/ProfileEditPage.tsx:37, 45, 161, 299에 같은 문제가 있고, 버튼 onClick에 직접 async 함수를 넘겨서 no-misused-promises가 뜹니다.
      - src/pages/RegisterPage.test.tsx 전반(43~242줄)에 any 기반 모킹이 그대로 남아 있어, 이번에 LoginPage.test에 적용한 패턴처럼 UseMutationResult 기반
        헬퍼를 만들어야 합니다.
      - tests/integration/*.test.tsx는 여전히 tsconfig에 포함되지 않아 파싱 에러가 나오므로, eslint.config.js의 globalIgnores에 tests 폴더를 추가로 넣었지
        만 .eslintignore가 남아 있어 ESLint가 경고를 띄웁니다. .eslintignore 파일을 제거하거나 동일 내용을 eslint.config.js의 ignores로 옮겨야 경고가 사라
        집니다.
      - src/pages/LoginPage.tsx와 MyPage.tsx, MainPage.tsx에서 적용한 void navigate / ZodError 처리 패턴을 OrderPage, ProfileEditPage 등에도 반복 적용하면
        대부분의 remaining lint가 해결됩니다.