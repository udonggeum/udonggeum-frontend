import { useQuery } from '@tanstack/react-query';
import { goldPricesService } from '@/services/goldPrices';
import type { GoldPriceType } from '@/schemas/goldPrice';

/**
 * Gold Prices Query Keys
 *
 * Factory pattern for TanStack Query keys
 */
export const goldPricesKeys = {
  all: ['goldPrices'] as const,
  latest: () => [...goldPricesKeys.all, 'latest'] as const,
  byType: (type: GoldPriceType) => [...goldPricesKeys.all, 'type', type] as const,
};

/**
 * useLatestGoldPrices Hook
 *
 * Fetches latest prices for all gold types
 *
 * @example
 * const { data: prices, isLoading } = useLatestGoldPrices();
 */
export function useLatestGoldPrices() {
  return useQuery({
    queryKey: goldPricesKeys.latest(),
    queryFn: () => goldPricesService.getLatestPrices(),
    staleTime: 1000 * 60, // 1 minute (prices update frequently)
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * useGoldPriceByType Hook
 *
 * Fetches latest price for a specific gold type
 *
 * @param type - Gold price type (24K, 18K, 14K, Platinum)
 *
 * @example
 * const { data: price } = useGoldPriceByType('24K');
 */
export function useGoldPriceByType(type: GoldPriceType) {
  return useQuery({
    queryKey: goldPricesKeys.byType(type),
    queryFn: () => goldPricesService.getPriceByType(type),
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!type, // Only fetch if type is provided
  });
}
