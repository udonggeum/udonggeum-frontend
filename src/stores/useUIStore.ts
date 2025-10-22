import { create } from 'zustand';

/**
 * Toast type
 */
export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

/**
 * Modal type
 */
export interface Modal {
  id: string;
  isOpen: boolean;
}

/**
 * Theme type
 */
export type Theme = 'light' | 'dark';

/**
 * UI store state
 */
interface UIState {
  theme: Theme;
  modals: Record<string, boolean>;
  toasts: Toast[];
}

/**
 * UI store actions
 */
interface UIActions {
  // Theme actions
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;

  // Modal actions
  openModal: (id: string) => void;
  closeModal: (id: string) => void;
  toggleModal: (id: string) => void;
  closeAllModals: () => void;

  // Toast actions
  showToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

/**
 * UI store type
 */
type UIStore = UIState & UIActions;

/**
 * UI store
 *
 * Manages global UI state (no persistence)
 * - Theme: light/dark mode
 * - Modals: global modal state by ID
 * - Toasts: notification system
 *
 * @example
 * // Theme
 * const { theme, toggleTheme } = useUIStore();
 *
 * // Modals
 * const { openModal, closeModal } = useUIStore();
 * openModal('confirm-dialog');
 * closeModal('confirm-dialog');
 *
 * // Toasts
 * const { showToast } = useUIStore();
 * showToast({ message: '저장되었습니다', type: 'success', duration: 3000 });
 */
export const useUIStore = create<UIStore>((set) => ({
  // Initial state
  theme: 'light',
  modals: {},
  toasts: [],

  // Theme actions
  toggleTheme: () =>
    set((state) => ({
      theme: state.theme === 'light' ? 'dark' : 'light',
    })),

  setTheme: (theme) => set({ theme }),

  // Modal actions
  openModal: (id) =>
    set((state) => ({
      modals: { ...state.modals, [id]: true },
    })),

  closeModal: (id) =>
    set((state) => ({
      modals: { ...state.modals, [id]: false },
    })),

  toggleModal: (id) =>
    set((state) => ({
      modals: { ...state.modals, [id]: !state.modals[id] },
    })),

  closeAllModals: () => set({ modals: {} }),

  // Toast actions
  showToast: (toast) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        {
          ...toast,
          id: crypto.randomUUID(),
        },
      ],
    })),

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),

  clearToasts: () => set({ toasts: [] }),
}));
