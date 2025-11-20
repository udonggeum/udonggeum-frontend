import { useMemo } from 'react';

interface StoresLoadingSkeletonProps {
  /**
   * Number of skeleton cards to render
   * @default 8
   */
  count?: number;
}

/**
 * StoresLoadingSkeleton Component
 *
 * Provides loading placeholders that roughly match the StoreCard layout.
 * Keeps layout stable while store data is being fetched.
 */
export default function StoresLoadingSkeleton({
  count = 8,
}: StoresLoadingSkeletonProps) {
  const skeletonKeys = useMemo(
    () =>
      Array.from({ length: count }, () =>
        globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
      ),
    [count]
  );

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {skeletonKeys.map((key) => (
        <div
          key={key}
          className="card bg-[var(--color-primary)] shadow-xl"
          aria-label="매장 로딩 중"
        >
          <figure className="aspect-video overflow-hidden bg-[var(--color-secondary)]">
            <div className="skeleton h-full w-full" />
          </figure>
          <div className="card-body gap-4">
            <div className="space-y-3">
              <div className="skeleton h-6 w-3/4" />
              <div className="skeleton h-4 w-1/2" />
              <div className="skeleton h-4 w-full" />
            </div>
            <div className="flex gap-3">
              <div className="skeleton h-8 w-24" />
              <div className="skeleton h-8 w-28" />
            </div>
            <div className="skeleton h-9 w-28 self-end" />
          </div>
        </div>
      ))}
    </div>
  );
}
