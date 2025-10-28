import type {
  Region,
  ProductCategory,
  Product,
  CarouselSlide,
  NavigationItem,
} from '../types';

/**
 * Mock regions data - 6 items per FR-002
 */
export const MOCK_REGIONS: Region[] = [
  {
    id: 'seoul-gangdong',
    name: '서울 강동구',
    city: '서울',
    displayOrder: 1,
  },
  {
    id: 'seoul-gangnam',
    name: '서울 강남구',
    city: '서울',
    displayOrder: 2,
  },
  {
    id: 'seoul-jongno',
    name: '서울 종로구',
    city: '서울',
    displayOrder: 3,
  },
  {
    id: 'seoul-jung',
    name: '서울 중구',
    city: '서울',
    displayOrder: 4,
  },
  {
    id: 'busan-haeundae',
    name: '부산 해운대구',
    city: '부산',
    displayOrder: 5,
  },
  {
    id: 'incheon-namdong',
    name: '인천 남동구',
    city: '인천',
    displayOrder: 6,
  },
];

/**
 * Mock product categories - 5 items per FR-003
 */
export const MOCK_CATEGORIES: ProductCategory[] = [
  {
    id: 'rings',
    name: '반지',
    displayOrder: 1,
  },
  {
    id: 'necklaces',
    name: '목걸이',
    displayOrder: 2,
  },
  {
    id: 'bracelets',
    name: '팔찌',
    displayOrder: 3,
  },
  {
    id: 'earrings',
    name: '귀걸이',
    displayOrder: 4,
  },
  {
    id: 'anklets',
    name: '발찌',
    displayOrder: 5,
  },
];

/**
 * Mock products - 16 items (3-4 per category)
 */
export const MOCK_PRODUCTS: Product[] = [
  // Rings (반지)
  {
    id: 'prod-001',
    name: '18K 금 반지',
    price: 350000,
    imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400',
    imageAlt: '18K 금 반지 상품 이미지',
    categoryId: 'rings',
    regionId: 'seoul-gangnam',
    isWishlisted: false,
    isInCart: false,
    storeName: '강남금은방',
  },
  {
    id: 'prod-002',
    name: '다이아몬드 반지',
    price: 850000,
    imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400',
    imageAlt: '다이아몬드 반지 상품 이미지',
    categoryId: 'rings',
    regionId: 'seoul-gangnam',
    isWishlisted: false,
    isInCart: false,
    storeName: '강남금은방',
  },
  {
    id: 'prod-003',
    name: '순금 반지',
    price: 420000,
    imageUrl: 'https://images.unsplash.com/photo-1603561596112-0a132b757442?w=400',
    imageAlt: '순금 반지 상품 이미지',
    categoryId: 'rings',
    regionId: 'seoul-gangdong',
    isWishlisted: false,
    isInCart: false,
    storeName: '동네금방',
  },
  {
    id: 'prod-004',
    name: '백금 반지',
    price: 680000,
    imageUrl: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400',
    imageAlt: '백금 반지 상품 이미지',
    categoryId: 'rings',
    regionId: 'seoul-jongno',
    isWishlisted: false,
    isInCart: false,
    storeName: '종로보석',
  },

  // Necklaces (목걸이)
  {
    id: 'prod-005',
    name: '다이아몬드 목걸이',
    price: 1200000,
    imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400',
    imageAlt: '다이아몬드 목걸이 상품 이미지',
    categoryId: 'necklaces',
    regionId: 'seoul-gangnam',
    isWishlisted: false,
    isInCart: false,
    storeName: '강남금은방',
  },
  {
    id: 'prod-006',
    name: '진주 목걸이',
    price: 580000,
    imageUrl: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=400',
    imageAlt: '진주 목걸이 상품 이미지',
    categoryId: 'necklaces',
    regionId: 'busan-haeundae',
    isWishlisted: false,
    isInCart: false,
    storeName: '해운대금방',
  },
  {
    id: 'prod-007',
    name: '금 목걸이',
    price: 720000,
    imageUrl: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=400',
    imageAlt: '금 목걸이 상품 이미지',
    categoryId: 'necklaces',
    regionId: 'seoul-jung',
    isWishlisted: false,
    isInCart: false,
    storeName: '중구보석',
  },

  // Bracelets (팔찌)
  {
    id: 'prod-008',
    name: '진주 팔찌',
    price: 450000,
    imageUrl: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400',
    imageAlt: '진주 팔찌 상품 이미지',
    categoryId: 'bracelets',
    regionId: 'seoul-gangdong',
    isWishlisted: false,
    isInCart: false,
    storeName: '동네금방',
  },
  {
    id: 'prod-009',
    name: '금 팔찌',
    price: 560000,
    imageUrl: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400',
    imageAlt: '금 팔찌 상품 이미지',
    categoryId: 'bracelets',
    regionId: 'incheon-namdong',
    isWishlisted: false,
    isInCart: false,
    storeName: '인천금은방',
  },
  {
    id: 'prod-010',
    name: '은 팔찌',
    price: 280000,
    imageUrl: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400',
    imageAlt: '은 팔찌 상품 이미지',
    categoryId: 'bracelets',
    regionId: 'seoul-gangnam',
    isWishlisted: false,
    isInCart: false,
    storeName: '강남금은방',
  },
  {
    id: 'prod-011',
    name: '다이아 팔찌',
    price: 980000,
    imageUrl: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=400',
    imageAlt: '다이아 팔찌 상품 이미지',
    categoryId: 'bracelets',
    regionId: 'seoul-jongno',
    isWishlisted: false,
    isInCart: false,
    storeName: '종로보석',
  },

  // Earrings (귀걸이)
  {
    id: 'prod-012',
    name: '큐빅 귀걸이',
    price: 180000,
    imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400',
    imageAlt: '큐빅 귀걸이 상품 이미지',
    categoryId: 'earrings',
    regionId: 'seoul-gangdong',
    isWishlisted: false,
    isInCart: false,
    storeName: '동네금방',
  },
  {
    id: 'prod-013',
    name: '진주 귀걸이',
    price: 320000,
    imageUrl: 'https://images.unsplash.com/photo-1588444837495-c6c8c8e66dd2?w=400',
    imageAlt: '진주 귀걸이 상품 이미지',
    categoryId: 'earrings',
    regionId: 'busan-haeundae',
    isWishlisted: false,
    isInCart: false,
    storeName: '해운대금방',
  },
  {
    id: 'prod-014',
    name: '다이아 귀걸이',
    price: 650000,
    imageUrl: 'https://images.unsplash.com/photo-1629967506686-1f8f5b03ca18?w=400',
    imageAlt: '다이아 귀걸이 상품 이미지',
    categoryId: 'earrings',
    regionId: 'seoul-gangnam',
    isWishlisted: false,
    isInCart: false,
    storeName: '강남금은방',
  },

  // Anklets (발찌)
  {
    id: 'prod-015',
    name: '금 발찌',
    price: 380000,
    imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400',
    imageAlt: '금 발찌 상품 이미지',
    categoryId: 'anklets',
    regionId: 'seoul-jung',
    isWishlisted: false,
    isInCart: false,
    storeName: '중구보석',
  },
  {
    id: 'prod-016',
    name: '은 발찌',
    price: 220000,
    imageUrl: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=400',
    imageAlt: '은 발찌 상품 이미지',
    categoryId: 'anklets',
    regionId: 'incheon-namdong',
    isWishlisted: false,
    isInCart: false,
    storeName: '인천금은방',
  },
];

/**
 * Mock carousel slides - 3 items per FR-005
 */
export const MOCK_CAROUSEL_SLIDES: CarouselSlide[] = [
  {
    id: 'slide-1',
    imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1920',
    altText: '우리동네 최고의 금은방 프로모션 슬라이드 1',
    overlayText: '우리동네 최고의 금은방',
    displayOrder: 1,
  },
  {
    id: 'slide-2',
    imageUrl: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1920',
    altText: '신상품 컬렉션 프로모션 슬라이드 2',
    overlayText: '새로운 컬렉션을 만나보세요',
    displayOrder: 2,
  },
  {
    id: 'slide-3',
    imageUrl: 'https://images.unsplash.com/photo-1603561596112-0a132b757442?w=1920',
    altText: '특별 할인 이벤트 프로모션 슬라이드 3',
    overlayText: '특별 할인 이벤트 진행중',
    displayOrder: 3,
  },
];

/**
 * Mock navigation items - 4 items per FR-001
 */
export const MOCK_NAV_ITEMS: NavigationItem[] = [
  {
    id: 'products',
    label: '상품',
    path: '/products',
    displayOrder: 1,
  },
  {
    id: 'stores',
    label: '매장',
    path: '/stores',
    displayOrder: 2,
  },
  {
    id: 'cart',
    label: '장바구니',
    path: '/cart',
    displayOrder: 3,
  },
  {
    id: 'account',
    label: '로그인/마이페이지',
    path: '/account',
    displayOrder: 4,
  },
];
