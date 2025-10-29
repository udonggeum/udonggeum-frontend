# Implementation Plan: Main Page (홈 화면)

**Branch**: `001-main-page` | **Date**: 2025-10-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-main-page/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build the main page (홈 화면) for 우동금 (Udonggeum), a local jewelry platform. The page enables users to browse jewelry products by region and category, view featured products in a hero carousel, and navigate to other site sections. Core features include: region/category filter dropdowns, auto-playing hero carousel with manual controls, popular products organized by category tabs, and responsive navigation (horizontal desktop, hamburger mobile).

Technical approach: React 19 with TypeScript, TailwindCSS + DaisyUI for UI components, React Router for navigation, local state management for UI interactions (carousel, dropdowns, tabs). Mock data for MVP with structure ready for API integration.

## Technical Context

**Language/Version**: TypeScript 5.9.3 with React 19.1.1
**Primary Dependencies**:
- React 19.1.1 (UI framework)
- React Router DOM 7.9.4 (routing/navigation)
- TailwindCSS 4.1.14 (utility-first styling)
- DaisyUI 5.3.10 (pre-built UI components)
- Vite 7.1.7 (build tool and dev server)

**Storage**: N/A for this feature (client-side only, no persistence needed for MVP)
**Testing**: Not required for MVP (constitution exempts simple presentational components)
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge last 2 versions), responsive design 320px-1920px+
**Project Type**: Web application (single-page frontend)
**Performance Goals**:
- <3s initial page load on 3G
- <1.5s above-the-fold content visible
- <300ms UI interaction response time
- <2MB total page weight

**Constraints**:
- No backend API integration in MVP (mock data acceptable)
- Responsive breakpoint at 1024px (mobile vs desktop)
- Korean language only (no i18n)
- Accessibility: keyboard navigation, ARIA labels, alt text required

**Scale/Scope**: Single page feature with 5 main sections (Navbar, SearchSection, HeroSection, PopularProductsSection, Footer), approximately 8-12 components total

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Type Safety & Schema Validation

✅ **PASS** - Mock data will use TypeScript interfaces. When API integration occurs, Zod schemas will be created for validation.

**Action**: Define TypeScript interfaces for Region, ProductCategory, Product, CarouselSlide, NavigationItem during Phase 1 (data-model.md).

### II. Component Testing Standards

✅ **PASS** - Constitution exempts "simple presentational components" from testing requirements. Main page components are primarily presentational with minimal business logic.

**Action**: Testing not required for MVP. If complex logic emerges (e.g., advanced filtering, carousel state management), unit tests will be added per constitution.

### III. User Experience Consistency

✅ **PASS** - Feature explicitly requires TailwindCSS and DaisyUI per documentation (@docs/main-page-components.md).

**Action**:
- Use DaisyUI components: navbar, dropdown, carousel, tabs, cards, footer
- Follow @docs/STYLE_GUIDE.md for accessibility (keyboard nav, alt text, labels)
- Ensure responsive grid: 1 col mobile → 2-4 cols desktop

### IV. Performance Requirements

✅ **PASS** - Spec aligns with constitution (<3s load time, responsive interactions).

**Action**:
- Optimize images (use modern formats, lazy-load below-the-fold)
- Monitor bundle size during build (target <500KB gzipped)
- Use CSS transitions for smooth carousel/menu animations
- Implement loading skeletons for slow connections (per edge case FR-020)

### V. State Management Separation

✅ **PASS** - Feature uses only local component state (carousel index, dropdown selections, active tab). No global state or server state needed for MVP.

**Action**: Use `useState` for carousel index, selected region/category, active product tab. When API integration occurs, migrate to TanStack Query per @docs/ARCHITECTURE.md.

### Architecture Standards

✅ **Service Layer Pattern** - N/A for MVP (no API calls). Structure ready for future migration: create `src/services/products.ts` when backend available.

✅ **Query Keys Factory Pattern** - N/A for MVP. When API integration occurs, create query keys factory in `src/hooks/queries/useProductsQueries.ts`.

✅ **Code Organization** - Follows constitution's structure: `src/components/`, `src/pages/`, `src/constants/`.

### Code Style

✅ **PASS** - Will follow @docs/STYLE_GUIDE.md (file naming, component structure, TypeScript rules, accessibility).

**Action**:
- Component files: PascalCase (e.g., `Navbar.tsx`, `HeroCarousel.tsx`)
- Max 100 lines per function/component
- Boolean names: `isMenuOpen`, `hasProducts`, `shouldAutoPlay`
- Function names: `handleSearch`, `fetchProducts`, `validateFilters`

### Quality Gates

✅ **Pre-merge requirements**:
1. TypeScript compilation: `tsc -b` (no errors)
2. Linting: `npm run lint` (no errors)
3. Build: `npm run build` (successful)
4. Tests: N/A for MVP
5. Manual testing: All 3 user stories acceptance scenarios verified

## Project Structure

### Documentation (this feature)

```text
specs/001-main-page/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (component patterns, mock data structure)
├── data-model.md        # Phase 1 output (TypeScript interfaces)
├── quickstart.md        # Phase 1 output (development setup, running locally)
├── contracts/           # Phase 1 output (mock data contracts, future API schemas)
└── checklists/
    └── requirements.md  # Spec quality validation (already complete)
```

### Source Code (repository root)

```text
src/
├── components/          # Reusable UI components
│   ├── Navbar.tsx      # Top navigation bar (responsive)
│   ├── SearchSection.tsx  # Region/category filters
│   ├── HeroCarousel.tsx   # Auto-playing image carousel
│   ├── PopularProducts.tsx # Category tabs + product grid
│   ├── ProductCard.tsx    # Individual product display
│   └── Footer.tsx         # Site footer with links
│
├── pages/
│   └── MainPage.tsx    # Main page composition (home route "/")
│
├── constants/
│   └── mockData.ts     # Mock data (regions, categories, products, slides)
│
├── types/
│   └── index.ts        # TypeScript interfaces (Region, Product, etc.)
│
└── assets/             # Images (hero carousel, product photos)
    └── images/
```

**Structure Decision**: Single-project web application structure (frontend only). Uses constitution's recommended organization: `src/components/`, `src/pages/`, `src/constants/`, `src/types/`. No `src/services/` or `src/hooks/queries/` yet (added when API integration occurs).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

*No violations - all constitution principles satisfied.*
