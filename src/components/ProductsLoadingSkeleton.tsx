/**
 * ProductsLoadingSkeleton Component
 *
 * Displays skeleton loading placeholders while products are being fetched.
 * Matches the ProductCard layout for smooth visual transition.
 */

interface ProductsLoadingSkeletonProps {
  /**
   * Number of skeleton cards to display
   * @default 8
   */
  count?: number;
}

export default function ProductsLoadingSkeleton({
  count = 8,
}: ProductsLoadingSkeletonProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`skeleton-${index}`}
          className="card bg-base-100 shadow-xl"
          aria-label="상품 로딩 중"
        >
          {/* Image skeleton */}
          <figure className="aspect-square overflow-hidden bg-base-200">
            <div className="skeleton w-full h-full" />
          </figure>

          <div className="card-body">
            {/* Product name skeleton */}
            <div className="skeleton h-6 w-3/4 mb-2" />

            {/* Price skeleton */}
            <div className="skeleton h-8 w-1/2 mb-2" />

            {/* Store name skeleton */}
            <div className="skeleton h-4 w-1/3 mb-4" />

            {/* Action buttons skeleton */}
            <div className="card-actions justify-end mt-4">
              <div className="skeleton h-9 w-24" />
              <div className="skeleton h-9 w-28" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
