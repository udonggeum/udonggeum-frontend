# Main Page Component Structure

## Overview
메인화면(Main Screen) component structure for 우리동네금은방.

## Component Hierarchy

```
MainPage
├── Navbar
│   ├── Logo
│   └── NavMenu
│       └── NavMenuItem (상품, 매장, 장바구니, 마이페이지/로그인)
│
├── SearchSection
│   ├── RegionDropdown (지역 필터링)
│   ├── ProductCategoryDropdown (상품 필터링)
│   └── SearchButton
│
├── HeroSection
│   └── ImageCarousel
│       ├── CarouselItem
│       └── CarouselControls
│
├── PopularProductsSection
│   ├── CategoryTabs (반지/목걸이/팔찌 등)
│   └── ProductGrid
│       └── ProductCard (3-4 items)
│           ├── ProductImage
│           ├── ProductName
│           └── ProductPrice (optional)
│
└── Footer
```

## Component Details

### Navbar
- **Logo**: Clickable image, navigates to home
- **NavMenu**: Horizontal menu with items in Korean
- **NavMenuItem**: Individual menu items (상품, 매장, 장바구니, 로그인/마이페이지)

### SearchSection
- **RegionDropdown**: 지역 선택 (서울 강동구, etc.)
- **ProductCategoryDropdown**: 상품 카테고리 선택 (반지, 목걸이, 팔찌, etc.)
- **SearchButton**: 검색 실행 버튼

### HeroSection
- **ImageCarousel**: Center-aligned image carousel
- Auto-play and manual navigation controls

### PopularProductsSection
- **CategoryTabs**: 카테고리별 인기상품 탭
- **ProductGrid**: Responsive grid layout (3-4 items)
- **ProductCard**: Reusable card component
  - Product image
  - Product name
  - Optional: price, options

### Footer
- Company info, links, copyright

## Tech Stack
- **Framework**: React
- **Styling**: Tailwind CSS
- **UI Library**: daisyUI
- **Language**: Korean (한글)

## Design Principles
- Custom, reusable components
- Responsive design
- Mobile-first approach

---

## DaisyUI Component Implementation

### 1. Navbar Component

**Features:**
- Responsive design with mobile hamburger menu
- Desktop horizontal navigation
- Korean menu items
- Search icon in navbar end

**HTML Structure:**
```html
<div class="navbar bg-base-100 shadow-md">
  <!-- Navbar Start (Logo) -->
  <div class="navbar-start">
    <!-- Mobile Menu Dropdown -->
    <div class="dropdown">
      <button class="btn btn-ghost lg:hidden">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" />
        </svg>
      </button>
      <ul class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
        <li><a href="#products">상품</a></li>
        <li><a href="#stores">매장</a></li>
        <li><a href="#cart">장바구니</a></li>
        <li><a href="#account">로그인/마이페이지</a></li>
      </ul>
    </div>
    <!-- Logo -->
    <a href="/" class="btn btn-ghost text-xl font-bold">
      우리동네금은방
    </a>
  </div>

  <!-- Navbar Center -->
  <div class="navbar-center hidden lg:flex">
    <ul class="menu menu-horizontal px-1">
      <li><a href="#products">상품</a></li>
      <li><a href="#stores">매장</a></li>
      <li><a href="#cart">장바구니</a></li>
      <li><a href="#account">로그인/마이페이지</a></li>
    </ul>
  </div>

  <!-- Navbar End -->
  <div class="navbar-end">
    <button class="btn btn-ghost btn-circle">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </button>
  </div>
</div>
```

### 2. Search Section - Dropdown Components

**Features:**
- Side-by-side region and category dropdowns
- Korean labels and options
- Clean outline button style

**HTML Structure:**
```html
<div class="flex gap-4 p-4">
  <!-- Region Selection Dropdown -->
  <div class="dropdown">
    <div tabindex="0" role="button" class="btn btn-outline">
      지역 선택
    </div>
    <ul tabindex="-1" class="dropdown-content menu bg-base-100 rounded-box z-10 w-52 p-2 shadow">
      <li><a>서울 강동구</a></li>
      <li><a>서울 강남구</a></li>
      <li><a>서울 종로구</a></li>
      <li><a>서울 중구</a></li>
      <li><a>부산 해운대구</a></li>
      <li><a>인천 남동구</a></li>
    </ul>
  </div>

  <!-- Product Category Dropdown -->
  <div class="dropdown">
    <div tabindex="0" role="button" class="btn btn-outline">
      상품 카테고리
    </div>
    <ul tabindex="-1" class="dropdown-content menu bg-base-100 rounded-box z-10 w-52 p-2 shadow">
      <li><a>반지</a></li>
      <li><a>목걸이</a></li>
      <li><a>팔찌</a></li>
      <li><a>귀걸이</a></li>
      <li><a>발찌</a></li>
    </ul>
  </div>

  <!-- Search Button -->
  <button class="btn btn-primary">검색</button>
</div>
```

### 3. Hero Section - Carousel Component

**Features:**
- Auto-play every 5 seconds
- Manual navigation (prev/next buttons)
- Dot indicators
- Smooth scrolling transitions

**HTML Structure:**
```html
<div class="relative w-full h-96 bg-gray-900">
  <!-- Main Carousel Container -->
  <div class="carousel w-full h-full rounded-box shadow-lg" id="heroCarousel">
    <!-- Slide 1 -->
    <div id="slide1" class="carousel-item relative w-full h-full">
      <img
        src="/images/hero-1.jpg"
        alt="Slide 1"
        class="w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
        <h1 class="text-4xl font-bold text-white">우리동네 최고의 금은방</h1>
      </div>
    </div>

    <!-- Slide 2 -->
    <div id="slide2" class="carousel-item relative w-full h-full">
      <img
        src="/images/hero-2.jpg"
        alt="Slide 2"
        class="w-full h-full object-cover"
      />
    </div>

    <!-- Slide 3 -->
    <div id="slide3" class="carousel-item relative w-full h-full">
      <img
        src="/images/hero-3.jpg"
        alt="Slide 3"
        class="w-full h-full object-cover"
      />
    </div>
  </div>

  <!-- Previous Button -->
  <a
    href="#slide3"
    class="absolute left-5 top-1/2 transform -translate-y-1/2 btn btn-circle btn-sm md:btn-md bg-white hover:bg-gray-100 text-gray-900 z-10"
  >
    ❮
  </a>

  <!-- Next Button -->
  <a
    href="#slide2"
    class="absolute right-5 top-1/2 transform -translate-y-1/2 btn btn-circle btn-sm md:btn-md bg-white hover:bg-gray-100 text-gray-900 z-10"
  >
    ❯
  </a>
</div>

<!-- Indicator Buttons -->
<div class="flex justify-center gap-2 py-4">
  <a href="#slide1" class="btn btn-xs btn-circle">1</a>
  <a href="#slide2" class="btn btn-xs btn-circle">2</a>
  <a href="#slide3" class="btn btn-xs btn-circle">3</a>
</div>
```

**JavaScript for Auto-play:**
```javascript
(function() {
  const slides = ['slide1', 'slide2', 'slide3'];
  let currentIndex = 0;
  const autoPlayInterval = 5000; // 5 seconds

  function nextSlide() {
    currentIndex = (currentIndex + 1) % slides.length;
    const slideId = slides[currentIndex];
    document.getElementById(slideId)?.scrollIntoView({ behavior: 'smooth' });
  }

  setInterval(nextSlide, autoPlayInterval);
})();
```

### 4. Popular Products Section - Tabs Component

**Features:**
- Category filtering tabs (반지, 목걸이, 팔찌)
- No JavaScript required
- Clean border style

**HTML Structure:**
```html
<div class="tabs tabs-border">
  <input type="radio" name="category_tabs" class="tab" aria-label="반지" checked="checked" />
  <div class="tab-content bg-base-100 p-6">
    <!-- Ring products grid goes here -->
  </div>

  <input type="radio" name="category_tabs" class="tab" aria-label="목걸이" />
  <div class="tab-content bg-base-100 p-6">
    <!-- Necklace products grid goes here -->
  </div>

  <input type="radio" name="category_tabs" class="tab" aria-label="팔찌" />
  <div class="tab-content bg-base-100 p-6">
    <!-- Bracelet products grid goes here -->
  </div>
</div>
```

### 5. Product Card Component

**Features:**
- Responsive grid (1-4 columns)
- Image with hover zoom effect
- Product name, price
- Action buttons (wishlist, cart)

**Single Card:**
```html
<div class="card bg-base-100 shadow-md hover:shadow-lg transition-shadow">
  <!-- Product Image -->
  <figure class="overflow-hidden bg-gray-200">
    <img
      src="/images/product.jpg"
      alt="Product Name"
      class="w-full h-48 object-cover hover:scale-105 transition-transform"
    />
  </figure>

  <!-- Card Body -->
  <div class="card-body p-4">
    <!-- Product Name -->
    <h2 class="card-title text-lg line-clamp-2">
      18K 금 반지
    </h2>

    <!-- Price -->
    <div class="flex items-baseline gap-2 my-2">
      <span class="text-2xl font-bold text-primary">₩350,000</span>
    </div>

    <!-- Action Buttons -->
    <div class="card-actions justify-between mt-4">
      <button class="btn btn-sm btn-ghost">찜하기</button>
      <button class="btn btn-sm btn-primary">장바구니</button>
    </div>
  </div>
</div>
```

**Grid Container:**
```html
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
  <!-- Multiple product cards here -->
</div>
```

### 6. Footer Component

**Features:**
- Multi-column navigation layout
- Company info, legal, help sections
- Copyright section
- Dark theme styling

**HTML Structure:**
```html
<footer class="footer p-10 bg-neutral text-neutral-content">
  <nav>
    <header class="footer-title">회사정보</header>
    <a class="link link-hover">회사소개</a>
    <a class="link link-hover">매장안내</a>
    <a class="link link-hover">채용정보</a>
  </nav>
  <nav>
    <header class="footer-title">고객지원</header>
    <a class="link link-hover">자주 묻는 질문</a>
    <a class="link link-hover">배송 안내</a>
    <a class="link link-hover">반품/교환</a>
    <a class="link link-hover">주문 조회</a>
  </nav>
  <nav>
    <header class="footer-title">법적고지</header>
    <a class="link link-hover">이용약관</a>
    <a class="link link-hover">개인정보처리방침</a>
    <a class="link link-hover">쿠키 정책</a>
  </nav>
</footer>

<!-- Copyright Section -->
<footer class="footer footer-center p-4 bg-base-300 text-base-content">
  <div>
    <p>Copyright &copy; 2024 우리동네금은방. All rights reserved.</p>
  </div>
</footer>
```

## Implementation Notes

1. **DaisyUI Installation**: Ensure daisyUI is installed and configured in `tailwind.config.js`
2. **Responsive Breakpoints**:
   - Mobile: < 1024px (hamburger menu)
   - Desktop: ≥ 1024px (horizontal menu)
3. **Grid Responsiveness**: Product grid adapts from 1 column (mobile) to 4 columns (xl screens)
4. **Accessibility**: All interactive elements include proper ARIA labels and roles
5. **Korean Language**: All text content uses Korean (한글) as specified
