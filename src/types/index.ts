// Core Entities for Main Page Feature

/**
 * Represents a geographic location for filtering products
 */
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

/**
 * Represents a type of jewelry product
 */
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

/**
 * Represents a jewelry item available for sale
 */
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

/**
 * Represents promotional content in the hero carousel
 */
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

/**
 * Represents a menu link in the navigation bar
 */
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

// Supporting Types

/**
 * Represents the current state of search filters
 */
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

/**
 * Represents the current state of the hero carousel
 */
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
