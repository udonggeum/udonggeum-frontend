import { z } from 'zod';

/**
 * Gold Price Schemas
 *
 * Zod schemas for gold price data validation and TypeScript type generation
 */

// Gold price type enum
export const GoldPriceTypeSchema = z.enum(['24K', '18K', '14K', 'Platinum']);
export type GoldPriceType = z.infer<typeof GoldPriceTypeSchema>;

// Single gold price schema
export const GoldPriceSchema = z.object({
  type: GoldPriceTypeSchema,
  buy_price: z.number().positive('매입가는 양수여야 합니다'),
  sell_price: z.number().positive('매도가는 양수여야 합니다'),
  source: z.string().optional(),
  source_date: z.string().optional(),
  description: z.string().optional(),
  updated_at: z.string(),
});

export type GoldPrice = z.infer<typeof GoldPriceSchema>;

// Latest prices response (from GET /api/v1/gold-prices/latest)
export const LatestGoldPricesResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(GoldPriceSchema),
});

export type LatestGoldPricesResponse = z.infer<typeof LatestGoldPricesResponseSchema>;

// Single price response (from GET /api/v1/gold-prices/type/:type)
export const GoldPriceByTypeResponseSchema = z.object({
  success: z.boolean(),
  data: GoldPriceSchema,
});

export type GoldPriceByTypeResponse = z.infer<typeof GoldPriceByTypeResponseSchema>;

// Extended gold price with calculated fields for UI
export interface GoldPriceWithCalculations extends GoldPrice {
  // 변동률 (전일 대비 %) - 백엔드 추가 예정
  change_percent?: number;
  // 변동 금액 (전일 대비) - 백엔드 추가 예정
  change_amount?: number;
  // 1돈 기준 가격 (1돈 = 3.75g)
  price_per_don: number;
  // 순도 (%)
  purity: string;
  // 배지 색상
  badge_bg: string;
  badge_text: string;
}
