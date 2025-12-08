/**
 * MSW Handlers - Community API
 * Mock Service Worker handlers for community endpoints (금광산)
 */

import { http, HttpResponse } from 'msw';
import type {
  CommunityPost,
  CommunityComment,
  PostListQuery,
  PostListResponse,
  PostDetailResponse,
  CreatePostRequest,
  UpdatePostRequest,
  CreateCommentRequest,
  UpdateCommentRequest,
  PostCategory,
  PostType,
} from '@/schemas/community';

// ==================== Mock Data ====================

// Mock users
const mockUsers = [
  { id: 1, email: 'user1@example.com', name: '김철수', role: 'user' as const },
  { id: 2, email: 'user2@example.com', name: '이영희', role: 'user' as const },
  { id: 3, email: 'admin@example.com', name: '관리자', role: 'admin' as const },
  { id: 4, email: 'user3@example.com', name: '박민수', role: 'user' as const },
  { id: 5, email: 'user4@example.com', name: '정수진', role: 'user' as const },
];

// Mock stores
const mockStores = [
  {
    id: 1,
    name: '강남 금은방',
    region: '서울',
    district: '강남구',
    address: '서울 강남구 테헤란로 123',
  },
  {
    id: 2,
    name: '서초 보석상',
    region: '서울',
    district: '서초구',
    address: '서울 서초구 서초대로 456',
  },
];

// Mock posts
let mockPosts: CommunityPost[] = [
  // Gold Trade - Sell Gold
  {
    id: 1,
    created_at: '2025-01-08T10:00:00Z',
    updated_at: '2025-01-08T10:00:00Z',
    title: '24K 금목걸이 판매합니다',
    content:
      '할머니께서 물려주신 24K 금목걸이입니다.\n중량: 18.75g\n가격: 협의 가능\n직거래 선호합니다.',
    category: 'gold_trade',
    type: 'sell_gold',
    status: 'active',
    user_id: 1,
    user: mockUsers[0],
    gold_type: '24K',
    weight: 18.75,
    price: 1850000,
    location: '서울 강남구',
    store_id: null,
    store: null,
    is_answered: false,
    accepted_answer_id: null,
    view_count: 245,
    like_count: 12,
    comment_count: 5,
    image_urls: [],
  },
  {
    id: 2,
    created_at: '2025-01-07T14:30:00Z',
    updated_at: '2025-01-07T14:30:00Z',
    title: '18K 금반지 급매',
    content: '이사 가면서 급하게 처분합니다.\n18K 금반지 두 개\n상태 매우 좋습니다.',
    category: 'gold_trade',
    type: 'sell_gold',
    status: 'active',
    user_id: 2,
    user: mockUsers[1],
    gold_type: '18K',
    weight: 12.5,
    price: 780000,
    location: '경기 성남시',
    store_id: null,
    store: null,
    is_answered: false,
    accepted_answer_id: null,
    view_count: 156,
    like_count: 8,
    comment_count: 3,
    image_urls: [],
  },

  // Gold Trade - Buy Gold (Admin only)
  {
    id: 3,
    created_at: '2025-01-08T09:00:00Z',
    updated_at: '2025-01-08T09:00:00Z',
    title: '강남 금은방 - 금 고가 매입 중!',
    content:
      '강남 금은방에서 금을 고가에 매입합니다!\n\n✨ 매입 가격\n- 24K: g당 98,000원\n- 18K: g당 73,500원\n- 14K: g당 57,200원\n\n📍 위치: 서울 강남구 테헤란로 123\n📞 문의: 02-1234-5678',
    category: 'gold_trade',
    type: 'buy_gold',
    status: 'active',
    user_id: 3,
    user: mockUsers[2],
    gold_type: null,
    weight: null,
    price: null,
    location: '서울 강남구',
    store_id: 1,
    store: mockStores[0],
    is_answered: false,
    accepted_answer_id: null,
    view_count: 423,
    like_count: 28,
    comment_count: 12,
    image_urls: [],
  },

  // Store Product Promotion with Image
  {
    id: 15,
    created_at: '2025-01-09T10:30:00Z',
    updated_at: '2025-01-09T10:30:00Z',
    title: '🎁 새해 특가! 18K 금목걸이 30% 할인 이벤트',
    content:
      '강남 금은방 신년 특별 이벤트를 진행합니다! 💝\n\n🎯 이벤트 상품\n- 18K 금목걸이 (15g)\n- 정상가: 1,200,000원\n- 할인가: 840,000원 (30% 할인)\n\n✨ 제품 특징\n• 순도 보증 18K (각인 확인 가능)\n• 세련된 디자인으로 일상/특별한 날 모두 착용 가능\n• 무료 각인 서비스 제공\n• 평생 A/S 보증\n\n📅 이벤트 기간: 2025년 1월 9일 ~ 1월 31일\n📍 매장 방문 시 즉시 구매 가능\n💳 카드 무이자 할부 가능 (2~6개월)\n\n🎁 선착순 10분께 금 세척 서비스 무료 제공!\n\n자세한 문의는 매장으로 연락주세요 😊\n📞 02-1234-5678',
    category: 'gold_news',
    type: 'news',
    status: 'active',
    user_id: 3,
    user: mockUsers[2],
    gold_type: '18K',
    weight: 15,
    price: 840000,
    location: '서울 강남구',
    store_id: 1,
    store: mockStores[0],
    is_answered: false,
    accepted_answer_id: null,
    view_count: 156,
    like_count: 34,
    comment_count: 8,
    image_urls: [
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&auto=format&fit=crop&q=80',
    ],
  },

  // Gold News - News
  {
    id: 4,
    created_at: '2025-01-08T08:00:00Z',
    updated_at: '2025-01-08T08:00:00Z',
    title: '금값 급등! 온스당 2,400달러 돌파',
    content:
      '국제 금 시세가 온스당 2,400달러를 돌파하며 사상 최고치를 경신했습니다.\n\n전문가들은 미국 달러 약세와 지정학적 리스크 증가로 인해 금값 상승세가 당분간 지속될 것으로 전망하고 있습니다.\n\n투자자들은 안전자산인 금에 대한 관심을 높이고 있으며, 국내 금값도 함께 상승 중입니다.',
    category: 'gold_news',
    type: 'news',
    status: 'active',
    user_id: 3,
    user: mockUsers[2],
    gold_type: null,
    weight: null,
    price: null,
    location: null,
    store_id: null,
    store: null,
    is_answered: false,
    accepted_answer_id: null,
    view_count: 892,
    like_count: 45,
    comment_count: 18,
    image_urls: [],
  },

  // Gold News - Review
  {
    id: 5,
    created_at: '2025-01-07T16:20:00Z',
    updated_at: '2025-01-07T16:20:00Z',
    title: '강남 금은방 후기 - 친절하고 가격도 좋아요',
    content:
      '어제 강남 금은방에서 금목걸이를 팔았습니다.\n\n처음에는 걱정했는데 사장님이 정말 친절하시고, 시세보다 높은 가격에 매입해주셨어요.\n무게도 정확하게 재주시고 설명도 자세히 해주셨습니다.\n\n금 거래하실 분들께 추천드립니다! ⭐⭐⭐⭐⭐',
    category: 'gold_news',
    type: 'review',
    status: 'active',
    user_id: 1,
    user: mockUsers[0],
    gold_type: null,
    weight: null,
    price: null,
    location: null,
    store_id: null,
    store: null,
    is_answered: false,
    accepted_answer_id: null,
    view_count: 234,
    like_count: 19,
    comment_count: 7,
    image_urls: [],
  },

  // Gold News - Tip
  {
    id: 6,
    created_at: '2025-01-06T11:15:00Z',
    updated_at: '2025-01-06T11:15:00Z',
    title: '금 투자 초보자를 위한 팁 5가지',
    content:
      '금 투자를 처음 시작하시는 분들을 위해 유용한 팁을 공유합니다.\n\n1. 순도 확인하기\n   - 24K, 18K, 14K 등 순도를 꼭 확인하세요\n   - 순도에 따라 가격이 크게 달라집니다\n\n2. 시세 파악하기\n   - 국제 금 시세를 주기적으로 확인하세요\n   - 우동금 앱에서 실시간 시세를 볼 수 있습니다\n\n3. 신뢰할 수 있는 매장 찾기\n   - 평판이 좋은 금은방을 이용하세요\n   - 후기를 꼭 확인하세요\n\n4. 무게 확인하기\n   - 거래 시 무게를 정확히 재는지 확인하세요\n   - 가능하면 본인이 직접 확인하세요\n\n5. 장기 투자 관점으로\n   - 금은 단기보다는 장기 투자에 적합합니다\n   - 분산 투자를 고려하세요',
    category: 'gold_news',
    type: 'tip',
    status: 'active',
    user_id: 4,
    user: mockUsers[3],
    gold_type: null,
    weight: null,
    price: null,
    location: null,
    store_id: null,
    store: null,
    is_answered: false,
    accepted_answer_id: null,
    view_count: 567,
    like_count: 34,
    comment_count: 15,
    image_urls: [],
  },

  // QnA - Question
  {
    id: 7,
    created_at: '2025-01-08T13:45:00Z',
    updated_at: '2025-01-08T13:45:00Z',
    title: '금 시세는 어디서 확인하나요?',
    content:
      '금 투자를 시작하려고 하는데 실시간 금 시세를 어디서 확인할 수 있나요?\n믿을만한 사이트나 앱이 있으면 추천 부탁드립니다.',
    category: 'qna',
    type: 'question',
    status: 'active',
    user_id: 5,
    user: mockUsers[4],
    gold_type: null,
    weight: null,
    price: null,
    location: null,
    store_id: null,
    store: null,
    is_answered: true,
    accepted_answer_id: 1,
    view_count: 123,
    like_count: 6,
    comment_count: 4,
    image_urls: [],
  },

  // QnA - FAQ (Admin only)
  {
    id: 8,
    created_at: '2025-01-05T10:00:00Z',
    updated_at: '2025-01-05T10:00:00Z',
    title: '[FAQ] 금 순도별 차이점은 무엇인가요?',
    content:
      'Q: 24K, 18K, 14K의 차이가 무엇인가요?\n\nA: 금의 순도를 나타내는 단위입니다.\n\n📌 24K (99.9% 순금)\n- 가장 순수한 금\n- 부드럽고 변색이 없음\n- 가격이 가장 비쌈\n- 투자용으로 적합\n\n📌 18K (75% 금 + 25% 합금)\n- 단단하고 내구성이 좋음\n- 색상이 다양함 (화이트골드, 핑크골드 등)\n- 주얼리로 많이 사용\n\n📌 14K (58.5% 금 + 41.5% 합금)\n- 가장 단단함\n- 가격이 저렴\n- 일상용 액세서리로 적합\n\n순도가 높을수록 가격이 비싸지만, 용도에 따라 적절한 순도를 선택하는 것이 중요합니다.',
    category: 'qna',
    type: 'faq',
    status: 'active',
    user_id: 3,
    user: mockUsers[2],
    gold_type: null,
    weight: null,
    price: null,
    location: null,
    store_id: null,
    store: null,
    is_answered: false,
    accepted_answer_id: null,
    view_count: 1245,
    like_count: 67,
    comment_count: 23,
    image_urls: [],
  },

  // Gold Trade - FAQ
  {
    id: 9,
    created_at: '2025-01-04T10:00:00Z',
    updated_at: '2025-01-04T10:00:00Z',
    title: '[FAQ] 금 거래 시 주의할 점은 무엇인가요?',
    content:
      'Q: 개인 간 금 거래 시 주의할 점은 무엇인가요?\n\nA: 안전한 거래를 위해 다음 사항을 확인하세요.\n\n✅ 거래 전 확인사항\n1. 순도 확인\n   - 각인(스탬프) 확인\n   - 가능하면 전문가에게 감정 의뢰\n\n2. 정확한 무게 측정\n   - 정밀 저울 사용\n   - 양쪽이 함께 확인\n\n3. 시세 확인\n   - 국제 금 시세 확인\n   - 여러 금은방 시세 비교\n\n4. 안전한 거래 장소\n   - 공공장소에서 거래\n   - 가능하면 금은방에서 거래\n\n⚠️ 주의사항\n- 너무 저렴한 가격 제안 주의\n- 선입금 요구 거절\n- 거래 내역 문서화\n- 의심스러운 경우 거래 중단',
    category: 'gold_trade',
    type: 'faq',
    status: 'active',
    user_id: 3,
    user: mockUsers[2],
    gold_type: null,
    weight: null,
    price: null,
    location: null,
    store_id: null,
    store: null,
    is_answered: false,
    accepted_answer_id: null,
    view_count: 892,
    like_count: 54,
    comment_count: 15,
    image_urls: [],
  },
  {
    id: 10,
    created_at: '2025-01-03T15:00:00Z',
    updated_at: '2025-01-03T15:00:00Z',
    title: '[FAQ] 금 시세는 어떻게 결정되나요?',
    content:
      'Q: 금 시세는 어떻게 결정되나요?\n\nA: 금 시세는 여러 요인에 의해 결정됩니다.\n\n📊 주요 결정 요인\n\n1. 국제 금 시세\n   - 런던 금 시장 기준\n   - 온스(oz) 단위로 거래\n   - 달러 가격 영향\n\n2. 환율\n   - 달러/원 환율\n   - 환율 상승 시 금 가격 상승\n\n3. 수요와 공급\n   - 투자 수요\n   - 장신구 수요\n   - 산업 수요\n\n4. 경제 상황\n   - 불확실성 증가 시 금 선호\n   - 인플레이션 헤지 수단\n\n💡 시세 확인 방법\n- 우동금 앱에서 실시간 확인\n- 한국금거래소 공식 시세\n- 주요 금은방 시세 비교',
    category: 'gold_trade',
    type: 'faq',
    status: 'active',
    user_id: 3,
    user: mockUsers[2],
    gold_type: null,
    weight: null,
    price: null,
    location: null,
    store_id: null,
    store: null,
    is_answered: false,
    accepted_answer_id: null,
    view_count: 1123,
    like_count: 67,
    comment_count: 19,
    image_urls: [],
  },
  {
    id: 11,
    created_at: '2025-01-02T11:00:00Z',
    updated_at: '2025-01-02T11:00:00Z',
    title: '[FAQ] 금 판매 시 세금은 어떻게 되나요?',
    content:
      'Q: 개인이 금을 판매할 때 세금을 내야 하나요?\n\nA: 상황에 따라 다릅니다.\n\n📋 과세 기준\n\n1. 양도소득세\n   - 금괴, 골드바 등 투자용 금\n   - 보유기간 5년 미만 시 과세\n   - 250만원 기본 공제\n\n2. 비과세 대상\n   - 장신구용 금 (목걸이, 반지 등)\n   - 생활용품으로 인정\n   - 판매 시 세금 없음\n\n3. 부가가치세\n   - 사업자가 아닌 개인은 해당 없음\n   - 금은방 매입 시 부가세 별도\n\n💰 세금 계산 예시\n- 투자용 금괴 1000만원 매입\n- 2년 후 1500만원에 판매\n- 차익: 500만원\n- 과세표준: 500만원 - 250만원 = 250만원\n- 양도소득세: 250만원 × 20% = 50만원\n\n📌 자세한 사항은 세무사 상담을 권장합니다.',
    category: 'gold_trade',
    type: 'faq',
    status: 'active',
    user_id: 3,
    user: mockUsers[2],
    gold_type: null,
    weight: null,
    price: null,
    location: null,
    store_id: null,
    store: null,
    is_answered: false,
    accepted_answer_id: null,
    view_count: 1567,
    like_count: 89,
    comment_count: 32,
    image_urls: [],
  },

  // Gold News - FAQ
  {
    id: 12,
    created_at: '2025-01-01T09:00:00Z',
    updated_at: '2025-01-01T09:00:00Z',
    title: '[FAQ] 금 투자 방법에는 어떤 것들이 있나요?',
    content:
      'Q: 금에 투자하는 방법에는 어떤 것들이 있나요?\n\nA: 다양한 금 투자 방법이 있습니다.\n\n💰 주요 투자 방법\n\n1. 실물 금 투자\n   - 금괴, 골드바\n   - 장점: 직접 보유, 실물 자산\n   - 단점: 보관 문제, 매매 수수료\n\n2. 금 통장\n   - 은행에서 제공\n   - 장점: 소액 투자 가능, 보관 편리\n   - 단점: 수수료, 실물 인출 제한\n\n3. 금 ETF\n   - 주식처럼 거래\n   - 장점: 거래 편리, 소액 투자\n   - 단점: 운용 수수료\n\n4. 금 펀드\n   - 간접 투자 상품\n   - 장점: 전문가 운용\n   - 단점: 수수료, 환매 제한\n\n5. 금 선물/옵션\n   - 파생상품\n   - 장점: 레버리지 가능\n   - 단점: 고위험, 전문 지식 필요\n\n✅ 초보자 추천: 금 통장 또는 금 ETF',
    category: 'gold_news',
    type: 'faq',
    status: 'active',
    user_id: 3,
    user: mockUsers[2],
    gold_type: null,
    weight: null,
    price: null,
    location: null,
    store_id: null,
    store: null,
    is_answered: false,
    accepted_answer_id: null,
    view_count: 2134,
    like_count: 112,
    comment_count: 45,
    image_urls: [],
  },
  {
    id: 13,
    created_at: '2024-12-30T14:00:00Z',
    updated_at: '2024-12-30T14:00:00Z',
    title: '[FAQ] 금 보관은 어떻게 하는 게 좋나요?',
    content:
      'Q: 집에서 금을 안전하게 보관하는 방법은?\n\nA: 금액에 따라 적절한 보관 방법을 선택하세요.\n\n🔒 보관 방법\n\n1. 소액 (500만원 이하)\n   - 집 안 금고\n   - 숨김 장소 활용\n   - 주의: 도난 위험\n\n2. 중액 (500만원~3000만원)\n   - 은행 안전금고 대여\n   - 비용: 연 3~10만원\n   - 장점: 안전, 보험 적용\n\n3. 고액 (3000만원 이상)\n   - 은행 금 보관 서비스\n   - 전문 보관 업체 이용\n   - 보험 가입 필수\n\n💡 보관 시 주의사항\n- 습기 방지\n- 공기 접촉 최소화\n- 다른 금속과 분리 보관\n- 정기적 상태 확인\n- 보관 장소 분산\n\n📋 필수 서류 보관\n- 구매 영수증\n- 감정서\n- 증명서류',
    category: 'gold_news',
    type: 'faq',
    status: 'active',
    user_id: 3,
    user: mockUsers[2],
    gold_type: null,
    weight: null,
    price: null,
    location: null,
    store_id: null,
    store: null,
    is_answered: false,
    accepted_answer_id: null,
    view_count: 987,
    like_count: 63,
    comment_count: 21,
    image_urls: [],
  },
  {
    id: 14,
    created_at: '2024-12-29T10:30:00Z',
    updated_at: '2024-12-29T10:30:00Z',
    title: '[FAQ] 금 진위 여부는 어떻게 확인하나요?',
    content:
      'Q: 가짜 금과 진짜 금을 구별하는 방법은?\n\nA: 여러 가지 확인 방법이 있습니다.\n\n🔍 간단한 확인 방법\n\n1. 각인 확인\n   - 24K, 18K, 14K 표시\n   - 제조사 마크\n   - 주의: 가짜도 각인 있을 수 있음\n\n2. 자석 테스트\n   - 순금은 자석에 붙지 않음\n   - 붙으면 가짜 의심\n\n3. 무게감\n   - 금은 무거운 금속\n   - 크기 대비 가벼우면 의심\n\n4. 색상 확인\n   - 24K: 진한 노란색\n   - 18K: 약간 연한 노란색\n   - 변색 여부 확인\n\n🏪 전문적인 확인\n\n1. 금은방 감정\n   - 비파괴 검사기 사용\n   - 즉시 결과 확인\n\n2. 한국금거래소\n   - 공식 감정 서비스\n   - 감정서 발급\n\n3. 귀금속 검사기관\n   - 정밀 분석\n   - 순도 정확히 측정\n\n⚠️ 의심스러우면 반드시 전문가에게 확인!',
    category: 'gold_news',
    type: 'faq',
    status: 'active',
    user_id: 3,
    user: mockUsers[2],
    gold_type: null,
    weight: null,
    price: null,
    location: null,
    store_id: null,
    store: null,
    is_answered: false,
    accepted_answer_id: null,
    view_count: 1456,
    like_count: 78,
    comment_count: 28,
    image_urls: [],
  },
];

// Mock comments
let mockComments: CommunityComment[] = [
  // Comments for post 7 (QnA with accepted answer)
  {
    id: 1,
    created_at: '2025-01-08T14:00:00Z',
    updated_at: '2025-01-08T14:00:00Z',
    content:
      '우동금 앱을 사용하시면 실시간으로 국제 금 시세와 국내 금 시세를 확인할 수 있습니다.\n메인 화면에서 "금시세" 메뉴를 클릭하시면 됩니다!',
    user_id: 3,
    user: mockUsers[2],
    post_id: 7,
    parent_id: null,
    is_answer: true,
    is_accepted: true,
    like_count: 8,
    replies: [],
  },
  {
    id: 2,
    created_at: '2025-01-08T14:15:00Z',
    updated_at: '2025-01-08T14:15:00Z',
    content: '한국금거래소 홈페이지도 좋아요. 시세가 정확합니다.',
    user_id: 1,
    user: mockUsers[0],
    post_id: 7,
    parent_id: null,
    is_answer: true,
    is_accepted: false,
    like_count: 3,
    replies: [
      {
        id: 3,
        created_at: '2025-01-08T14:30:00Z',
        updated_at: '2025-01-08T14:30:00Z',
        content: '감사합니다! 참고하겠습니다.',
        user_id: 5,
        user: mockUsers[4],
        post_id: 7,
        parent_id: 2,
        is_answer: false,
        is_accepted: false,
        like_count: 1,
        replies: [],
      },
    ],
  },

  // Comments for post 1 (Gold Trade - Sell)
  {
    id: 4,
    created_at: '2025-01-08T11:00:00Z',
    updated_at: '2025-01-08T11:00:00Z',
    content: '가격은 얼마 정도 생각하시나요?',
    user_id: 2,
    user: mockUsers[1],
    post_id: 1,
    parent_id: null,
    is_answer: false,
    is_accepted: false,
    like_count: 2,
    replies: [
      {
        id: 5,
        created_at: '2025-01-08T11:30:00Z',
        updated_at: '2025-01-08T11:30:00Z',
        content: '시세대로 받으려고 합니다. 쪽지 주시면 상세히 말씀드릴게요!',
        user_id: 1,
        user: mockUsers[0],
        post_id: 1,
        parent_id: 4,
        is_answer: false,
        is_accepted: false,
        like_count: 1,
        replies: [],
      },
    ],
  },
  {
    id: 6,
    created_at: '2025-01-08T12:00:00Z',
    updated_at: '2025-01-08T12:00:00Z',
    content: '상태가 정말 좋아보이네요!',
    user_id: 4,
    user: mockUsers[3],
    post_id: 1,
    parent_id: null,
    is_answer: false,
    is_accepted: false,
    like_count: 0,
    replies: [],
  },

  // Comments for post 3 (Buy Gold - Admin)
  {
    id: 7,
    created_at: '2025-01-08T10:00:00Z',
    updated_at: '2025-01-08T10:00:00Z',
    content: '14K도 매입하시나요?',
    user_id: 1,
    user: mockUsers[0],
    post_id: 3,
    parent_id: null,
    is_answer: false,
    is_accepted: false,
    like_count: 1,
    replies: [
      {
        id: 8,
        created_at: '2025-01-08T10:30:00Z',
        updated_at: '2025-01-08T10:30:00Z',
        content: '네, 14K도 매입합니다! 전화 주시면 자세히 안내드리겠습니다.',
        user_id: 3,
        user: mockUsers[2],
        post_id: 3,
        parent_id: 7,
        is_answer: false,
        is_accepted: false,
        like_count: 2,
        replies: [],
      },
    ],
  },
];

// Track likes (in-memory, will reset on server restart)
const likedPosts = new Set<number>();
const likedComments = new Set<number>();

// ID counters
let nextPostId = 16;
let nextCommentId = 9;

// ==================== Helper Functions ====================

/**
 * Extract user from Authorization header
 * In real backend, this would validate JWT and extract user from token
 * For MSW, we'll decode the token and find the user
 */
function getUserFromRequest(request: Request): typeof mockUsers[number] | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  try {
    // Extract token
    const token = authHeader.substring(7);

    // Decode JWT payload (simple base64 decode without verification for MSW)
    // JWT format: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Decode payload (second part)
    const payload = JSON.parse(atob(parts[1]));
    const userId = payload.user_id || payload.sub;

    if (!userId) {
      return null;
    }

    // Find user in mockUsers
    const user = mockUsers.find(u => u.id === userId);
    return user || null;
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
}

function filterAndPaginatePosts(
  posts: CommunityPost[],
  params: URLSearchParams
): PostListResponse {
  let filtered = [...posts];

  // Filter by store_id
  const storeId = params.get('store_id');
  if (storeId) {
    const storeIdNum = parseInt(storeId, 10);
    filtered = filtered.filter((p) => p.store_id === storeIdNum);
  }

  // Filter by category
  const category = params.get('category') as PostCategory | null;
  if (category) {
    filtered = filtered.filter((p) => p.category === category);
  }

  // Filter by type
  const type = params.get('type') as PostType | null;
  if (type) {
    filtered = filtered.filter((p) => p.type === type);
  }

  // Filter by search
  const search = params.get('search');
  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(searchLower) ||
        p.content.toLowerCase().includes(searchLower)
    );
  }

  // Filter by is_answered (for QnA)
  const isAnswered = params.get('is_answered');
  if (isAnswered !== null) {
    filtered = filtered.filter((p) => p.is_answered === (isAnswered === 'true'));
  }

  // Sort
  const sortBy = params.get('sort_by') || 'created_at';
  const sortOrder = params.get('sort_order') || 'desc';

  filtered.sort((a, b) => {
    let aValue: any = a[sortBy as keyof CommunityPost];
    let bValue: any = b[sortBy as keyof CommunityPost];

    if (sortBy === 'created_at' || sortBy === 'updated_at') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    if (sortOrder === 'desc') {
      return bValue - aValue;
    }
    return aValue - bValue;
  });

  // Pagination
  const pageSize = parseInt(params.get('page_size') || '20', 10);
  const page = parseInt(params.get('page') || '1', 10);
  const offset = (page - 1) * pageSize;

  const paginated = filtered.slice(offset, offset + pageSize);

  return {
    data: paginated,
    total: filtered.length,
    page,
    page_size: pageSize,
  };
}

function findPostById(id: number): CommunityPost | undefined {
  return mockPosts.find((p) => p.id === id);
}

function findCommentById(id: number): CommunityComment | undefined {
  // Search in top-level comments and replies
  for (const comment of mockComments) {
    if (comment.id === id) return comment;
    if (comment.replies) {
      const found = comment.replies.find((r) => r.id === id);
      if (found) return found;
    }
  }
  return undefined;
}

function getCommentsForPost(postId: number): CommunityComment[] {
  return mockComments.filter((c) => c.post_id === postId && !c.parent_id);
}

function incrementPostViewCount(postId: number): void {
  const post = findPostById(postId);
  if (post) {
    post.view_count += 1;
  }
}

// ==================== Handlers ====================

export const communityHandlers = [
  // GET /api/v1/community/posts - List posts
  http.get('/api/v1/community/posts', ({ request }) => {
    const url = new URL(request.url);
    const response = filterAndPaginatePosts(mockPosts, url.searchParams);
    return HttpResponse.json(response);
  }),

  // GET /api/v1/community/posts/:id - Get post detail
  http.get('/api/v1/community/posts/:id', ({ params }) => {
    const postId = parseInt(params.id as string, 10);
    const post = findPostById(postId);

    if (!post) {
      return HttpResponse.json({ message: '게시글을 찾을 수 없습니다.' }, { status: 404 });
    }

    // Increment view count
    incrementPostViewCount(postId);

    // Get comments for this post
    const comments = getCommentsForPost(postId);

    const response: PostDetailResponse = {
      data: {
        ...post,
        comments,
      },
      is_liked: likedPosts.has(postId),
    };

    return HttpResponse.json(response);
  }),

  // POST /api/v1/community/posts - Create post
  http.post('/api/v1/community/posts', async ({ request }) => {
    const body = (await request.json()) as CreatePostRequest;

    // Get authenticated user from token
    const user = getUserFromRequest(request);

    if (!user) {
      return HttpResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const newPost: CommunityPost = {
      id: nextPostId++,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      title: body.title,
      content: body.content,
      category: body.category,
      type: body.type,
      status: 'active',
      user_id: user.id,
      user,
      gold_type: body.gold_type || null,
      weight: body.weight || null,
      price: body.price || null,
      location: body.location || null,
      store_id: body.store_id || null,
      store: body.store_id ? mockStores.find((s) => s.id === body.store_id) || null : null,
      is_answered: false,
      accepted_answer_id: null,
      view_count: 0,
      like_count: 0,
      comment_count: 0,
      image_urls: body.image_urls || [],
    };

    mockPosts.unshift(newPost);

    return HttpResponse.json(newPost, { status: 201 });
  }),

  // PUT /api/v1/community/posts/:id - Update post
  http.put('/api/v1/community/posts/:id', async ({ params, request }) => {
    const postId = parseInt(params.id as string, 10);
    const post = findPostById(postId);

    if (!post) {
      return HttpResponse.json({ message: '게시글을 찾을 수 없습니다.' }, { status: 404 });
    }

    const body = (await request.json()) as UpdatePostRequest;

    // Update fields
    Object.assign(post, {
      ...body,
      updated_at: new Date().toISOString(),
    });

    return HttpResponse.json(post);
  }),

  // DELETE /api/v1/community/posts/:id - Delete post
  http.delete('/api/v1/community/posts/:id', ({ params }) => {
    const postId = parseInt(params.id as string, 10);
    const index = mockPosts.findIndex((p) => p.id === postId);

    if (index === -1) {
      return HttpResponse.json({ message: '게시글을 찾을 수 없습니다.' }, { status: 404 });
    }

    mockPosts.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  // POST /api/v1/community/posts/:id/like - Toggle post like
  http.post('/api/v1/community/posts/:id/like', ({ params }) => {
    const postId = parseInt(params.id as string, 10);
    const post = findPostById(postId);

    if (!post) {
      return HttpResponse.json({ message: '게시글을 찾을 수 없습니다.' }, { status: 404 });
    }

    const isLiked = likedPosts.has(postId);

    if (isLiked) {
      likedPosts.delete(postId);
      post.like_count = Math.max(0, post.like_count - 1);
    } else {
      likedPosts.add(postId);
      post.like_count += 1;
    }

    return HttpResponse.json({ is_liked: !isLiked });
  }),

  // GET /api/v1/community/comments - Get comments
  http.get('/api/v1/community/comments', ({ request }) => {
    const url = new URL(request.url);
    const postId = parseInt(url.searchParams.get('post_id') || '0', 10);

    if (!postId) {
      return HttpResponse.json(
        { message: '게시글 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const comments = getCommentsForPost(postId);

    return HttpResponse.json({
      data: comments,
      total: comments.length,
      page: 1,
      page_size: 50,
    });
  }),

  // POST /api/v1/community/comments - Create comment
  http.post('/api/v1/community/comments', async ({ request }) => {
    const body = (await request.json()) as CreateCommentRequest;

    // Get authenticated user from token
    const user = getUserFromRequest(request);

    if (!user) {
      return HttpResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const newComment: CommunityComment = {
      id: nextCommentId++,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      content: body.content,
      user_id: user.id,
      user,
      post_id: body.post_id,
      parent_id: body.parent_id || null,
      is_answer: body.is_answer || false,
      is_accepted: false,
      like_count: 0,
      replies: [],
    };

    // Add to appropriate location
    if (body.parent_id) {
      // It's a reply
      const parentComment = findCommentById(body.parent_id);
      if (parentComment) {
        if (!parentComment.replies) {
          parentComment.replies = [];
        }
        parentComment.replies.push(newComment);
      }
    } else {
      // It's a top-level comment
      mockComments.push(newComment);
    }

    // Update post comment count
    const post = findPostById(body.post_id);
    if (post) {
      post.comment_count += 1;
    }

    return HttpResponse.json(newComment, { status: 201 });
  }),

  // PUT /api/v1/community/comments/:id - Update comment
  http.put('/api/v1/community/comments/:id', async ({ params, request }) => {
    const commentId = parseInt(params.id as string, 10);
    const comment = findCommentById(commentId);

    if (!comment) {
      return HttpResponse.json({ message: '댓글을 찾을 수 없습니다.' }, { status: 404 });
    }

    const body = (await request.json()) as UpdateCommentRequest;

    Object.assign(comment, {
      ...body,
      updated_at: new Date().toISOString(),
    });

    return HttpResponse.json(comment);
  }),

  // DELETE /api/v1/community/comments/:id - Delete comment
  http.delete('/api/v1/community/comments/:id', ({ params }) => {
    const commentId = parseInt(params.id as string, 10);

    // Find and remove from top-level
    let index = mockComments.findIndex((c) => c.id === commentId);
    if (index !== -1) {
      const comment = mockComments[index];
      mockComments.splice(index, 1);

      // Update post comment count
      const post = findPostById(comment.post_id);
      if (post) {
        post.comment_count = Math.max(0, post.comment_count - 1);
      }

      return new HttpResponse(null, { status: 204 });
    }

    // Find and remove from replies
    for (const comment of mockComments) {
      if (comment.replies) {
        index = comment.replies.findIndex((r) => r.id === commentId);
        if (index !== -1) {
          const reply = comment.replies[index];
          comment.replies.splice(index, 1);

          // Update post comment count
          const post = findPostById(reply.post_id);
          if (post) {
            post.comment_count = Math.max(0, post.comment_count - 1);
          }

          return new HttpResponse(null, { status: 204 });
        }
      }
    }

    return HttpResponse.json({ message: '댓글을 찾을 수 없습니다.' }, { status: 404 });
  }),

  // POST /api/v1/community/comments/:id/like - Toggle comment like
  http.post('/api/v1/community/comments/:id/like', ({ params }) => {
    const commentId = parseInt(params.id as string, 10);
    const comment = findCommentById(commentId);

    if (!comment) {
      return HttpResponse.json({ message: '댓글을 찾을 수 없습니다.' }, { status: 404 });
    }

    const isLiked = likedComments.has(commentId);

    if (isLiked) {
      likedComments.delete(commentId);
      comment.like_count = Math.max(0, comment.like_count - 1);
    } else {
      likedComments.add(commentId);
      comment.like_count += 1;
    }

    return HttpResponse.json({ is_liked: !isLiked });
  }),

  // POST /api/v1/community/posts/:postId/accept/:commentId - Accept answer
  http.post('/api/v1/community/posts/:postId/accept/:commentId', ({ params }) => {
    const postId = parseInt(params.postId as string, 10);
    const commentId = parseInt(params.commentId as string, 10);

    const post = findPostById(postId);
    const comment = findCommentById(commentId);

    if (!post) {
      return HttpResponse.json({ message: '게시글을 찾을 수 없습니다.' }, { status: 404 });
    }

    if (!comment) {
      return HttpResponse.json({ message: '댓글을 찾을 수 없습니다.' }, { status: 404 });
    }

    // Update post
    post.is_answered = true;
    post.accepted_answer_id = commentId;

    // Update comment
    comment.is_accepted = true;

    return HttpResponse.json({ message: '답변이 채택되었습니다.' });
  }),
];
