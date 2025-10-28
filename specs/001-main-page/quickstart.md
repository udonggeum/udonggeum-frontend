# Quickstart: Main Page Development

**Feature**: Main Page (홈 화면)
**Branch**: `001-main-page`
**Date**: 2025-10-28

## Prerequisites

- **Node.js**: v20+ (check with `node --version`)
- **npm**: v10+ (check with `npm --version`)
- **Git**: Latest version
- **Editor**: VS Code recommended (with ESLint and Prettier extensions)

## Initial Setup

### 1. Clone and Switch to Feature Branch

```bash
# If not already on the branch
git checkout 001-main-page

# Ensure you're up to date
git pull origin 001-main-page
```

### 2. Install Dependencies

```bash
# Install all project dependencies
npm install

# Verify installation
npm list --depth=0
```

Expected key dependencies:
- `react@19.1.1`
- `react-router-dom@7.9.4`
- `tailwindcss@4.1.14`
- `daisyui@5.3.10`
- `typescript@5.9.3`
- `vite@7.1.7`

### 3. Verify Configuration

Check that TailwindCSS and DaisyUI are properly configured:

```bash
# Verify tailwind.config.js exists and includes DaisyUI
cat tailwind.config.js | grep daisyui

# Expected output: plugins: [require('daisyui')]
```

If DaisyUI is not configured, add to `tailwind.config.js`:

```javascript
module.exports = {
  // ... existing config
  plugins: [require('daisyui')],
  daisyui: {
    themes: false, // Use default theme for MVP
    logs: false,
  },
};
```

## Development Workflow

### 1. Start Development Server

```bash
# Start Vite dev server (default port: 5173)
npm run dev

# Server should start at http://localhost:5173
```

Open browser to `http://localhost:5173` to see live updates.

### 2. Project Structure for This Feature

```
src/
├── components/
│   ├── Navbar.tsx              # Create this
│   ├── SearchSection.tsx       # Create this
│   ├── HeroCarousel.tsx        # Create this
│   ├── PopularProducts.tsx     # Create this
│   ├── ProductCard.tsx         # Create this
│   └── Footer.tsx              # Create this
│
├── pages/
│   └── MainPage.tsx            # Create this
│
├── types/
│   └── index.ts                # Create this (interfaces from data-model.md)
│
├── constants/
│   └── mockData.ts             # Create this (sample data)
│
└── assets/
    └── images/                 # Placeholder images (optional)
```

### 3. Create Type Definitions First

Create `src/types/index.ts` with all interfaces from [data-model.md](./data-model.md):

```typescript
// src/types/index.ts
export interface Region {
  id: string;
  name: string;
  city: string;
  displayOrder: number;
}

export interface ProductCategory {
  id: string;
  name: string;
  displayOrder: number;
  icon?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  imageAlt: string;
  categoryId: string;
  regionId: string;
  isWishlisted: boolean;
  isInCart: boolean;
  storeName?: string;
}

export interface CarouselSlide {
  id: string;
  imageUrl: string;
  altText: string;
  overlayText?: string;
  linkUrl?: string;
  displayOrder: number;
}

export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  displayOrder: number;
  icon?: string;
}

export interface SearchFilters {
  regionId: string | null;
  categoryId: string | null;
}
```

### 4. Create Mock Data

Create `src/constants/mockData.ts` using data from [contracts/mock-data-example.json](./contracts/mock-data-example.json):

```typescript
// src/constants/mockData.ts
import type { Region, ProductCategory, Product, CarouselSlide, NavigationItem } from '../types';

export const MOCK_REGIONS: Region[] = [
  { id: 'seoul-gangdong', name: '서울 강동구', city: '서울', displayOrder: 1 },
  { id: 'seoul-gangnam', name: '서울 강남구', city: '서울', displayOrder: 2 },
  // ... add all 6 regions from contracts/mock-data-example.json
];

export const MOCK_CATEGORIES: ProductCategory[] = [
  { id: 'rings', name: '반지', displayOrder: 1 },
  { id: 'necklaces', name: '목걸이', displayOrder: 2 },
  // ... add all 5 categories
];

export const MOCK_PRODUCTS: Product[] = [
  // ... add 12-16 products from contracts/mock-data-example.json
];

export const MOCK_CAROUSEL_SLIDES: CarouselSlide[] = [
  // ... add 3 slides from contracts/mock-data-example.json
];

export const MOCK_NAV_ITEMS: NavigationItem[] = [
  // ... add 4 navigation items from contracts/mock-data-example.json
];
```

### 5. Build Components (Recommended Order)

**Phase 1: Layout Components** (no state, pure presentational)

1. **Navbar** (`src/components/Navbar.tsx`)
   - Use DaisyUI navbar component
   - Reference: @docs/main-page-components.md lines 77-130
   - Props: `navigationItems: NavigationItem[]`

2. **Footer** (`src/components/Footer.tsx`)
   - Use DaisyUI footer component
   - Reference: @docs/main-page-components.md lines 337-375
   - No props (static content)

**Phase 2: Interactive Components** (with local state)

3. **SearchSection** (`src/components/SearchSection.tsx`)
   - Use DaisyUI dropdown component
   - Reference: @docs/main-page-components.md lines 132-174
   - Props: `regions`, `categories`, `onSearch`
   - State: `selectedRegion`, `selectedCategory`

4. **HeroCarousel** (`src/components/HeroCarousel.tsx`)
   - Use DaisyUI carousel component
   - Reference: @docs/main-page-components.md lines 176-260
   - Props: `slides: CarouselSlide[]`
   - State: `currentSlide`, auto-play logic with `useEffect`

5. **ProductCard** (`src/components/ProductCard.tsx`)
   - Use DaisyUI card component
   - Reference: @docs/main-page-components.md lines 289-328
   - Props: `product: Product`, `onWishlist`, `onAddToCart`

6. **PopularProducts** (`src/components/PopularProducts.tsx`)
   - Use DaisyUI tabs component
   - Reference: @docs/main-page-components.md lines 262-287
   - Props: `products: Product[]`, `categories: ProductCategory[]`
   - State: `activeCategory`

**Phase 3: Page Composition**

7. **MainPage** (`src/pages/MainPage.tsx`)
   - Compose all components together
   - Manage search filtering logic
   - Pass mock data to child components

### 6. Setup Routing

Update `src/main.tsx` or routing config to include MainPage:

```typescript
// src/main.tsx or App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        {/* Other routes will be added later */}
      </Routes>
    </BrowserRouter>
  );
}
```

## Testing During Development

### Manual Testing Checklist

Use acceptance scenarios from [spec.md](./spec.md) to verify functionality:

**User Story 1 - Browse Products (P1)**:
- [ ] Region dropdown shows all 6 regions
- [ ] Category dropdown shows all 5 categories
- [ ] Search button filters products correctly
- [ ] "No products" message appears for empty results
- [ ] Mobile: search section stacks vertically

**User Story 2 - Featured Products (P2)**:
- [ ] Hero carousel displays 3 slides
- [ ] Carousel auto-advances every 5 seconds
- [ ] Previous/next buttons work
- [ ] Category tabs display (반지, 목걸이, 팔찌)
- [ ] Clicking tab shows 3-4 products
- [ ] Product cards show image, name, price
- [ ] Mobile: grid adapts to 1 column

**User Story 3 - Navigation (P3)**:
- [ ] Desktop: horizontal menu visible (≥1024px)
- [ ] Mobile: hamburger menu visible (<1024px)
- [ ] Logo click returns to home
- [ ] Menu items navigate correctly
- [ ] Footer displays 3 columns
- [ ] Copyright text appears

### Browser Testing

Test in multiple browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest, if on macOS)
- Edge (latest)

### Responsive Testing

Test at these viewport widths:
- 320px (mobile)
- 768px (tablet)
- 1024px (desktop breakpoint)
- 1920px (large desktop)

Use browser DevTools responsive mode: `Ctrl+Shift+M` (Chrome/Edge) or `Cmd+Opt+M` (Safari).

## Build and Quality Checks

### Type Check

```bash
# Run TypeScript compiler
npm run build:types
# or
tsc -b

# Expected: No errors
```

### Linting

```bash
# Run ESLint
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix
```

### Build Production Bundle

```bash
# Create optimized production build
npm run build

# Expected output in dist/
# Verify bundle size (should be <500KB gzipped)
```

### Preview Production Build

```bash
# Serve production build locally
npm run preview

# Open http://localhost:4173
```

## Troubleshooting

### DaisyUI Components Not Styling

**Issue**: Components look unstyled
**Solution**: Ensure `daisyui` plugin is in `tailwind.config.js` and you've imported Tailwind in `src/index.css`:

```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### TypeScript Errors

**Issue**: Type errors for DaisyUI components
**Solution**: DaisyUI uses standard HTML elements, no type definitions needed. Use standard React types:

```typescript
<button className="btn btn-primary">Click</button>
// No special types needed ✅
```

### Images Not Loading

**Issue**: Product/carousel images return 404
**Solution**: Use CDN URLs (Unsplash) or add local images to `src/assets/images/` and import:

```typescript
import productImage from '../assets/images/product-001.jpg';
```

### Slow Development Server

**Issue**: Vite dev server slow on Windows
**Solution**: Exclude `node_modules` from Windows Defender or use WSL2 for development.

## Next Steps

Once all components are built and tested:

1. Commit your changes following @docs/COMMIT_CONVENTION.md
2. Run quality gates: `tsc -b && npm run lint && npm run build`
3. Push to branch: `git push origin 001-main-page`
4. Proceed to `/speckit.tasks` to generate implementation task list

## Reference Documentation

- [Feature Specification](./spec.md) - Requirements and acceptance criteria
- [Data Model](./data-model.md) - TypeScript interfaces
- [Research](./research.md) - Component patterns and decisions
- [Mock Data Contract](./contracts/mock-data-example.json) - Sample data structure
- [Main Page Components](../../docs/main-page-components.md) - DaisyUI implementation examples
- [Architecture Guide](../../docs/ARCHITECTURE.md) - Project architecture
- [Style Guide](../../docs/STYLE_GUIDE.md) - Code style rules

## Support

- Issues: Check existing project issues or create new one
- Architecture questions: Review @docs/ARCHITECTURE.md
- Style questions: Review @docs/STYLE_GUIDE.md
