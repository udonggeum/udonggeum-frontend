import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Store } from 'lucide-react';
import FallbackImage from './FallbackImage';
import { useToggleWishlist, useIsInWishlist } from '@/hooks/queries';
import { useAuthStore } from '@/stores/useAuthStore';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onWishlist?: (productId: string) => void;
  onAddToCart?: (productId: string) => void;
  hideActions?: boolean;
}

/**
 * ProductCard Component
 *
 * Displays a single product with image, name, price, and action buttons.
 * Used in product grids throughout the main page.
 */
export default function ProductCard({
  product,
  onWishlist,
  onAddToCart,
  hideActions = false,
}: ProductCardProps) {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Convert string ID to number for API
  const productIdNum = parseInt(product.id, 10);

  // Check if product is in wishlist
  const isInWishlist = useIsInWishlist(productIdNum);

  // Wishlist toggle mutation
  const { mutate: toggleWishlist, isPending: isTogglingWishlist } = useToggleWishlist();

  const formattedPrice = product.price.toLocaleString('ko-KR');

  const handleWishlistClick = () => {
    // Check authentication
    if (!isAuthenticated) {
      void navigate('/login');
      return;
    }

    // Call legacy onWishlist if provided (for backward compatibility)
    onWishlist?.(product.id);

    // Toggle wishlist via API
    toggleWishlist({
      productId: productIdNum,
      isInWishlist,
    });
  };

  const isSoldOut = product.stockQuantity === 0;

  return (
    <div
      className="card bg-[var(--color-secondary)] shadow-xl border border-[var(--color-text)]/10 hover-lift"
      role="article"
      aria-label={`${product.name} 상품 카드`}
    >
      <figure className="aspect-square overflow-hidden bg-[var(--color-primary)] relative group">
        <Link to={`/products/${product.id}`} aria-label={`${product.name} 상세보기`} className="block h-full w-full">
          <FallbackImage
            src={product.imageUrl}
            alt={product.imageAlt}
            className={`w-full h-full object-cover transition-transform duration-300 hover:scale-105 ${isSoldOut ? 'opacity-50' : ''}`}
            loading="lazy"
          />
        </Link>

        {/* Sold Out Badge */}
        {isSoldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-10">
            <div className="bg-error text-white px-6 py-3 rounded-lg font-bold text-xl shadow-lg">
              품절
            </div>
          </div>
        )}

        {/* Action buttons overlaid on image */}
        {!hideActions && !isSoldOut && (
          <div className="absolute bottom-3 right-3 flex gap-2 z-10">
            <button
              type="button"
              onClick={handleWishlistClick}
              disabled={isTogglingWishlist}
              className="btn btn-sm w-9 h-9 p-0 rounded-full shadow-lg backdrop-blur-sm transition-all bg-[var(--color-primary)]/80 hover:bg-[var(--color-primary)] border-none"
              aria-label={isInWishlist ? '찜 해제' : '찜하기'}
            >
              {isTogglingWishlist ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-5 w-5 ${
                    isInWishlist
                      ? 'fill-[var(--color-gold)] text-[var(--color-gold)]'
                      : 'text-[var(--color-text)]'
                  }`}
                  fill={isInWishlist ? 'currentColor' : 'none'}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              )}
            </button>
            <button
              type="button"
              onClick={() => onAddToCart?.(product.id)}
              className="btn btn-sm w-9 h-9 p-0 rounded-full shadow-lg backdrop-blur-sm transition-all bg-[var(--color-gold)]/90 hover:bg-[var(--color-gold)] text-white border-none"
              aria-label={product.isInCart ? '장바구니에 담김' : '장바구니에 담기'}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </button>
          </div>
        )}
      </figure>
      <div className="card-body space-y-2">
        {/* Primary: 가격 (가장 중요) */}
        <p className="text-2xl font-bold text-[var(--color-gold)]">₩{formattedPrice}~</p>

        {/* Secondary: 상품명 */}
        <h3 className="text-lg font-semibold text-[var(--color-text)] line-clamp-1">
          <Link to={`/products/${product.id}`} className="hover:text-[var(--color-gold)] transition-colors">
            {product.name}
          </Link>
        </h3>

        {/* Tertiary: 매장명 */}
        {product.storeName && (
          <p className="text-sm font-medium text-[var(--color-text)]/80 flex items-center gap-1">
            <Store className="w-4 h-4 text-[var(--color-gold)]" />
            {product.storeName}
          </p>
        )}

        {/* Quaternary: 주소 */}
        {product.storeLocation && (
          <p className="text-xs text-[var(--color-text)]/60 flex items-center gap-1 line-clamp-1">
            <MapPin className="w-3 h-3" />
            {product.storeLocation}
          </p>
        )}
      </div>
    </div>
  );
}
