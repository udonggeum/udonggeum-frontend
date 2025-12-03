import { Link } from 'react-router-dom';
import {
  Navbar,
  Footer,
  ProductCard,
  LoadingSpinner,
  ErrorAlert,
} from '@/components';
import { useWishlist } from '@/hooks/queries';
import { transformProductsFromAPI } from '@/utils/apiAdapters';
import { NAVIGATION_ITEMS } from '@/constants/navigation';
import type { Product as APIProduct } from '@/schemas/products';
import type { Product as UIProduct } from '@/types';

/**
 * WishlistPage Component
 *
 * Displays user's wishlist items in a responsive grid.
 * Features:
 * - Empty state with call-to-action
 * - Remove from wishlist
 * - Add to cart
 * - Navigate to product detail
 */
export default function WishlistPage() {
  const {
    data: wishlistData,
    isLoading,
    error,
    refetch,
  } = useWishlist();

  const handleWishlist = (productId: string) => {
    // ProductCard handles the actual API call
    void productId;
  };

  const handleAddToCart = (productId: string) => {
    // TODO: Implement cart functionality
    void productId;
  };

  // Transform API products to UI format
  const products: UIProduct[] = wishlistData
    ? transformProductsFromAPI(
        wishlistData.wishlist_items
          .filter((item) => item.product)
          .map((item) => item.product as APIProduct)
      )
    : [];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar navigationItems={NAVIGATION_ITEMS} />

      <main className="flex-grow">
        <section className="container mx-auto px-4 py-10">
          {/* Page Header */}
          <div className="mb-8 pb-6 border-b-2 border-[var(--color-gold)]/20">
            <div className="space-y-2">
              <span className="badge badge-lg border-2 border-[var(--color-gold)] text-[var(--color-gold)] bg-[var(--color-gold)]/10 font-semibold">
                Wishlist
              </span>
              <h1 className="text-4xl font-bold text-[var(--color-text)]">찜한 상품</h1>
              <p className="text-base text-[var(--color-text)]/70">
                마음에 드는 상품을 찜하고 나중에 확인하세요
              </p>
            </div>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : error ? (
            /* Error State */
            <div className="flex flex-col items-center justify-center py-20">
              <ErrorAlert
                title="찜 목록을 불러올 수 없습니다"
                message={
                  error instanceof Error
                    ? error.message
                    : '알 수 없는 오류가 발생했습니다.'
                }
              />
              <button
                type="button"
                onClick={() => {
                  void refetch();
                }}
                className="btn btn-primary mt-6"
              >
                다시 시도
              </button>
            </div>
          ) : products.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[var(--color-gold)]/30 bg-gradient-to-br from-[var(--color-gold)]/5 to-transparent py-24 text-center animate-fade-in">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-20 w-20 text-[var(--color-gold)]/60 mb-6"
                fill="none"
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
              <h2 className="text-2xl font-bold text-[var(--color-text)] mb-3">찜한 상품이 없습니다</h2>
              <p className="text-base text-[var(--color-text)]/70 mb-8 max-w-md">
                마음에 드는 상품을 찜하고 언제든지 다시 확인하세요.
                <br />
                하트 아이콘을 클릭하여 찜 목록에 추가할 수 있습니다.
              </p>
              <Link to="/products" className="btn btn-lg bg-[var(--color-gold)] hover:bg-[var(--color-gold)]/80 text-[var(--color-primary)] border-[var(--color-gold)]">
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
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                상품 둘러보기
              </Link>
            </div>
          ) : (
            /* Products Grid */
            <>
              {/* Product Count */}
              <div className="mb-6 rounded-3xl border-2 border-[var(--color-gold)]/20 bg-gradient-to-r from-[var(--color-gold)]/5 to-transparent p-5">
                <p className="text-base text-[var(--color-text)]">
                  총 <span className="font-bold text-[var(--color-gold)] text-xl">{products.length}</span>개의 상품을
                  찜하셨습니다
                </p>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onWishlist={handleWishlist}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>

              {/* Continue Shopping */}
              <div className="mt-12 flex justify-center">
                <Link to="/products" className="btn btn-lg btn-outline border-2 border-[var(--color-gold)] text-[var(--color-gold)] hover:bg-[var(--color-gold)] hover:text-[var(--color-primary)]">
                  계속 쇼핑하기
                </Link>
              </div>
            </>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
