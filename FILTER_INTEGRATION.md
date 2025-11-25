# Dynamic Product Filters Integration

**날짜:** 2025-11-24
**상태:** ✅ 완료

## 개요

Backend의 `/api/v1/products/filters` 엔드포인트를 Frontend에 통합하여 동적 필터 기능을 구현했습니다.

---

## 변경 사항

### 1. Schema 추가 (`src/schemas/products.ts`)

```typescript
export const ProductFiltersResponseSchema = z.object({
  categories: z.array(z.string().min(1)),
  materials: z.array(z.string().min(1)),
});

export type ProductFiltersResponse = z.infer<typeof ProductFiltersResponseSchema>;
```

### 2. API Endpoint 추가 (`src/constants/api.ts`)

```typescript
PRODUCTS: {
  LIST: '/api/v1/products',
  FILTERS: '/api/v1/products/filters',  // ✨ 새로 추가
  POPULAR: '/api/v1/products/popular',
  // ...
}
```

### 3. Service 메서드 추가 (`src/services/products.ts`)

```typescript
async getProductFilters(): Promise<ProductFiltersResponse> {
  const response = await apiClient.get(ENDPOINTS.PRODUCTS.FILTERS);
  return ProductFiltersResponseSchema.parse(response.data);
}
```

### 4. React Query Hook 추가 (`src/hooks/queries/useProductsQueries.ts`)

```typescript
export function useProductFilters() {
  return useQuery({
    queryKey: productsKeys.filters(),
    queryFn: () => productsService.getProductFilters(),
    staleTime: 1000 * 60 * 60, // 1 hour (filters rarely change)
    gcTime: 1000 * 60 * 60 * 2, // 2 hours cache time
  });
}
```

**특징:**
- 1시간 staleTime: 필터는 자주 변경되지 않으므로 캐싱
- 2시간 gcTime: 메모리 효율성

### 5. Filter Adapters 유틸리티 생성 (`src/utils/filterAdapters.ts`)

Backend의 영문 카테고리/재질을 한글 레이블로 변환하는 어댑터 함수:

```typescript
// Backend: "ring" → Frontend: { id: "ring", name: "반지", displayOrder: 1 }
adaptFiltersToCategories(filters: ProductFiltersResponse): ProductCategory[]

// Backend: "gold" → Frontend: { id: "gold", name: "골드", displayOrder: 1 }
adaptFiltersToMaterials(filters: ProductFiltersResponse)

getCategoryLabel(categoryId: string): string
getMaterialLabel(materialId: string): string
```

**지원하는 카테고리:**
- `ring` → 반지
- `bracelet` → 팔찌
- `necklace` → 목걸이
- `earring` → 귀걸이
- `other` → 기타

**지원하는 재질:**
- `gold` → 골드
- `silver` → 실버
- `other` → 기타

### 6. ProductsPage 업데이트 (`src/pages/ProductsPage.tsx`)

```typescript
// 동적 필터 로드 (fallback: MOCK_CATEGORIES)
const { data: filtersData } = useProductFilters();

const categories = useMemo(
  () => (filtersData ? adaptFiltersToCategories(filtersData) : MOCK_CATEGORIES),
  [filtersData]
);

// 컴포넌트에 전달
<CategorySidebar categories={categories} ... />
```

**장점:**
- Backend API 에러 시 MOCK_CATEGORIES로 fallback
- 기존 컴포넌트 구조 유지
- 타입 안전성 보장

---

## 사용 방법

### 컴포넌트에서 사용

```typescript
import { useProductFilters } from '@/hooks/queries/useProductsQueries';
import { adaptFiltersToCategories, adaptFiltersToMaterials } from '@/utils/filterAdapters';

function MyComponent() {
  const { data, isLoading, error } = useProductFilters();

  if (isLoading) return <div>로딩 중...</div>;
  if (error) return <div>에러 발생</div>;

  const categories = adaptFiltersToCategories(data);
  const materials = adaptFiltersToMaterials(data);

  return (
    <div>
      <h3>카테고리</h3>
      {categories.map(cat => (
        <div key={cat.id}>{cat.name}</div>
      ))}

      <h3>재질</h3>
      {materials.map(mat => (
        <div key={mat.id}>{mat.name}</div>
      ))}
    </div>
  );
}
```

---

## Backend 응답 예시

**GET /api/v1/products/filters**

```json
{
  "categories": ["ring", "bracelet", "necklace", "earring", "other"],
  "materials": ["gold", "silver", "other"]
}
```

---

## 기술적 특징

### 1. 타입 안전성
- Zod schema로 런타임 검증
- TypeScript 타입 추론 자동화

### 2. 에러 처리
- API 실패 시 MOCK_CATEGORIES fallback
- 기존 기능 중단 없음

### 3. 성능 최적화
- React Query로 자동 캐싱
- 1시간 staleTime으로 불필요한 요청 방지
- useMemo로 불필요한 재계산 방지

### 4. 유지보수성
- 중앙화된 필터 관리
- Backend와 Frontend 동기화
- 새 카테고리/재질 추가 시 Backend만 수정

---

## ✅ 추가 완료된 기능 (2025-11-24)

### 1. 모든 컴포넌트에 동적 필터 적용 완료
- ✅ `StoreDetailPage.tsx` - 동적 카테고리 적용
- ✅ `StoresPage.tsx` - 동적 카테고리 적용
- ✅ `MainHeroSection.tsx` - 동적 카테고리 적용
- ✅ `PopularProductsCarousel.tsx` - 동적 카테고리 적용

### 2. 재질 필터 UI 추가 완료
- ✅ `ProductsPage.tsx`에 재질 필터 칩 추가
- ✅ 카테고리 선택 시 재질 필터 표시
- ✅ API 요청에 material 파라미터 통합
- ✅ 예: "반지" 선택 → "골드", "실버" 등 재질 선택 가능

**사용 흐름:**
1. 카테고리 선택 (예: 반지)
2. 재질 필터 UI 자동 표시
3. 재질 선택 (예: 골드)
4. API 요청: `GET /api/v1/products?category=ring&material=gold`

### 3. 향후 개선 사항
- 관리자 페이지에서 필터 관리
- 표시 순서, 레이블 수정 기능

---

## 테스트 결과

✅ TypeScript 컴파일 성공
✅ Vite 프로덕션 빌드 성공
✅ 기존 기능 호환성 유지
✅ Type safety 검증 완료

---

## 결론

`GET /api/v1/products/filters` 엔드포인트가 Frontend에 성공적으로 통합되었습니다.

- **안전성:** Fallback 메커니즘으로 안정적 동작
- **확장성:** 새 카테고리 추가 시 코드 수정 불필요
- **유지보수성:** Backend와 Frontend 동기화

이제 이 엔드포인트는 **사용 중**으로 표시할 수 있습니다. ✨
