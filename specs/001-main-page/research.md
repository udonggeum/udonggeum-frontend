# Research: Main Page (홈 화면)

**Feature**: Main Page implementation
**Date**: 2025-10-28
**Purpose**: Research component patterns, DaisyUI usage, carousel implementations, and mock data structure for MVP

## Research Areas

### 1. DaisyUI Component Patterns

**Decision**: Use DaisyUI's pre-built components as documented in @docs/main-page-components.md

**Components to use**:
- **Navbar**: `navbar`, `navbar-start`, `navbar-center`, `navbar-end`, `dropdown`, `menu`
- **Dropdowns**: `dropdown`, `dropdown-content` with `btn-outline` styling
- **Carousel**: `carousel`, `carousel-item` with manual navigation buttons
- **Tabs**: `tabs`, `tabs-border`, `tab`, `tab-content` (radio-based, no JS needed)
- **Cards**: `card`, `card-body`, `card-actions` for product displays
- **Footer**: `footer`, `footer-title`, `footer-center` components

**Rationale**: DaisyUI provides accessible, well-tested components that match the constitution's UX consistency requirements. Components are already documented with Korean labels in the spec docs.

**Alternatives considered**:
- Custom components from scratch → Rejected: Would require more development time and accessibility testing
- Other UI libraries (Material-UI, Chakra) → Rejected: Project already committed to TailwindCSS + DaisyUI stack

### 2. Carousel Auto-Play Implementation

**Decision**: Use `useEffect` with `setInterval` for auto-advance, combined with DaisyUI carousel structure

**Implementation approach**:
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }, 5000); // 5 seconds per spec FR-005

  return () => clearInterval(interval);
}, [totalSlides]);
```

**Rationale**: Simple, performant, and doesn't require external libraries. Meets constitution's performance requirements (<300ms interaction response).

**Alternatives considered**:
- Third-party carousel library (Swiper, React Slick) → Rejected: Adds bundle size, overkill for simple auto-advance
- CSS-only animations → Rejected: Difficult to pause on user interaction, less control

### 3. Responsive Navigation Pattern

**Decision**: CSS-based responsive toggle (Tailwind `lg:flex` / `lg:hidden`) with DaisyUI dropdown for mobile

**Breakpoint**: 1024px (`lg:` prefix in Tailwind)
- **Mobile (<1024px)**: Hamburger menu with `dropdown` component
- **Desktop (≥1024px)**: Horizontal `menu-horizontal` layout

**Rationale**: Follows spec assumption #7 (1024px breakpoint) and constitution's accessibility requirements. DaisyUI dropdown is keyboard-accessible by default.

**Alternatives considered**:
- JavaScript-based toggle with state → Rejected: CSS approach is simpler and more performant
- Different breakpoint (768px) → Rejected: Spec explicitly assumes 1024px

### 4. Mock Data Structure

**Decision**: Create TypeScript interfaces matching spec's Key Entities, populate with realistic Korean data

**Data files**:
- `src/constants/mockData.ts`: Export arrays of mock data
- `src/types/index.ts`: TypeScript interfaces

**Mock data to create**:

**Regions** (6 items per FR-002):
```typescript
interface Region {
  id: string;
  name: string;        // "서울 강동구", "서울 강남구", etc.
  city: string;        // "서울", "부산", "인천"
  displayOrder: number;
}
```

**Product Categories** (5 items per FR-003):
```typescript
interface ProductCategory {
  id: string;
  name: string;        // "반지", "목걸이", "팔찌", "귀걸이", "발찌"
  displayOrder: number;
}
```

**Products** (12-16 items for grid display):
```typescript
interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string;    // category ID
  region: string;      // region ID
  isWishlisted: boolean;
  isInCart: boolean;
}
```

**Carousel Slides** (3 items per FR-005):
```typescript
interface CarouselSlide {
  id: string;
  imageUrl: string;
  altText: string;
  overlayText?: string;
  linkUrl?: string;
  displayOrder: number;
}
```

**Navigation Items** (4 items per FR-001):
```typescript
interface NavigationItem {
  id: string;
  label: string;       // "상품", "매장", "장바구니", "로그인/마이페이지"
  path: string;        // "/products", "/stores", "/cart", "/account"
  displayOrder: number;
}
```

**Rationale**: Structured data matches spec entities, ready for API integration (just swap mock data for API calls). Korean text provides realistic previews.

**Alternatives considered**:
- Hardcoded inline data → Rejected: Difficult to maintain, doesn't prepare for API migration
- JSON files → Rejected: TypeScript interfaces provide better type safety

### 5. Image Assets Strategy

**Decision**: Use placeholder images from public CDNs (Unsplash, Picsum) for MVP

**Asset categories**:
- **Hero carousel**: 3 high-quality jewelry/store images (1920x600px)
- **Product photos**: 12-16 jewelry item images (400x400px)
- **Logo**: Simple text-based logo or placeholder (150x50px)

**Image optimization**:
- Use modern formats (WebP with JPEG fallback)
- Lazy-load product grid images below the fold
- Optimize carousel images for mobile (<800px width on mobile)

**Rationale**: Meets constitution's performance requirements (SC-003: <2MB total page weight). Placeholder images allow MVP development without waiting for final assets.

**Alternatives considered**:
- Wait for final brand assets → Rejected: Blocks development, placeholder acceptable for MVP
- Use local image files → Rejected: Increases repo size, CDN more realistic for production

### 6. Filter/Search Behavior

**Decision**: Client-side filtering with immediate results (no navigation)

**Flow**:
1. User selects region + category from dropdowns
2. Clicks "검색" button
3. Product grid filters in-place (no page reload)
4. If no results: show "해당 지역에 상품이 없습니다" message (per edge case)

**Implementation**:
```typescript
const filteredProducts = products.filter(product => {
  const matchesRegion = !selectedRegion || product.region === selectedRegion;
  const matchesCategory = !selectedCategory || product.category === selectedCategory;
  return matchesRegion && matchesCategory;
});
```

**Rationale**: Aligns with spec assumption #3 (search doesn't navigate away). Simple, fast, no backend needed for MVP.

**Alternatives considered**:
- Navigate to separate results page → Rejected: Spec implies in-place filtering
- Server-side filtering → Rejected: No backend in MVP

### 7. Loading States

**Decision**: Implement skeleton loaders for slow connections (per edge case)

**Components needing skeletons**:
- Product cards: Gray placeholder rectangles with shimmer animation
- Hero carousel: Solid gray rectangle with centered "로딩 중..." text
- Dropdowns: Show default "지역 선택" / "상품 카테고리" text

**Implementation**: DaisyUI's `skeleton` utility classes or custom shimmer CSS

**Rationale**: Constitution requires loading states for >300ms operations. Improves perceived performance on slow connections.

**Alternatives considered**:
- Spinner icons only → Rejected: Less visually informative, doesn't maintain layout
- No loading states → Rejected: Violates constitution Principle III

## Summary of Decisions

| Area | Decision | Rationale |
|------|----------|-----------|
| UI Components | DaisyUI (navbar, dropdown, carousel, tabs, cards, footer) | Pre-built, accessible, documented |
| Carousel Auto-Play | `useEffect` + `setInterval` (5s) | Simple, performant, no extra dependencies |
| Responsive Nav | CSS breakpoint at 1024px with DaisyUI dropdown | Follows spec, accessible by default |
| Mock Data | TypeScript interfaces + `mockData.ts` file | Type-safe, ready for API migration |
| Images | Placeholder images from CDN | Unblocks development, optimized |
| Search Behavior | Client-side filtering, in-place results | Matches spec assumption, fast |
| Loading States | Skeleton loaders with shimmer | Meets constitution, good UX |

## Next Steps (Phase 1)

1. Create `data-model.md` with all TypeScript interfaces
2. Create `contracts/mock-data.json` with sample data structure
3. Create `quickstart.md` with development setup instructions
4. Update agent context with this research
