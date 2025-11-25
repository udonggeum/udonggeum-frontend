import { Button } from '@/components';

interface LoginRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

/**
 * LoginRequiredModal component
 * Shows login prompt for unauthenticated users
 *
 * Extracted from ProductDetailPage.tsx lines 355-395
 */
export function LoginRequiredModal({
  isOpen,
  onClose,
  onLogin,
}: LoginRequiredModalProps) {
  if (!isOpen) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box bg-[var(--color-secondary)] border border-[var(--color-text)]/10">
        <h3 className="text-lg font-bold text-[var(--color-text)]">로그인이 필요합니다</h3>
        <p className="py-3 text-sm text-[var(--color-text)]/70">
          장바구니 담기 기능을 이용하려면 먼저 로그인해 주세요.
        </p>
        <div className="modal-action flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            취소
          </Button>
          <Button onClick={onLogin}>로그인하기</Button>
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
