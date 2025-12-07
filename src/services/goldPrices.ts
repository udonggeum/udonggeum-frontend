import { apiClient } from '@/api/client';
import {
  LatestGoldPricesResponseSchema,
  GoldPriceByTypeResponseSchema,
  GoldPriceHistoryResponseSchema,
  type GoldPrice,
  type GoldPriceType,
  type GoldPriceHistoryItem,
} from '@/schemas/goldPrice';

/**
 * Gold Prices Service
 *
 * API calls for gold price data
 */

class GoldPricesService {
  private readonly baseURL = '/api/v1/gold-prices';

  /**
   * Get latest prices for all gold types
   * GET /api/v1/gold-prices/latest
   */
  async getLatestPrices(): Promise<GoldPrice[]> {
    const response = await apiClient.get(`${this.baseURL}/latest`);
    const validated = LatestGoldPricesResponseSchema.parse(response.data);
    return validated.data;
  }

  /**
   * Get latest price for a specific gold type
   * GET /api/v1/gold-prices/type/:type
   */
  async getPriceByType(type: GoldPriceType): Promise<GoldPrice> {
    const response = await apiClient.get(`${this.baseURL}/type/${type}`);
    const validated = GoldPriceByTypeResponseSchema.parse(response.data);
    return validated.data;
  }

  /**
   * Get price history for a specific gold type
   * GET /api/v1/gold-prices/history/:type?period={기간}
   */
  async getPriceHistory(
    type: GoldPriceType,
    period: '1주' | '1개월' | '3개월' | '1년' | '전체' = '1개월'
  ): Promise<GoldPriceHistoryItem[]> {
    const response = await apiClient.get(`${this.baseURL}/history/${type}`, {
      params: { period },
    });
    const validated = GoldPriceHistoryResponseSchema.parse(response.data);
    return validated.data;
  }
}

export const goldPricesService = new GoldPricesService();
