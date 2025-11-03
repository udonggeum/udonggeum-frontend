import { useEffect, useState } from 'react';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onWishlist?: (productId: string) => void;
  onAddToCart?: (productId: string) => void;
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
}: ProductCardProps) {
  const formattedPrice = product.price.toLocaleString('ko-KR');
  const PLACEHOLDER_IMAGE = '/images/base-image.png';
  const [imageSrc, setImageSrc] = useState(product.imageUrl || PLACEHOLDER_IMAGE);

  useEffect(() => {
    setImageSrc(product.imageUrl || PLACEHOLDER_IMAGE);
  }, [product.imageUrl]);

  return (
    <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
      <figure className="aspect-square overflow-hidden">
        <img
          src={imageSrc}
          alt={product.imageAlt}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={() => {
            if (imageSrc !== PLACEHOLDER_IMAGE) {
              setImageSrc(PLACEHOLDER_IMAGE);
            }
          }}
        />
      </figure>
      <div className="card-body">
        <h3 className="card-title text-lg">{product.name}</h3>
        <p className="text-2xl font-bold text-primary">₩{formattedPrice}</p>
        {product.storeName && (
          <p className="text-sm text-base-content/70">
            {product.storeName}
            {product.storeLocation ? ` · ${product.storeLocation}` : ''}
          </p>
        )}
        {product.options && product.options.length > 0 && (
          <ul className="mt-2 space-y-1">
            {product.options.slice(0, 3).map((option) => (
              <li key={`option-${product.id}-${option}`} className="text-sm text-base-content/60">
                • {option}
              </li>
            ))}
            {product.options.length > 3 && (
              <li className="text-xs text-base-content/50">+ 추가 옵션 {product.options.length - 3}개</li>
            )}
          </ul>
        )}
        <div className="card-actions justify-end mt-4">
          <button
            type="button"
            onClick={() => onWishlist?.(product.id)}
            className={`btn btn-sm ${
              product.isWishlisted ? 'btn-secondary' : 'btn-outline btn-secondary'
            }`}
            aria-label={product.isWishlisted ? '찜 해제' : '찜하기'}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill={product.isWishlisted ? 'currentColor' : 'none'}
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
            찜하기
          </button>
          <button
            type="button"
            onClick={() => onAddToCart?.(product.id)}
            className={`btn btn-sm ${
              product.isInCart ? 'btn-primary' : 'btn-outline btn-primary'
            }`}
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
            장바구니
          </button>
        </div>
      </div>
    </div>
  );
}
