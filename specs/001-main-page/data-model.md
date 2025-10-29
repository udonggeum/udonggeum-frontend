# Data Model: Main Page (홈 화면)

**Feature**: Main Page
**Date**: 2025-10-28
**Purpose**: Define TypeScript interfaces for all entities used in the main page feature

## Overview

This document defines the data model for the main page feature. All interfaces will be placed in `src/types/index.ts`. Mock data implementing these interfaces will be in `src/constants/mockData.ts`.

## Core Entities

### Region (지역)

Represents a geographic location for filtering products.

```typescript
export interface Region {
  /**
   * Unique identifier for the region
   * @example "seoul-gangdong"
   */
  id: string;

  /**
   * Display name of the region in Korean
   * @example "서울 강동구"
   */
  name: string;

  /**
   * Parent city of the region
   * @example "서울"
   */
  city: string;

  /**
   * Order for displaying regions in dropdown (lower = first)
   * @example 1
   */
  displayOrder: number;
}
```

**Validation Rules**:
- `id`: Required, unique, lowercase-kebab-case
- `name`: Required, Korean characters with spaces
- `city`: Required, Korean characters
- `displayOrder`: Required, positive integer

**Sample Data**:
- 서울 강동구, 서울 강남구, 서울 종로구, 서울 중구
- 부산 해운대구
- 인천 남동구

---

### ProductCategory (상품 카테고리)

Represents a type of jewelry product.

```typescript
export interface ProductCategory {
  /**
   * Unique identifier for the category
   * @example "rings"
   */
  id: string;

  /**
   * Display name of the category in Korean
   * @example "반지"
   */
  name: string;

  /**
   * Order for displaying categories in dropdown and tabs (lower = first)
   * @example 1
   */
  displayOrder: number;

  /**
   * Optional icon identifier (for future use)
   * @example "ring-icon"
   */
  icon?: string;
}
```

**Validation Rules**:
- `id`: Required, unique, lowercase-kebab-case
- `name`: Required, Korean characters
- `displayOrder`: Required, positive integer
- `icon`: Optional, string

**Sample Data**:
- 반지 (rings)
- 목걸이 (necklaces)
- 팔찌 (bracelets)
- 귀걸이 (earrings)
- 발찌 (anklets)

---

### Product (상품)

Represents a jewelry item available for sale.

```typescript
export interface Product {
  /**
   * Unique identifier for the product
   * @example "prod-001"
   */
  id: string;

  /**
   * Product name in Korean
   * @example "18K 금 반지"
   */
  name: string;

  /**
   * Price in Korean Won (₩)
   * @example 350000
   */
  price: number;

  /**
   * URL to product image
   * @example "https://images.unsplash.com/photo-..."
   */
  imageUrl: string;

  /**
   * Alt text for image (accessibility)
   * @example "18K 금 반지 상품 이미지"
   */
  imageAlt: string;

  /**
   * Category ID this product belongs to
   * @example "rings"
   */
  categoryId: string;

  /**
   * Region ID where this product is available
   * @example "seoul-gangnam"
   */
  regionId: string;

  /**
   * Whether product is in user's wishlist
   * @default false
   */
  isWishlisted: boolean;

  /**
   * Whether product is in user's cart
   * @default false
   */
  isInCart: boolean;

  /**
   * Store name offering this product (for future use)
   */
  storeName?: string;
}
```

**Validation Rules**:
- `id`: Required, unique
- `name`: Required, Korean characters with spaces
- `price`: Required, positive number (integer in Won)
- `imageUrl`: Required, valid URL
- `imageAlt`: Required, Korean text
- `categoryId`: Required, must match existing ProductCategory.id
- `regionId`: Required, must match existing Region.id
- `isWishlisted`, `isInCart`: Required, boolean
- `storeName`: Optional, Korean characters

**Relationships**:
- `categoryId` → ProductCategory (many-to-one)
- `regionId` → Region (many-to-one)

---

### CarouselSlide (캐러셀 슬라이드)

Represents promotional content in the hero carousel.

```typescript
export interface CarouselSlide {
  /**
   * Unique identifier for the slide
   * @example "slide-1"
   */
  id: string;

  /**
   * URL to carousel image
   * @example "https://images.unsplash.com/photo-..."
   */
  imageUrl: string;

  /**
   * Alt text for image (accessibility)
   * @example "우리동네 최고의 금은방 프로모션"
   */
  altText: string;

  /**
   * Optional text overlay displayed on the image
   * @example "우리동네 최고의 금은방"
   */
  overlayText?: string;

  /**
   * Optional destination URL when slide is clicked
   * @example "/promotions/summer-sale"
   */
  linkUrl?: string;

  /**
   * Order for displaying slides (lower = first)
   * @example 1
   */
  displayOrder: number;
}
```

**Validation Rules**:
- `id`: Required, unique
- `imageUrl`: Required, valid URL
- `altText`: Required, Korean text
- `overlayText`: Optional, Korean text
- `linkUrl`: Optional, valid URL or route path
- `displayOrder`: Required, positive integer

**Sample Data**: 3 slides minimum (per FR-005)

---

### NavigationItem (네비게이션 항목)

Represents a menu link in the navigation bar.

```typescript
export interface NavigationItem {
  /**
   * Unique identifier for the navigation item
   * @example "products"
   */
  id: string;

  /**
   * Display label in Korean
   * @example "상품"
   */
  label: string;

  /**
   * Destination path for React Router
   * @example "/products"
   */
  path: string;

  /**
   * Order for displaying in menu (lower = first)
   * @example 1
   */
  displayOrder: number;

  /**
   * Optional icon identifier (for future use)
   * @example "shopping-bag"
   */
  icon?: string;
}
```

**Validation Rules**:
- `id`: Required, unique, lowercase-kebab-case
- `label`: Required, Korean characters
- `path`: Required, valid route path starting with "/"
- `displayOrder`: Required, positive integer
- `icon`: Optional, string

**Sample Data**:
- 상품 → /products
- 매장 → /stores
- 장바구니 → /cart
- 로그인/마이페이지 → /account

---

## Supporting Types

### SearchFilters

Represents the current state of search filters.

```typescript
export interface SearchFilters {
  /**
   * Selected region ID (null = no filter)
   */
  regionId: string | null;

  /**
   * Selected category ID (null = no filter)
   */
  categoryId: string | null;
}
```

**Usage**: State management for SearchSection component

---

### CarouselState

Represents the current state of the hero carousel.

```typescript
export interface CarouselState {
  /**
   * Index of currently displayed slide (0-based)
   */
  currentSlideIndex: number;

  /**
   * Whether auto-play is active
   */
  isAutoPlaying: boolean;
}
```

**Usage**: State management for HeroCarousel component

---

## Mock Data Structure

Mock data will be exported from `src/constants/mockData.ts`:

```typescript
// src/constants/mockData.ts
export const MOCK_REGIONS: Region[] = [ /* ... */ ];
export const MOCK_CATEGORIES: ProductCategory[] = [ /* ... */ ];
export const MOCK_PRODUCTS: Product[] = [ /* ... */ ];
export const MOCK_CAROUSEL_SLIDES: CarouselSlide[] = [ /* ... */ ];
export const MOCK_NAV_ITEMS: NavigationItem[] = [ /* ... */ ];
```

**Data Volume**:
- Regions: 6 items (per FR-002)
- Categories: 5 items (per FR-003)
- Products: 12-16 items (3-4 per category for grid display)
- Carousel Slides: 3 items (per FR-005)
- Navigation Items: 4 items (per FR-001)

---

## Future Migration to API

When integrating with backend API:

1. Create Zod schemas in `src/schemas/` (per constitution):
   ```typescript
   // src/schemas/products.ts
   export const RegionSchema = z.object({
     id: z.string(),
     name: z.string(),
     city: z.string(),
     displayOrder: z.number().int().positive(),
   });

   export type Region = z.infer<typeof RegionSchema>;
   ```

2. Create service layer in `src/services/`:
   ```typescript
   // src/services/products.ts
   class ProductsService {
     async getProducts(filters?: SearchFilters): Promise<Product[]> {
       const response = await apiClient.get('/products', { params: filters });
       return ProductsResponseSchema.parse(response.data);
     }
   }
   ```

3. Create TanStack Query hooks in `src/hooks/queries/`:
   ```typescript
   // src/hooks/queries/useProductsQueries.ts
   export const productsKeys = {
     all: ['products'] as const,
     list: (filters?: SearchFilters) => [...productsKeys.all, 'list', filters] as const,
   };

   export function useProducts(filters?: SearchFilters) {
     return useQuery({
       queryKey: productsKeys.list(filters),
       queryFn: () => productsService.getProducts(filters),
     });
   }
   ```

4. Replace mock data imports with query hooks in components

---

## Entity Relationships

```
NavigationItem (4)
  ↓ (no relations)

Region (6)
  ↓ (1-to-many)
Product (12-16)
  ↓ (many-to-1)
ProductCategory (5)

CarouselSlide (3)
  ↓ (no relations)
```

**Notes**:
- No foreign key constraints needed for mock data (just string IDs)
- When API integration occurs, backend will enforce referential integrity
- Products can belong to only one region and one category
- All entities are independent except Product (references Region + Category)
