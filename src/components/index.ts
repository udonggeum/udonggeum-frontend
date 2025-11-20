/**
 * Component Index
 *
 * Central export point for all reusable components.
 * Import components from this file for consistency.
 */

// Core UI Components
export { default as Button } from './Button';
export { default as ErrorAlert } from './ErrorAlert';
export { default as LoadingSpinner } from './LoadingSpinner';
export { default as FallbackImage } from './FallbackImage';

// Product Components
export { default as ProductCard } from './ProductCard';
export { default as ProductsError } from './ProductsError';
export { default as ProductsLoadingSkeleton } from './ProductsLoadingSkeleton';
export { default as PopularProducts } from './PopularProducts';
export { default as ProductsFilterBar } from './ProductsFilterBar';
export { default as CategoryFilterChips } from './CategoryFilterChips';
export { default as CategorySidebar } from './CategorySidebar';
export { default as PaginationControls } from './PaginationControls';
export { default as AddToCartModal } from './AddToCartModal';

// Order Components
export { default as OrderCard } from './OrderCard';
export { OrderStatusBadge, PaymentStatusBadge } from './OrderStatusBadge';

// Cart Components
export { default as CartItem } from './CartItem';

// Store Components
export { default as StoreCard } from './StoreCard';
export { default as StoresLoadingSkeleton } from './StoresLoadingSkeleton';

// Layout Components
export { default as Navbar } from './Navbar';
export { default as Footer } from './Footer';
export { default as HeroCarousel } from './HeroCarousel';
export { default as SearchSection } from './SearchSection';
export { default as MainHeroSection } from './MainHeroSection';
export { default as ProductCarousel } from './ProductCarousel';

// Address Components
export { default as AddressFormModal } from './AddressFormModal';

// Image Components
export { default as ImageUploadWithOptimization } from './ImageUploadWithOptimization';
