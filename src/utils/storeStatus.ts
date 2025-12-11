/**
 * Store Status Utilities
 * Calculate store operating status based on open/close times
 */

export interface StoreStatusResult {
  statusLabel: string;
  statusClass: string;
  isOpen: boolean;
}

/**
 * Get store operating status
 * @param open - Opening time (HH:mm format)
 * @param close - Closing time (HH:mm format)
 * @returns Status label, CSS class, and isOpen flag
 */
export function getStoreStatus(
  open?: string | null,
  close?: string | null
): StoreStatusResult {
  if (!open || !close) {
    return {
      statusLabel: '운영시간 미설정',
      statusClass: 'bg-gray-100 text-gray-500',
      isOpen: false,
    };
  }

  const toMinutes = (t: string) => {
    const [h, m] = t.split(':').map((v) => Number(v));
    if (Number.isNaN(h) || Number.isNaN(m)) return null;
    return h * 60 + m;
  };

  const openM = toMinutes(open);
  const closeM = toMinutes(close);
  const now = new Date();
  const nowM = now.getHours() * 60 + now.getMinutes();

  if (openM === null || closeM === null) {
    return {
      statusLabel: '운영시간 미설정',
      statusClass: 'bg-gray-100 text-gray-500',
      isOpen: false,
    };
  }

  const isOvernight = openM > closeM;
  const isOpen = isOvernight
    ? nowM >= openM || nowM < closeM
    : nowM >= openM && nowM < closeM;

  return isOpen
    ? {
        statusLabel: '영업중',
        statusClass: 'bg-green-100 text-green-700',
        isOpen: true,
      }
    : {
        statusLabel: '영업종료',
        statusClass: 'bg-gray-200 text-gray-700',
        isOpen: false,
      };
}

/**
 * Get store specialty tags based on buying flags
 * @param store - Store detail object
 * @returns Array of specialty tags
 */
export function getStoreSpecialties(store: {
  buying_gold?: boolean;
  buying_platinum?: boolean;
  buying_silver?: boolean;
  tags?: string[];
}): string[] {
  // If tags are provided, use them
  if (store.tags && store.tags.length > 0) {
    return store.tags;
  }

  // Otherwise, generate from buying flags (legacy support)
  const specialties: string[] = [];

  if (store.buying_gold) {
    specialties.push('금 매입');
  }
  if (store.buying_platinum) {
    specialties.push('백금 매입');
  }
  if (store.buying_silver) {
    specialties.push('은 매입');
  }

  return specialties;
}
