import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { useStores } from '@/hooks/queries/useStoresQueries';
import { LoadingSpinner } from '@/components';

/**
 * MyStorePage - 내 매장으로 리다이렉트하는 페이지
 * admin 사용자의 매장 ID를 찾아서 매장 상세 페이지로 이동
 */
export default function MyStorePage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  // 모든 매장 조회 (user_id로 필터링하기 위해)
  const { data: storesData, isLoading } = useStores();

  useEffect(() => {
    if (!user) {
      // 로그인되지 않은 경우 로그인 페이지로
      navigate('/login');
      return;
    }

    if (user.role !== 'admin') {
      // admin이 아니면 홈으로
      navigate('/');
      return;
    }

    // 매장 데이터를 아직 로딩 중이면 대기
    if (isLoading) {
      return;
    }

    // user_id가 일치하는 매장 찾기
    const myStore = storesData?.stores.find((store) => store.user_id === user.id);

    if (!myStore) {
      // 매장이 없는 admin 사용자
      // TODO: 매장 등록 페이지로 이동하거나 안내 메시지 표시
      alert('등록된 매장이 없습니다.');
      navigate('/');
      return;
    }

    // 사용자의 매장 상세 페이지로 리다이렉트
    navigate(`/stores/${myStore.id}`);
  }, [user, navigate, storesData, isLoading]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoadingSpinner message="내 매장으로 이동 중..." />
    </div>
  );
}
