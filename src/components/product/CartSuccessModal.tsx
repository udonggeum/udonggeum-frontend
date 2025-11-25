import { Button } from '@/components';

interface CartSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToCart: () => void;
}

/**
 * CartSuccessModal component
 * Shows success message after adding to cart
 *
 * Extracted from ProductDetailPage.tsx lines 397-437
 */
export function CartSuccessModal({
  isOpen,
  onClose,
  onGoToCart,
}: CartSuccessModalProps) {
  if (!isOpen) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box bg-[var(--color-secondary)] border border-[var(--color-text)]/10">
        <h3 className="text-lg font-bold text-[var(--color-text)]">장바구니에 담았습니다</h3>
        <p className="py-3 text-sm text-[var(--color-text)]/70">
          계속 쇼핑하시겠어요, 아니면 장바구니를 확인하시겠어요?
        </p>
        <div className="modal-action flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            더 둘러보기
          </Button>
          <Button onClick={onGoToCart}>장바구니로 이동</Button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="button" aria-label="모달 닫기" onClick={onClose}>
          닫기
        </button>
      </form>
    </dialog>
  );
}
