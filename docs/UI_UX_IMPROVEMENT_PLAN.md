# UI/UX 개선 계획서

> **작성일**: 2025-01-28
> **목적**: 피드백 기반 UI/UX 문제점 분석 및 개선 방향 제시
> **참조**: CLAUDE.md, ARCHITECTURE.md, STYLE_GUIDE.md

---

## 📋 목차

1. [Design System 개선](#1-design-system-개선)
2. [메인페이지 개선](#2-메인페이지-개선)
3. [상품페이지 개선](#3-상품페이지-개선)
4. [상품 상세 페이지 개선](#4-상품-상세-페이지-개선)
5. [매장 상세 페이지 개선](#5-매장-상세-페이지-개선)
6. [구현 우선순위](#6-구현-우선순위)

---

## 1. Design System 개선

### 1.1 현재 문제점

**컬러 시스템**
- ❌ 황토색 + 그레이 조합 → 채도 낮음 → 가독성 저하
- ❌ 명도 대비 부족으로 시인성 떨어짐
- ❌ 브랜드 정체성(금/은)이 명확하지 않음

**타이포그래피**
- ❌ 폰트 weight 과다 사용 (일관성 부족 가능성)
- ❌ 시각적 계층 구조 불명확

### 1.2 개선 방향

#### 컬러 시스템 재설계

**Primary Colors (브랜드 컬러)**
```css
/* 현재 (추정) */
--color-primary: #??? (황토색 계열)
--color-secondary: #??? (그레이 계열)
--color-gold: #??? (골드)

/* 개선안 */
--color-background: #FFFFFF          /* 순백 - 명도 대비 극대화 */
--color-surface: #F9FAFB             /* 매우 연한 회색 - 카드/섹션 배경 */
--color-surface-hover: #F3F4F6       /* 호버 상태 */

--color-primary-gold: #D4AF37        /* 골드 (메인 CTA, 강조) */
--color-primary-gold-light: #F5E6C8  /* 골드 10% - 배지, 하이라이트 */
--color-primary-gold-dark: #B8941F   /* 골드 다크 - 호버 */

--color-text-primary: #111827        /* 제목, 중요 텍스트 */
--color-text-secondary: #6B7280      /* 본문, 설명 */
--color-text-tertiary: #9CA3AF       /* 보조 정보 */

--color-border-subtle: #E5E7EB       /* 구분선 */
--color-border-strong: #D1D5DB       /* 강조 구분선 */
```

**Semantic Colors**
```css
--color-success: #10B981   /* 성공, 재고 있음 */
--color-warning: #F59E0B   /* 경고, 재고 부족 */
--color-error: #EF4444     /* 에러, 품절 */
--color-info: #3B82F6      /* 정보 */
```

**장점**:
- ✅ 흰색 배경 + 골드 강조 = 명도 대비 극대화
- ✅ 금/은 브랜드 정체성 명확
- ✅ 프리미엄하고 클린한 느낌
- ✅ WCAG AAA 접근성 기준 충족 가능

#### 타이포그래피 단순화

**Pretendard만 사용 (4개 weight)**
```css
/* Font Family */
font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;

/* Font Weights */
--font-regular: 400      /* Regular - 본문, 설명 */
--font-medium: 500       /* Medium - 라벨, 버튼 */
--font-semibold: 600     /* SemiBold - 소제목, 카드 제목 */
--font-bold: 700         /* Bold - 페이지 제목, 가격 */

/* Font Sizes (Tailwind 기본 활용) */
text-xs: 0.75rem (12px)    /* 캡션, 메타 정보 */
text-sm: 0.875rem (14px)   /* 보조 텍스트 */
text-base: 1rem (16px)     /* 본문 (기본) */
text-lg: 1.125rem (18px)   /* 강조 본문 */
text-xl: 1.25rem (20px)    /* 소제목 */
text-2xl: 1.5rem (24px)    /* 카드 제목 */
text-3xl: 1.875rem (30px)  /* 섹션 제목 */
text-4xl: 2.25rem (36px)   /* 페이지 제목 */
```

**위계 구조 예시**
```tsx
{/* Level 1 - 페이지 제목 */}
<h1 className="text-4xl font-bold text-text-primary">상품명</h1>

{/* Level 2 - 섹션 제목 */}
<h2 className="text-2xl font-semibold text-text-primary">상품 설명</h2>

{/* Level 3 - 카드 제목 */}
<h3 className="text-xl font-semibold text-text-primary">매장명</h3>

{/* Level 4 - 본문 */}
<p className="text-base font-regular text-text-secondary">설명...</p>

{/* Level 5 - 보조 정보 */}
<span className="text-sm font-regular text-text-tertiary">메타 정보</span>
```

---

## 2. 메인페이지 개선

### 2.1 현재 문제점 분석

**Information Architecture 문제**
1. ❌ **위계 불명확**: 상단 검색 vs 하단 카테고리 버튼 - 무엇이 Primary Action인지 불명확
2. ❌ **이중 네비게이션**: 검색(지역+카테고리) ≠ 버튼(상품/매장/금/구매·예약)
3. ❌ **사용자 혼란**: "검색을 먼저 해야 하나? 버튼을 눌러야 하나?"
4. ❌ **시각적 무게 동일**: 검색창과 버튼이 동일한 시각적 무게 → 집중 분산
5. ❌ **버튼 레이블 불명확**: "금", "구매/예약" 등이 무엇을 의미하는지 즉각적으로 이해하기 어려움

### 2.2 개선 방향

#### Option A: 검색 중심 (추천 ⭐)

**컨셉**: "사용자의 대부분은 특정 상품/지역을 찾으러 온다"

```
┌─────────────────────────────────────────┐
│  [Logo]                          [Login] │
├─────────────────────────────────────────┤
│                                          │
│         우리 동네 금은방                  │
│   가까운 금은방의 상품/시세를 한 번에     │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ [지역 선택 ▼] [카테고리 선택 ▼] [🔍] │ │  ← Primary (강조)
│  └────────────────────────────────────┘ │
│                                          │
│          빠른 탐색 (Quick Links)         │  ← Secondary (축소)
│  [상품 전체] [매장 찾기] [금시세] [주문내역] │
│                                          │
│         인기 상품 / 신상품               │
│  [캐러셀 or 그리드]                      │
│                                          │
└─────────────────────────────────────────┘
```

**변경 사항**:
1. ✅ **검색창을 Primary Action으로** - 크기 증가, 골드 강조
2. ✅ **카테고리 버튼 → "빠른 탐색" 섹션으로 축소**
   - 레이블 명확화: "상품 전체", "매장 찾기", "금시세 확인", "주문 내역"
   - 아이콘 + 텍스트 크기 축소 (현재 w-24 h-24 → w-16 h-16)
   - "빠른 탐색" 제목 추가로 역할 명확화
3. ✅ **인기/신상품 섹션 추가** - 콘텐츠 즉시 노출로 이탈 방지
4. ✅ **시각적 계층 명확화**
   - Primary (검색): 큰 폰트 + 골드 강조 + 충분한 여백
   - Secondary (빠른 탐색): 작은 아이콘 + 그레이 톤
   - Tertiary (인기 상품): 콘텐츠 프리뷰

#### Option B: 카테고리 중심

**컨셉**: "사용자는 둘러보다가 구매한다 (커머스 탐색형)"

```
┌─────────────────────────────────────────┐
│         우리 동네 금은방                  │
│   가까운 금은방의 상품/시세를 한 번에     │
│                                          │
│  무엇을 찾고 계신가요?                    │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐          │  ← Primary (강조)
│  │상품│ │매장│ │금시│ │주문│          │
│  │전체│ │찾기│ │세  │ │내역│          │
│  └────┘ └────┘ └────┘ └────┘          │
│                                          │
│  🔍 상세 검색 (펼치기)                    │  ← Secondary (축소)
│                                          │
│         인기 상품                        │
│  [캐러셀]                                │
│                                          │
└─────────────────────────────────────────┘
```

**판단**: Option A 추천
- 이유: 로컬 서비스 특성상 "내 지역 + 특정 상품" 검색이 Primary Use Case

### 2.3 구현 상세

#### MainHeroSection.tsx 개선안

```tsx
// Before (현재 - 156~308줄)
<div className="flex justify-center gap-6 md:gap-12">
  <button className="flex flex-col items-center gap-3">
    <div className="w-20 h-20 md:w-24 md:h-24 ...">
      {/* 아이콘 */}
    </div>
    <span>상품</span>  {/* 불명확 */}
  </button>
  {/* ... */}
</div>

// After (개선안)
{/* Primary: Search Section */}
<form onSubmit={handleSearch} className="max-w-4xl mx-auto mb-16">
  <h2 className="text-center text-xl md:text-2xl font-medium text-text-secondary mb-6">
    어떤 상품을 찾고 계신가요?
  </h2>
  <div className="flex gap-3 p-2 bg-white rounded-2xl shadow-2xl border-2 border-primary-gold">
    <select className="flex-1 h-16 text-lg px-4 rounded-xl border-none bg-surface">
      {/* 지역 */}
    </select>
    <select className="flex-1 h-16 text-lg px-4 rounded-xl border-none bg-surface">
      {/* 카테고리 */}
    </select>
    <button className="h-16 w-16 bg-primary-gold hover:bg-primary-gold-dark rounded-xl">
      <SearchIcon />
    </button>
  </div>
</form>

{/* Secondary: Quick Links */}
<div className="max-w-2xl mx-auto">
  <h3 className="text-center text-sm font-medium text-text-tertiary mb-4">
    빠른 탐색
  </h3>
  <div className="flex justify-center gap-4">
    <QuickLink icon={<BoxIcon />} label="상품 전체" href="/products" />
    <QuickLink icon={<StoreIcon />} label="매장 찾기" href="/stores" />
    <QuickLink icon={<TrendingIcon />} label="금시세 확인" href="/gold-price" />
    <QuickLink icon={<PackageIcon />} label="주문 내역" href="/orders" />
  </div>
</div>

{/* Tertiary: Featured Products */}
<section className="mt-20">
  <h2 className="text-3xl font-bold text-text-primary mb-8">인기 상품</h2>
  <PopularProductsCarousel />
</section>
```

**QuickLink 컴포넌트** (신규 생성 필요)
```tsx
interface QuickLinkProps {
  icon: React.ReactNode;
  label: string;
  href: string;
}

function QuickLink({ icon, label, href }: QuickLinkProps) {
  return (
    <Link
      to={href}
      className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-surface transition-colors group"
    >
      <div className="w-14 h-14 rounded-xl bg-surface flex items-center justify-center group-hover:bg-primary-gold-light transition-colors">
        {icon}
      </div>
      <span className="text-sm font-medium text-text-secondary group-hover:text-primary-gold">
        {label}
      </span>
    </Link>
  );
}
```

---

## 3. 상품페이지 개선

### 3.1 현재 문제점 분석

**레이아웃 문제**
1. ❌ **배너 과도**: PopularProductsCarousel이 화면을 너무 많이 차지 → 실제 콘텐츠 접근성 저하
2. ❌ **좌측 필터 가독성 낮음**: 폰트 크기/대비 부족 → 첫 시각에서 인지 어려움
3. ❌ **상품 카드 정보 위계 없음**: 상품명/가격/매장명/주소가 동일한 시각적 무게
4. ❌ **찜/장바구니 버튼 상시 노출**: 화면 밀도 증가 → 시각적 혼잡

### 3.2 개선 방향

#### 3.2.1 배너 축소

**Before (현재 - ProductsPage.tsx:237-238)**
```tsx
<PopularProductsCarousel products={popularProducts} isLoading={isLoadingPopular} />
```

**After (개선안)**
```tsx
{/* Option 1: 높이 제한 */}
<PopularProductsCarousel
  products={popularProducts.slice(0, 4)}
  isLoading={isLoadingPopular}
  className="max-h-80"  // 높이 제한
  showControls={true}
/>

{/* Option 2: 배너 제거 + 인라인 배치 */}
{/* 배너 대신 상품 목록 상단에 "인기 상품" 뱃지 표시 */}
```

#### 3.2.2 좌측 필터 개선

**Before (CategorySidebar)**
```tsx
// 추정: 폰트 크기 작고 대비 낮음
<button className="text-sm text-text-secondary">
  반지
</button>
```

**After (개선안)**
```tsx
// tailwind.config.ts에 커스텀 클래스 추가
<button className="text-base font-medium text-text-primary hover:text-primary-gold">
  반지
</button>

// 선택된 카테고리 강조
<button className="text-base font-semibold text-primary-gold bg-primary-gold-light">
  반지
</button>
```

**CategorySidebar.tsx 개선 포인트**:
1. ✅ 섹션 제목 명확화: "필터" → "지역" / "카테고리"
2. ✅ 폰트 크기 증가: `text-sm` → `text-base`
3. ✅ 선택된 항목 강조: 배경색 + 볼드
4. ✅ 구분선 추가: 섹션 간 시각적 분리

#### 3.2.3 상품 카드 정보 위계 확립

**Before (ProductCard - 추정)**
```tsx
<div>
  <h3>18K 골드 반지</h3>           {/* 동일 무게 */}
  <p>₩850,000</p>                  {/* 동일 무게 */}
  <p>강남 금은방</p>               {/* 동일 무게 */}
  <p>서울 강남구 역삼동</p>        {/* 동일 무게 */}
</div>
```

**After (개선안)**
```tsx
<div className="space-y-2">
  {/* Primary: 가격 (가장 중요) */}
  <p className="text-2xl font-bold text-primary-gold">
    ₩850,000
  </p>

  {/* Secondary: 상품명 */}
  <h3 className="text-lg font-semibold text-text-primary line-clamp-1">
    18K 골드 반지
  </h3>

  {/* Tertiary: 매장명 */}
  <p className="text-sm font-medium text-text-secondary flex items-center gap-1">
    <StoreIcon className="w-4 h-4" />
    강남 금은방
  </p>

  {/* Quaternary: 주소 (숨김 or 호버 시 표시) */}
  <p className="text-xs text-text-tertiary line-clamp-1">
    서울 강남구 역삼동
  </p>
</div>
```

**위계 우선순위**:
1. **가격** (Primary) - 가장 큰 폰트 + 골드 컬러 → 구매 결정 핵심 정보
2. **상품명** (Secondary) - 볼드 + 검정 → 제품 식별
3. **매장명** (Tertiary) - 미디엄 + 아이콘 → 신뢰도
4. **주소** (Quaternary) - 작게 or 숨김 → 보조 정보

#### 3.2.4 찜/장바구니 버튼 최적화

**Before (상시 노출)**
```tsx
<div className="flex gap-2">
  <button>❤️ 찜</button>
  <button>🛒 장바구니</button>
</div>
```

**After (호버 시 노출 또는 아이콘만 표시)**

**Option 1: 호버 시 표시 (추천)**
```tsx
<div className="group relative">
  <img src={product.image} />

  {/* 호버 시 오버레이 + 버튼 표시 */}
  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
    <button className="btn btn-circle bg-white">
      <HeartIcon />
    </button>
    <button className="btn btn-circle bg-primary-gold">
      <CartIcon />
    </button>
  </div>
</div>
```

**Option 2: 아이콘만 표시 (항상 보임, 공간 절약)**
```tsx
<div className="flex gap-2">
  <button className="btn btn-xs btn-circle btn-ghost" aria-label="찜하기">
    <HeartIcon className="w-4 h-4" />
  </button>
  <button className="btn btn-xs btn-circle btn-primary" aria-label="장바구니">
    <CartIcon className="w-4 h-4" />
  </button>
</div>
```

**판단**: Option 1 (호버 시 표시) 추천
- 이유: 모바일에서는 탭 시 표시, 데스크톱에서는 호버 → 클린한 UI

---

## 4. 상품 상세 페이지 개선

### 4.1 현재 문제점 분석

**플로우 문제**
1. ❌ **정보 과도 분리**: 매장 정보/상품 상세/옵션이 섹션별로 분리 → 탐색 흐름 끊김
2. ❌ **옵션 선택 가시성 부족**: 필수 옵션임에도 강조 부족 → 사용자 탈주 위험
3. ❌ **CTA 위치 부적절**: 장바구니/바로구매 버튼이 상단 → 정보 소비 흐름 방해
4. ❌ **네이버 스마트스토어 플로우 미반영**: 연속된 스크롤 구조가 아닌 탭/섹션 구조

### 4.2 개선 방향 (네이버 스마트스토어 참고)

#### 4.2.1 스크롤 기반 연속 레이아웃

**Before (현재 - ProductDetailPage.tsx:415-697)**
```tsx
{/* 섹션별로 분리됨 */}
<section>상품 기본 정보</section>
<section>구매 옵션 (접힘)</section>
<section>구매 수량</section>
<section>매장 정보 (접힘)</section>
<section>상품 정보 (접힘)</section>
```

**After (개선안 - 네이버 스토어 스타일)**
```tsx
<div className="grid lg:grid-cols-[520px_1fr] gap-12">
  {/* Left: Sticky Image */}
  <div className="lg:sticky lg:top-24 lg:self-start">
    <ProductImage />
    <ProductThumbnails />  {/* 다중 이미지 */}
  </div>

  {/* Right: Continuous Scroll */}
  <div className="space-y-6">
    {/* 1. 기본 정보 (항상 보임) */}
    <section>
      <h1 className="text-3xl font-bold">{product.name}</h1>
      <div className="text-4xl font-bold text-primary-gold">
        {formatCurrency(product.price)}
      </div>
      <div className="flex items-center gap-2">
        <StoreIcon />
        <Link to={`/stores/${store.id}`}>{store.name}</Link>
      </div>
    </section>

    {/* 2. 옵션 선택 (항상 펼침, 강조) */}
    <section className="border-2 border-primary-gold rounded-2xl p-6 bg-primary-gold-light/30">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-text-primary">
          옵션 선택 <span className="text-error">*</span>
        </h2>
        <span className="badge badge-error">필수</span>
      </div>
      {renderOptions()}
      {optionError && (
        <div className="alert alert-error mt-4">
          <AlertIcon />
          <span>{optionError}</span>
        </div>
      )}
    </section>

    {/* 3. 수량 선택 */}
    <section>
      <h2 className="text-lg font-semibold mb-3">수량</h2>
      <QuantitySelector />
    </section>

    {/* 4. CTA 버튼 (Sticky Bottom on Mobile) */}
    <div className="sticky bottom-0 bg-white p-4 border-t lg:static lg:border-none">
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" size="lg">
          <CartIcon /> 장바구니
        </Button>
        <Button variant="primary" size="lg">
          <CreditCardIcon /> 바로 구매
        </Button>
      </div>
    </div>

    {/* 5. 상품 상세 설명 (항상 펼침) */}
    <section>
      <h2 className="text-2xl font-bold mb-4">상품 상세</h2>
      <div className="prose max-w-none">
        {product.description}
      </div>
      <div className="grid grid-cols-2 gap-4 mt-6">
        <InfoCard label="소재" value={product.material} />
        <InfoCard label="중량" value={`${product.weight}g`} />
        <InfoCard label="순도" value={product.purity} />
        <InfoCard label="재고" value={`${product.stock}개`} />
      </div>
    </section>

    {/* 6. 매장 정보 (항상 펼침) */}
    <section>
      <h2 className="text-2xl font-bold mb-4">매장 안내</h2>
      <StoreInfoCard store={store} />
      <div className="grid grid-cols-2 gap-3 mt-4">
        <Button variant="outline" href={`tel:${store.phone}`}>
          <PhoneIcon /> 전화 문의
        </Button>
        <Button variant="outline" href={mapUrl} target="_blank">
          <MapIcon /> 지도 보기
        </Button>
      </div>
    </section>

    {/* 7. 리뷰 (Optional - 추후 구현) */}
    <section>
      <h2 className="text-2xl font-bold mb-4">상품 리뷰</h2>
      <Reviews productId={product.id} />
    </section>
  </div>
</div>
```

**주요 변경점**:
1. ✅ **탭 제거**: 모든 정보가 연속된 스크롤로 배치 → 자연스러운 정보 소비
2. ✅ **옵션 선택 강조**:
   - 골드 테두리 + 배경색
   - "필수" 뱃지 표시
   - 에러 발생 시 Alert 컴포넌트로 즉시 피드백
3. ✅ **CTA 위치 조정**:
   - 모바일: Sticky Bottom (항상 보임, 스크롤해도 접근 가능)
   - 데스크톱: 정보 소비 후 자연스러운 위치
4. ✅ **좌측 이미지 Sticky**: 스크롤해도 이미지가 보임 (참고 용이)

#### 4.2.2 옵션 선택 UX 개선

**Before (현재 - ProductDetailPage.tsx:223-350)**
```tsx
{/* 옵션이 접혀있거나 강조 부족 */}
<section>
  <h2>구매 옵션</h2>
  {renderOptions()}
</section>
```

**After (개선안)**
```tsx
<section className="border-2 border-primary-gold rounded-2xl p-6 bg-gradient-to-br from-primary-gold-light/20 to-transparent">
  {/* 헤더 - 필수 여부 강조 */}
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
      옵션 선택
      <span className="text-error text-2xl">*</span>
    </h2>
    <span className="badge badge-lg badge-error gap-2">
      <AlertTriangleIcon className="w-4 h-4" />
      필수 선택
    </span>
  </div>

  {/* 옵션 목록 */}
  {renderOptions()}

  {/* 에러 메시지 - 즉시 피드백 */}
  {optionError && (
    <div role="alert" className="alert alert-error mt-4 shadow-lg animate-shake">
      <AlertCircleIcon className="w-6 h-6" />
      <div>
        <h3 className="font-bold">옵션을 선택해주세요</h3>
        <div className="text-sm">{optionError}</div>
      </div>
    </div>
  )}

  {/* 선택된 옵션 요약 */}
  {selectedOption && (
    <div className="mt-4 p-4 bg-white rounded-xl border border-primary-gold">
      <p className="text-sm text-text-tertiary mb-1">선택한 옵션</p>
      <p className="text-lg font-bold text-text-primary">
        {selectedOption.name} {selectedOption.value}
      </p>
      <p className="text-sm text-text-secondary">
        {selectedOption.additional_price > 0
          ? `+${formatCurrency(selectedOption.additional_price)}`
          : '추가 금액 없음'}
      </p>
    </div>
  )}
</section>
```

**시각적 피드백 강화**:
1. ✅ 테두리 + 배경색 그라데이션 → 섹션 강조
2. ✅ "필수" 뱃지 + 에러 색상 → 중요도 전달
3. ✅ 에러 발생 시 shake 애니메이션 → 즉각적 피드백
4. ✅ 선택된 옵션 요약 표시 → 선택 확인 용이

---

## 5. 매장 상세 페이지 개선

### 5.1 현재 문제점 분석

**필터/CTA 문제**
1. ❌ **지역 필터 인지 어려움**: "전체 지역", "전체 카테고리"가 필터처럼 보이지 않음
2. ❌ **"전화하기" 버튼 부적절**: 데스크톱에서는 의미 없는 액션 (모바일 전용)
3. ❌ **상품 보유 정보 과다**: "(현재: 목걸이1, 반지1)" 세부 항목별 개수 나열 → 사용성 낮음

### 5.2 개선 방향

#### 5.2.1 필터 UI 개선

**Before (추정)**
```tsx
<div className="flex gap-3">
  <span>전체 지역</span>
  <span>전체 카테고리</span>
</div>
```

**After (드롭다운 형태)**
```tsx
<div className="flex gap-3 mb-6">
  {/* 지역 필터 */}
  <select className="select select-bordered w-48">
    <option>전체 지역</option>
    <option>서울</option>
    <option>부산</option>
  </select>

  {/* 카테고리 필터 */}
  <select className="select select-bordered w-48">
    <option>전체 카테고리</option>
    <option>반지</option>
    <option>목걸이</option>
  </select>

  {/* 필터 아이콘 추가 */}
  <Button variant="outline" aria-label="필터">
    <FilterIcon className="w-5 h-5" />
  </Button>
</div>
```

#### 5.2.2 "전화하기" 버튼 최적화

**Before (StoreDetailPage.tsx:304-317)**
```tsx
{/* 데스크톱에서도 항상 보임 */}
<a href={`tel:${sanitizedPhone}`} className="btn">
  <Phone /> 전화 연결
</a>
```

**After (디바이스 대응)**

**Option 1: CSS로 숨김**
```tsx
<a
  href={`tel:${sanitizedPhone}`}
  className="btn md:hidden"  // 데스크톱에서 숨김
>
  <Phone /> 전화 연결
</a>

{/* 데스크톱에서는 전화번호만 표시 */}
<div className="hidden md:flex items-center gap-2">
  <Phone className="w-5 h-5 text-primary-gold" />
  <span className="font-medium">{store.phone}</span>
  <button
    onClick={() => navigator.clipboard.writeText(store.phone)}
    className="btn btn-xs btn-ghost"
  >
    복사
  </button>
</div>
```

**Option 2: JavaScript로 감지**
```tsx
const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);

{isMobile ? (
  <a href={`tel:${sanitizedPhone}`} className="btn">
    <Phone /> 전화 연결
  </a>
) : (
  <div className="flex items-center gap-2">
    <Phone className="w-5 h-5" />
    <span>{store.phone}</span>
    <Button size="xs" onClick={handleCopyPhone}>복사</Button>
  </div>
)}
```

**판단**: Option 1 (CSS) 추천
- 이유: 간단하고 성능 우수, SSR 호환

#### 5.2.3 상품 보유 정보 단순화

**Before (StoreDetailPage.tsx:227-241 추정)**
```tsx
{categoryCounts.map((category) => (
  <span key={category.id}>
    {category.name} {category.count}개
  </span>
))}
```

**After (총 개수만 표시)**
```tsx
<div className="stats shadow">
  <div className="stat">
    <div className="stat-figure text-primary-gold">
      <PackageIcon className="w-8 h-8" />
    </div>
    <div className="stat-title">총 보유 상품</div>
    <div className="stat-value text-primary-gold">
      {totalProductCount}개
    </div>
    <div className="stat-desc">
      {/* 카테고리별 개수는 호버 시 툴팁으로 표시 (선택사항) */}
      <Tooltip content={categoryCounts.map(c => `${c.name}: ${c.count}개`).join(', ')}>
        <InfoIcon className="w-4 h-4 inline" />
        상세 보기
      </Tooltip>
    </div>
  </div>
</div>
```

**대안: 카테고리별 간단 표시**
```tsx
<div className="flex flex-wrap gap-2">
  {categoryCounts.slice(0, 3).map((category) => (
    <span key={category.id} className="badge badge-lg badge-outline">
      {category.name} {category.count}
    </span>
  ))}
  {categoryCounts.length > 3 && (
    <span className="badge badge-lg">
      외 {categoryCounts.length - 3}개 카테고리
    </span>
  )}
</div>
```

**판단**: 총 개수 + 간단 표시 조합 추천
- 이유: 사용자는 "이 매장에 상품이 많은가?"를 먼저 알고 싶음

---

## 6. 구현 우선순위

### Phase 1: Foundation (즉시 실행) 🔥

**1.1 Design System 업데이트**
- [ ] `tailwind.config.ts`: 컬러 팔레트 재정의
- [ ] CSS Variables: `--color-*` 변수 업데이트
- [ ] 타이포그래피: Pretendard 4 weights 설정
- [ ] 예상 작업 시간: 2시간

**1.2 전역 스타일 적용**
- [ ] `index.css` 또는 `globals.css`: 기본 텍스트 색상, 폰트 적용
- [ ] 버튼/입력 컴포넌트: 새 컬러 시스템 반영
- [ ] 예상 작업 시간: 3시간

### Phase 2: High Impact (1-2일) ⚡

**2.1 메인페이지 개선**
- [ ] `MainHeroSection.tsx`: 검색 강조 + 빠른 탐색 축소
- [ ] `QuickLink` 컴포넌트 신규 생성
- [ ] 인기 상품 섹션 추가 (기존 carousel 재사용)
- [ ] 예상 작업 시간: 4시간

**2.2 상품 카드 위계 개선**
- [ ] `ProductCard.tsx`: 가격 > 상품명 > 매장명 > 주소 위계 적용
- [ ] 찜/장바구니 버튼: 호버 시 표시 로직 추가
- [ ] 예상 작업 시간: 3시간

### Phase 3: Medium Impact (2-3일) 📊

**3.1 상품페이지 레이아웃**
- [ ] `ProductsPage.tsx`: 배너 높이 제한
- [ ] `CategorySidebar.tsx`: 폰트 크기/대비 개선
- [ ] 필터 섹션 제목 명확화
- [ ] 예상 작업 시간: 4시간

**3.2 매장 상세 페이지**
- [ ] `StoreDetailPage.tsx`: 필터 드롭다운 형태 변경
- [ ] 전화하기 버튼: 모바일만 표시 (CSS)
- [ ] 상품 보유 정보: 총 개수 + 간단 표시
- [ ] 예상 작업 시간: 3시간

### Phase 4: Complex (3-5일) 🏗️

**4.1 상품 상세 페이지 재구성**
- [ ] `ProductDetailPage.tsx`: 탭 제거 + 연속 스크롤 레이아웃
- [ ] 옵션 선택 섹션: 강조 스타일 적용
- [ ] CTA 버튼: Sticky Bottom (모바일)
- [ ] 좌측 이미지: Sticky (데스크톱)
- [ ] 예상 작업 시간: 8시간

**4.2 컴포넌트 리팩토링**
- [ ] `OptionSelector` 컴포넌트 분리
- [ ] `StoreInfoCard` 컴포넌트 분리
- [ ] `PriceDisplay` 컴포넌트 생성
- [ ] 예상 작업 시간: 4시간

### Phase 5: Polish (1-2일) ✨

**5.1 애니메이션 및 인터랙션**
- [ ] 옵션 에러 시 shake 애니메이션
- [ ] 호버 효과 통일
- [ ] 로딩 상태 개선
- [ ] 예상 작업 시간: 4시간

**5.2 접근성 및 반응형**
- [ ] 모바일 레이아웃 검증
- [ ] 키보드 네비게이션 테스트
- [ ] ARIA 레이블 추가
- [ ] 예상 작업 시간: 3시간

---

## 7. 성공 지표 (KPI)

### 7.1 정량적 지표

**Lighthouse 점수**
- Performance: 90+ (현재 TBD)
- Accessibility: 95+ (현재 TBD)
- Best Practices: 95+
- SEO: 90+

**사용자 행동**
- 메인페이지 검색 사용률: 70%+ (vs 카테고리 버튼 30%)
- 상품 상세 → 장바구니 전환율: 15%+ (옵션 에러율 5% 이하)
- 평균 페이지 체류 시간: +30% 증가

### 7.2 정성적 지표

**UX 체크리스트**
- [ ] 메인페이지 진입 시 무엇을 해야 할지 5초 내 이해 가능
- [ ] 상품 카드에서 가격이 가장 먼저 눈에 들어옴
- [ ] 상품 상세에서 옵션 선택이 필수임을 즉시 인지
- [ ] 모바일에서 CTA 버튼이 항상 접근 가능
- [ ] 데스크톱에서 불필요한 모바일 전용 기능(전화하기) 숨김

---

## 8. 참고 자료

### 8.1 벤치마크 사이트

**네이버 스마트스토어**
- 연속 스크롤 레이아웃
- 옵션 선택 강조
- Sticky CTA

**쿠팡**
- 가격 우선 표시
- 간결한 상품 카드
- 효율적인 필터

**당근마켓**
- 지역 기반 검색
- 심플한 UI
- 모바일 우선 설계

### 8.2 디자인 시스템 참고

**Tailwind UI**
- E-commerce 컴포넌트
- 상품 카드 레이아웃
- 필터 디자인

**DaisyUI**
- 현재 사용 중인 컴포넌트 라이브러리
- 테마 커스터마이징 가이드

---

## 9. 위험 요소 및 대응

### 9.1 기술적 위험

**리스크**: 컬러 시스템 변경 시 기존 컴포넌트 깨짐
- **대응**: CSS Variables 사용 → 한 곳만 수정
- **테스트**: Storybook으로 전체 컴포넌트 시각적 회귀 테스트

**리스크**: 상품 상세 페이지 재구성 시 기존 로직 손상
- **대응**: 단계적 리팩토링 (탭 제거 → 레이아웃 변경 → 스타일 개선)
- **테스트**: 기존 통합 테스트 유지 (옵션 선택, 장바구니 담기 등)

### 9.2 UX 위험

**리스크**: 메인페이지 "빠른 탐색" 축소 시 사용자 혼란
- **대응**: A/B 테스트 (기존 vs 새 디자인)
- **모니터링**: 검색 사용률 vs 버튼 클릭률 추적

**리스크**: 상품 카드 호버 효과가 모바일에서 작동 안 함
- **대응**: 터치 이벤트 별도 처리 (탭 시 버튼 표시)
- **테스트**: 실제 모바일 기기에서 수동 테스트

---

## 10. 다음 단계

### 10.1 즉시 실행 가능한 항목 (Quick Wins)

1. **컬러 시스템 업데이트** (2시간)
   - `tailwind.config.ts` 수정
   - CSS Variables 업데이트
   - 버튼 컴포넌트 적용

2. **메인페이지 텍스트 개선** (30분)
   - "상품" → "상품 전체"
   - "금" → "금시세 확인"
   - "구매/예약" → "주문 내역"

3. **상품 카드 가격 강조** (1시간)
   - 폰트 크기: `text-lg` → `text-2xl`
   - 색상: `text-text-primary` → `text-primary-gold`
   - Weight: `font-medium` → `font-bold`

### 10.2 의사결정 필요 항목

**질문 1**: 메인페이지 레이아웃 - Option A (검색 중심) vs Option B (카테고리 중심)?
- **추천**: Option A (검색 중심)
- **근거**: 로컬 서비스 특성상 "내 지역 + 특정 상품" 검색이 주 사용 패턴

**질문 2**: 상품 카드 버튼 - 호버 시 표시 vs 아이콘만 표시?
- **추천**: 호버 시 표시 (Option 1)
- **근거**: 클린한 UI, 모바일 대응 가능

**질문 3**: 매장 상품 개수 - 총 개수만 vs 카테고리별 간단 표시?
- **추천**: 총 개수 + 상위 3개 카테고리 표시
- **근거**: 사용성과 정보량의 균형

### 10.3 승인 요청

이 개선 계획을 검토하시고 다음 사항을 결정해주세요:

1. **Phase 1 (Foundation) 즉시 시작 승인 여부**
2. **메인페이지 레이아웃 방향 선택** (Option A/B)
3. **우선순위 조정 필요 여부** (다른 페이지 먼저?)

---

**문서 작성자**: Claude Code
**검토 필요**: 프로젝트 리드, 디자이너, 백엔드 팀
**다음 업데이트**: Phase 1 완료 후 진행 상황 보고
