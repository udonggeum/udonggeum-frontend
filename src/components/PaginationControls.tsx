interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/**
 * PaginationControls Component
 *
 * Renders simple pagination with previous/next and numbered buttons.
 */
export default function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationControlsProps) {
  if (totalPages <= 1) {
    return null;
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const pages = getPaginationRange(currentPage, totalPages);

  return (
    <nav className="join flex justify-center" aria-label="페이지네이션">
      <button
        type="button"
        className="btn join-item"
        onClick={() => handlePageChange(currentPage - 1)}
        aria-label="이전 페이지"
        disabled={currentPage <= 1}
      >
        &lt;
      </button>

      {pages.map((page) =>
        typeof page === 'number' ? (
          <button
            key={page}
            type="button"
            className={`btn join-item ${page === currentPage ? 'btn-primary' : ''}`}
            onClick={() => handlePageChange(page)}
            aria-current={page === currentPage}
          >
            {page}
          </button>
        ) : (
          <span key={page} className="btn join-item btn-disabled">
            …
          </span>
        )
      )}

      <button
        type="button"
        className="btn join-item"
        onClick={() => handlePageChange(currentPage + 1)}
        aria-label="다음 페이지"
        disabled={currentPage >= totalPages}
      >
        &gt;
      </button>
    </nav>
  );
}

/**
 * Helper to build pagination range with ellipsis for large page sets.
 */
function getPaginationRange(currentPage: number, totalPages: number): Array<number | string> {
  const delta = 2;
  const range: number[] = [];
  const rangeWithDots: Array<number | string> = [];
  let lastNumber: number | undefined;

  for (let i = Math.max(1, currentPage - delta); i <= Math.min(totalPages, currentPage + delta); i += 1) {
    range.push(i);
  }

  if (range[0] > 1) {
    range.unshift(1);
  }
  if (range[range.length - 1] < totalPages) {
    range.push(totalPages);
  }

  for (const page of range) {
    if (lastNumber !== undefined) {
      if (page - lastNumber === 2) {
        rangeWithDots.push(lastNumber + 1);
      } else if (page - lastNumber > 2) {
        rangeWithDots.push(`ellipsis-${lastNumber}-${page}`);
      }
    }
    rangeWithDots.push(page);
    lastNumber = page;
  }

  return rangeWithDots;
}
