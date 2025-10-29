# Tasks: Main Page (홈 화면)

**Input**: Design documents from `/specs/001-main-page/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not required for MVP per constitution (presentational components exempted). This task list focuses on implementation only.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web application**: `src/` at repository root
- Paths shown below use absolute paths from project root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Verify all project dependencies are installed by running `npm install`
- [X] T002 Verify TailwindCSS configuration includes DaisyUI plugin in tailwind.config.js
- [X] T003 [P] Create `src/types/` directory for TypeScript interfaces
- [X] T004 [P] Create `src/constants/` directory for mock data
- [X] T005 [P] Create `src/components/` directory for reusable UI components
- [X] T006 [P] Create `src/pages/` directory for route-level pages

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T007 Create TypeScript interfaces in src/types/index.ts for: Region, ProductCategory, Product, CarouselSlide, NavigationItem, SearchFilters (copy from data-model.md)
- [X] T008 Create mock data in src/constants/mockData.ts with exports: MOCK_REGIONS (6 items), MOCK_CATEGORIES (5 items), MOCK_PRODUCTS (12-16 items), MOCK_CAROUSEL_SLIDES (3 items), MOCK_NAV_ITEMS (4 items) (reference contracts/mock-data-example.json)
- [X] T009 Verify TypeScript compilation with `tsc -b` (should pass with no errors)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Browse Products by Location and Category (Priority: P1) 🎯 MVP

**Goal**: Enable users to filter products by region and category, see filtered results

**Independent Test**: Load main page, select region dropdown (see 6 regions), select category dropdown (see 5 categories), click search, verify products filter correctly. No region/category selected = show all products. Mobile: search section stacks vertically.

### Implementation for User Story 1

- [X] T010 [P] [US1] Create SearchSection component in src/components/SearchSection.tsx with two DaisyUI dropdowns (region, category) and search button, using MOCK_REGIONS and MOCK_CATEGORIES
- [X] T011 [P] [US1] Create ProductCard component in src/components/ProductCard.tsx using DaisyUI card with product image, name, price, and action buttons (찜하기, 장바구니)
- [X] T012 [US1] Create MainPage component in src/pages/MainPage.tsx that imports SearchSection, manages search state (selectedRegion, selectedCategory), filters MOCK_PRODUCTS based on selections, and displays filtered products in responsive grid (1 col mobile → 2-4 cols desktop)
- [X] T013 [US1] Add client-side filtering logic in MainPage: filter MOCK_PRODUCTS by regionId and categoryId, show all if no filters selected
- [X] T014 [US1] Implement empty state in MainPage: when filtered products array is empty, display Korean message "해당 지역에 상품이 없습니다. 다른 지역을 선택해주세요."
- [X] T015 [US1] Add responsive grid styling to product display using Tailwind classes: grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4
- [X] T016 [US1] Update src/main.tsx or App.tsx to add React Router route "/" pointing to MainPage component
- [ ] T017 [US1] Test acceptance scenario: Verify region dropdown shows all 6 regions from MOCK_REGIONS
- [ ] T018 [US1] Test acceptance scenario: Verify category dropdown shows all 5 categories from MOCK_CATEGORIES
- [ ] T019 [US1] Test acceptance scenario: Verify search filters products correctly (both region and category)
- [ ] T020 [US1] Test acceptance scenario: Verify search with no filters shows all products
- [ ] T021 [US1] Test responsive behavior: Verify search section and product grid adapt to mobile (<1024px) layout

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Users can browse and filter products.

---

## Phase 4: User Story 2 - View Featured Products and Navigate (Priority: P2)

**Goal**: Display hero carousel with auto-play and popular products organized by category tabs

**Independent Test**: Load main page, verify hero carousel shows 3 slides and auto-advances every 5 seconds, verify manual prev/next buttons work, verify category tabs show 반지/목걸이/팔찌, verify clicking tab displays 3-4 products for that category. Mobile: product grid shows 1 column.

### Implementation for User Story 2

- [X] T022 [P] [US2] Create HeroCarousel component in src/components/HeroCarousel.tsx using DaisyUI carousel with 3 slides from MOCK_CAROUSEL_SLIDES
- [X] T023 [US2] Add auto-play logic to HeroCarousel using useEffect with setInterval (5000ms), clearing interval on unmount
- [X] T024 [US2] Add manual navigation controls to HeroCarousel: previous button, next button, and slide indicator buttons (using slide IDs)
- [X] T025 [US2] Add image error handling to HeroCarousel: if imageUrl fails to load, display fallback solid background with overlayText
- [X] T026 [P] [US2] Create PopularProducts component in src/components/PopularProducts.tsx using DaisyUI tabs (radio-based) with 3 category tabs: 반지, 목걸이, 팔찌
- [X] T027 [US2] Add tab switching logic to PopularProducts: filter MOCK_PRODUCTS by selected category, display 3-4 products per category using ProductCard component in responsive grid
- [X] T028 [US2] Update MainPage to include HeroCarousel component between SearchSection and PopularProducts sections
- [X] T029 [US2] Update MainPage to include PopularProducts component after HeroCarousel
- [ ] T030 [US2] Test acceptance scenario: Verify hero carousel displays 3 promotional images on page load
- [ ] T031 [US2] Test acceptance scenario: Verify hero carousel auto-advances to next slide after 5 seconds
- [ ] T032 [US2] Test acceptance scenario: Verify clicking carousel previous/next buttons changes slide
- [ ] T033 [US2] Test acceptance scenario: Verify category tabs display (반지, 목걸이, 팔찌)
- [ ] T034 [US2] Test acceptance scenario: Verify clicking a tab shows 3-4 products from that category
- [ ] T035 [US2] Test acceptance scenario: Verify product cards display image, name, and price
- [ ] T036 [US2] Test responsive behavior: Verify popular products grid shows 1 column on mobile, 2-4 columns on larger screens

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Users can browse filtered products AND explore featured content.

---

## Phase 5: User Story 3 - Navigate Site and Access Key Features (Priority: P3)

**Goal**: Provide responsive navigation bar and informational footer for site-wide access

**Independent Test**: Desktop (≥1024px): verify horizontal menu shows 상품/매장/장바구니/로그인/마이페이지. Mobile (<1024px): verify hamburger menu opens dropdown with same items. Click logo to return home. Verify footer shows 3 columns (회사정보, 고객지원, 법적고지) and copyright text.

### Implementation for User Story 3

- [X] T037 [P] [US3] Create Navbar component in src/components/Navbar.tsx using DaisyUI navbar with responsive behavior: horizontal menu on desktop (lg:flex), hamburger dropdown on mobile (lg:hidden)
- [X] T038 [US3] Add logo to Navbar that links to "/" route (home page) using React Router Link component
- [X] T039 [US3] Add navigation menu items to Navbar from MOCK_NAV_ITEMS: 상품, 매장, 장바구니, 로그인/마이페이지, using React Router Link components
- [X] T040 [US3] Add mobile dropdown menu to Navbar using DaisyUI dropdown component, visible only on screens <1024px
- [X] T041 [P] [US3] Create Footer component in src/components/Footer.tsx using DaisyUI footer with three columns: 회사정보 (회사소개, 매장안내, 채용정보), 고객지원 (FAQ, 배송 안내, 반품/교환, 주문 조회), 법적고지 (이용약관, 개인정보처리방침, 쿠키 정책)
- [X] T042 [US3] Add copyright section to Footer component: "Copyright © 2024 우리동네금은방. All rights reserved." centered in footer-center div
- [X] T043 [US3] Update MainPage to wrap all content with Navbar at top and Footer at bottom
- [ ] T044 [US3] Test acceptance scenario: Verify desktop view (≥1024px) shows horizontal menu items in navbar
- [ ] T045 [US3] Test acceptance scenario: Verify mobile view (<1024px) shows hamburger menu icon
- [ ] T046 [US3] Test acceptance scenario: Verify clicking hamburger icon opens dropdown with all 4 menu items
- [ ] T047 [US3] Test acceptance scenario: Verify clicking logo navigates to homepage (reloads MainPage)
- [ ] T048 [US3] Test acceptance scenario: Verify clicking navigation menu items navigates to correct paths (note: other pages don't exist yet, links can be placeholders)
- [ ] T049 [US3] Test acceptance scenario: Verify footer displays 3 columns with correct content
- [ ] T050 [US3] Test acceptance scenario: Verify footer displays copyright text "Copyright © 2024 우리동네금은방. All rights reserved."
- [ ] T051 [US3] Test acceptance scenario: Verify clicking footer links (note: destination pages don't exist yet, verify links are present)

**Checkpoint**: All user stories should now be independently functional. Complete main page with navigation, search/filter, carousel, products, and footer.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T052 [P] Add keyboard accessibility: Ensure all interactive elements (dropdowns, buttons, carousel controls, tabs, nav links) are keyboard accessible (verify Tab navigation works, Enter/Space activate controls)
- [ ] T053 [P] Add ARIA labels to all images: Verify all img elements have meaningful Korean alt text (product images, carousel slides, logo if image-based)
- [ ] T054 [P] Verify form labels: Ensure dropdown labels are explicitly associated using <label> elements or aria-label attributes
- [ ] T055 [P] Add loading skeletons: Implement skeleton loaders for product cards and carousel (use DaisyUI skeleton class or custom shimmer CSS) for slow connections
- [ ] T056 Test edge case: Verify "no products" message appears when search returns empty results
- [ ] T057 Test edge case: Verify carousel handles image load failures with fallback background
- [ ] T058 Test responsive breakpoint: Verify layout transitions smoothly at 1024px (desktop/mobile toggle)
- [ ] T059 Run TypeScript compilation: `tsc -b` (must pass with no errors)
- [ ] T060 Run ESLint: `npm run lint` (must pass with no errors)
- [ ] T061 Run production build: `npm run build` (must complete successfully, verify bundle size <500KB gzipped)
- [ ] T062 Manual performance test: Verify page load time <3s on 3G throttling (use Chrome DevTools Network tab)
- [ ] T063 Manual accessibility test: Run Lighthouse accessibility audit (target 90%+ score)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (US1 → US2 → US3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Reuses ProductCard from US1 but is independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - No dependencies on other stories (wraps existing content)

### Within Each User Story

- Components marked [P] within same story can be built in parallel (different files)
- MainPage integration tasks must wait for child components to exist
- Test tasks must wait for implementation tasks in that story
- All story tasks must complete before moving to next priority story

### Parallel Opportunities

- All Setup tasks (T001-T006) can run in parallel
- All Foundational tasks marked [P] can run in parallel within Phase 2
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Within each story: Components marked [P] can be built in parallel
- Different user stories can be worked on in parallel by different team members
- All Polish tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# After Foundational phase complete, launch US1 components in parallel:
Task: "T010 [P] [US1] Create SearchSection component..."
Task: "T011 [P] [US1] Create ProductCard component..."

# Then sequentially:
Task: "T012 [US1] Create MainPage component..." (depends on SearchSection, ProductCard)
Task: "T013 [US1] Add client-side filtering logic..." (depends on MainPage)
# ... continue with US1 tasks
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T006)
2. Complete Phase 2: Foundational (T007-T009) - CRITICAL blocking phase
3. Complete Phase 3: User Story 1 (T010-T021)
4. **STOP and VALIDATE**: Test all US1 acceptance scenarios independently
5. Deploy/demo if ready - Users can now browse and filter products!

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (T010-T021) → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 (T022-T036) → Test independently → Deploy/Demo (Carousel + Featured products added)
4. Add User Story 3 (T037-T051) → Test independently → Deploy/Demo (Navigation + Footer added)
5. Add Polish (T052-T063) → Final quality pass → Deploy/Demo (Production-ready)
6. Each increment adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T009)
2. Once Foundational is done:
   - Developer A: User Story 1 (T010-T021)
   - Developer B: User Story 2 (T022-T036)
   - Developer C: User Story 3 (T037-T051)
3. Stories complete and integrate independently (Navbar/Footer wrap existing content, Carousel/PopularProducts slot into MainPage)
4. Team collaborates on Polish phase (T052-T063)

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group (per constitution git workflow)
- Stop at any checkpoint to validate story independently
- No tests required for MVP (presentational components exempted by constitution)
- Focus on constitution compliance: TypeScript strict, TailwindCSS + DaisyUI, accessibility, performance targets
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

---

## Task Summary

**Total Tasks**: 63 tasks
- **Setup (Phase 1)**: 6 tasks
- **Foundational (Phase 2)**: 3 tasks (BLOCKING - must complete before user stories)
- **User Story 1 (Phase 3)**: 12 tasks (MVP - browse/filter products)
- **User Story 2 (Phase 4)**: 15 tasks (carousel + featured products)
- **User Story 3 (Phase 5)**: 15 tasks (navigation + footer)
- **Polish (Phase 6)**: 12 tasks (accessibility, performance, quality gates)

**Parallel Opportunities**: 16 tasks marked [P] can run in parallel within their phase

**Independent Test Criteria**:
- **US1**: Load page, filter by region/category, see filtered products
- **US2**: See auto-playing carousel (5s), browse products by category tabs
- **US3**: Use responsive navigation (desktop/mobile), see footer with links

**Suggested MVP Scope**: Phases 1-3 (Setup + Foundational + US1) = 21 tasks
