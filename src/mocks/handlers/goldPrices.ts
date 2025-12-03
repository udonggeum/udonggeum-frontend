/**
 * MSW Handlers - Gold Prices API
 * Mock Service Worker handlers for gold prices endpoints
 */

import { http, HttpResponse } from 'msw';
import type { GoldPrice } from '@/schemas/goldPrice';

// Mock gold price data
const mockGoldPrices: GoldPrice[] = [
  {
    type: '24K',
    buy_price: 450000,
    sell_price: 452000,
    source: 'Korea Gold Exchange',
    source_date: new Date().toISOString(),
    description: '순금 99.99%',
    updated_at: new Date().toISOString(),
  },
  {
    type: '18K',
    buy_price: 337000,
    sell_price: 339000,
    source: 'Korea Gold Exchange',
    source_date: new Date().toISOString(),
    description: '18K 금 75%',
    updated_at: new Date().toISOString(),
  },
  {
    type: '14K',
    buy_price: 262000,
    sell_price: 264000,
    source: 'Korea Gold Exchange',
    source_date: new Date().toISOString(),
    description: '14K 금 58.5%',
    updated_at: new Date().toISOString(),
  },
  {
    type: 'Platinum',
    buy_price: 156000,
    sell_price: 158000,
    source: 'Korea Platinum Exchange',
    source_date: new Date().toISOString(),
    description: '백금 99.95%',
    updated_at: new Date().toISOString(),
  },
];

export const goldPricesHandlers = [
  // GET /api/v1/gold-prices/latest - Get latest prices for all types
  http.get('/api/v1/gold-prices/latest', () => {
    return HttpResponse.json({
      success: true,
      data: mockGoldPrices,
    });
  }),

  // GET /api/v1/gold-prices/type/:type - Get price by type
  http.get('/api/v1/gold-prices/type/:type', ({ params }) => {
    const { type } = params;
    const price = mockGoldPrices.find((p) => p.type === type);

    if (!price) {
      return HttpResponse.json(
        {
          error: 'Gold price not found',
          message: 'No price data available for the specified type',
        },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: price,
    });
  }),
];
