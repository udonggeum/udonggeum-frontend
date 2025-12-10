/**
 * 자동 작성 키워드 상수
 * 카테고리/타입별 자동 글 생성 키워드
 */

import type { PostType } from '@/schemas/community';

export interface Keyword {
  id: string;
  label: string;
}

export interface KeywordGroup {
  icon: string;
  title: string;
  keywords: Keyword[];
}

/**
 * 게시글 타입별 키워드 그룹 매핑
 */
export const POST_TYPE_KEYWORD_GROUPS: Record<PostType, KeywordGroup[]> = {
  // 금 매입 (사장님용)
  buy_gold: [
    {
      icon: '💰',
      title: '매입 조건',
      keywords: [
        { id: 'high_price', label: '고가 매입' },
        { id: 'fair_price', label: '공정한 시세' },
        { id: 'fast_response', label: '신속 대응' },
        { id: 'immediate_payment', label: '즉시 현금화' },
      ],
    },
    {
      icon: '🏪',
      title: '매장 강점',
      keywords: [
        { id: 'professional', label: '전문성' },
        { id: 'trust', label: '신뢰도' },
        { id: 'long_experience', label: '오랜 경력' },
        { id: 'kind_service', label: '친절 대응' },
        { id: 'convenient', label: '편리한 위치' },
      ],
    },
  ],

  // 금 매수 (일반 사용자가 금 팔기)
  sell_gold: [
    {
      icon: '⚡',
      title: '거래 조건',
      keywords: [
        { id: 'urgent', label: '급매' },
        { id: 'negotiable', label: '가격 협의 가능' },
        { id: 'quick_deal', label: '빠른 거래' },
        { id: 'bulk_sale', label: '대량 판매' },
      ],
    },
    {
      icon: '📦',
      title: '제품 상태',
      keywords: [
        { id: 'new_condition', label: '새제품급' },
        { id: 'with_certificate', label: '증명서 있음' },
        { id: 'authentic', label: '정품 보증' },
        { id: 'no_damage', label: '무흠' },
      ],
    },
  ],

  // 상품 소식
  product_news: [
    {
      icon: '📰',
      title: '뉴스 주제',
      keywords: [
        { id: 'price_trend', label: '시세 동향' },
        { id: 'market_analysis', label: '시장 분석' },
        { id: 'investment_tip', label: '투자 팁' },
        { id: 'industry_news', label: '업계 소식' },
        { id: 'regulation', label: '제도 변경' },
        { id: 'global_market', label: '해외 시장' },
      ],
    },
  ],

  // 매장 소식
  store_news: [
    {
      icon: '⭐',
      title: '매장 소식 키워드',
      keywords: [
        { id: 'good_service', label: '친절한 서비스' },
        { id: 'satisfied', label: '만족스러운 거래' },
        { id: 'recommended', label: '추천합니다' },
        { id: 'fair_price', label: '합리적 가격' },
        { id: 'clean_store', label: '깔끔한 매장' },
        { id: 'professional', label: '전문적인 상담' },
        { id: 'fast_deal', label: '빠른 처리' },
      ],
    },
  ],

  // 기타
  other: [
    {
      icon: '💡',
      title: '기타 키워드',
      keywords: [
        { id: 'beginner', label: '초보자용' },
        { id: 'advanced', label: '고급 정보' },
        { id: 'how_to', label: '방법 안내' },
        { id: 'caution', label: '주의사항' },
        { id: 'comparison', label: '비교 분석' },
        { id: 'save_money', label: '절약 팁' },
      ],
    },
  ],

  // 질문
  question: [
    {
      icon: '❓',
      title: '질문 종류',
      keywords: [
        { id: 'urgent', label: '급해요' },
        { id: 'beginner', label: '초보 질문' },
        { id: 'price_inquiry', label: '시세 문의' },
        { id: 'store_recommend', label: '매장 추천' },
        { id: 'product_inquiry', label: '제품 문의' },
        { id: 'transaction_method', label: '거래 방법' },
      ],
    },
  ],

  // FAQ (백엔드 호환성을 위해 유지, 프론트에서는 사용 안함)
  faq: [],
};

/**
 * 특정 타입의 키워드 그룹 목록 가져오기
 */
export function getKeywordGroupsByType(type: PostType): KeywordGroup[] {
  return POST_TYPE_KEYWORD_GROUPS[type] || [];
}
