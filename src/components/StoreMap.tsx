import { useEffect, useState } from 'react';
import { Map, MapMarker, CustomOverlayMap } from 'react-kakao-maps-sdk';

// Kakao Maps SDK 로드 확인
declare global {
  interface Window {
    kakao: any;
  }
}

interface StoreLocation {
  id: number;
  name: string;
  lat: number;
  lng: number;
  address?: string;
  isOpen?: boolean;
}

interface StoreMapProps {
  stores: StoreLocation[];
  selectedStoreId?: number | null;
  onStoreClick?: (store: StoreLocation) => void;
  center?: { lat: number; lng: number };
  onCenterChange?: (center: { lat: number; lng: number }) => void;
}

/**
 * StoreMap Component
 *
 * Kakao Maps SDK를 사용한 매장 지도 컴포넌트
 *
 * Features:
 * - 매장 마커 표시
 * - 마커 클릭 이벤트
 * - 선택된 마커 강조
 * - 지도 중심 이동
 * - 커스텀 오버레이 (매장명 표시)
 */
export default function StoreMap({
  stores,
  selectedStoreId,
  onStoreClick,
  center: propCenter,
  onCenterChange,
}: StoreMapProps) {
  // 컴포넌트 렌더링 로그
  useEffect(() => {
    console.log('🗺️ StoreMap rendered with:', {
      storesCount: stores.length,
      stores: stores.slice(0, 3),
      center: propCenter,
      windowExists: typeof window !== 'undefined',
      kakaoExists: typeof window !== 'undefined' && typeof window.kakao !== 'undefined',
      kakaoMapsExists: typeof window !== 'undefined' && typeof window.kakao !== 'undefined' && typeof window.kakao.maps !== 'undefined',
    });
  }, [stores, propCenter]);

  const [map, setMap] = useState<kakao.maps.Map | null>(null);
  const [center, setCenter] = useState(
    propCenter || { lat: 37.5665, lng: 126.978 } // 서울시청 기본 좌표
  );
  const [level, setLevel] = useState(5); // 지도 줌 레벨 (1~14)

  // Kakao SDK 로드 확인 및 대기
  const [isKakaoLoaded, setIsKakaoLoaded] = useState(false);

  useEffect(() => {
    let checkInterval: ReturnType<typeof setInterval> | null = null;
    let mounted = true;

    const checkKakaoMaps = () => {
      if (!mounted) return;

      if (typeof window === 'undefined') {
        console.error('❌ Window object not available');
        return;
      }

      if (typeof window.kakao === 'undefined') {
        console.error('❌ Kakao Maps SDK script not loaded');
        return;
      }

      // SDK가 로드되었지만 maps가 준비되지 않은 경우 대기
      if (!window.kakao.maps) {
        console.log('⏳ Waiting for Kakao Maps SDK to initialize...');
        checkInterval = setInterval(() => {
          if (window.kakao && window.kakao.maps && mounted) {
            console.log('✅ Kakao Maps SDK loaded successfully');
            if (checkInterval) clearInterval(checkInterval);
            setIsKakaoLoaded(true);
          }
        }, 100);
        return;
      }

      // 이미 로드된 경우
      console.log('✅ Kakao Maps SDK already loaded');
      setIsKakaoLoaded(true);
    };

    // 약간의 지연을 주고 체크 시작 (SSR 대응)
    const initTimeout = setTimeout(checkKakaoMaps, 100);

    return () => {
      mounted = false;
      clearTimeout(initTimeout);
      if (checkInterval) clearInterval(checkInterval);
    };
  }, []);

  // prop center가 변경되면 지도 중심 업데이트
  useEffect(() => {
    if (propCenter) {
      setCenter(propCenter);
    }
  }, [propCenter]);

  // 선택된 매장이 변경되면 해당 위치로 지도 중심 이동
  useEffect(() => {
    if (selectedStoreId && map) {
      const selectedStore = stores.find((store) => store.id === selectedStoreId);
      if (selectedStore) {
        const moveLatLon = new kakao.maps.LatLng(selectedStore.lat, selectedStore.lng);
        map.panTo(moveLatLon); // 부드럽게 이동
      }
    }
  }, [selectedStoreId, stores, map]);

  const handleMarkerClick = (store: StoreLocation) => {
    if (onStoreClick) {
      onStoreClick(store);
    }
  };

  const handleCenterChanged = (map: kakao.maps.Map) => {
    const latlng = map.getCenter();
    const newCenter = { lat: latlng.getLat(), lng: latlng.getLng() };
    setCenter(newCenter);
    if (onCenterChange) {
      onCenterChange(newCenter);
    }
  };

  // SDK가 로드될 때까지 로딩 표시
  if (!isKakaoLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-[14px] text-gray-500">지도 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <Map
      center={center}
      style={{ width: '100%', height: '100%' }}
      level={level}
      draggable={true}
      scrollwheel={true}
      onCreate={(map) => {
        console.log('✅ Kakao Map created:', map);
        setMap(map);
      }}
      onCenterChanged={handleCenterChanged}
      onZoomChanged={(map) => setLevel(map.getLevel())}
    >
      {stores.map((store) => {
        const isSelected = selectedStoreId === store.id;

        return (
          <div key={store.id}>
            {/* 기본 마커 */}
            <MapMarker
              position={{ lat: store.lat, lng: store.lng }}
              onClick={() => handleMarkerClick(store)}
              image={{
                src: isSelected
                  ? 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png'
                  : 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
                size: {
                  width: isSelected ? 40 : 32,
                  height: isSelected ? 44 : 35,
                },
              }}
            />

            {/* 커스텀 오버레이 - 선택 시에만 매장명 표시 */}
            {isSelected && (
              <CustomOverlayMap
                position={{ lat: store.lat, lng: store.lng }}
                yAnchor={1.8}
              >
                <div
                  className="px-3 py-1.5 bg-white rounded-lg shadow-lg border border-gray-200"
                  style={{
                    transform: 'translate(-50%, 0)',
                    pointerEvents: 'none',
                  }}
                >
                  <p className="text-[12px] font-semibold text-gray-900 whitespace-nowrap">
                    {store.name}
                  </p>
                </div>
              </CustomOverlayMap>
            )}
          </div>
        );
      })}

      {/* 현재 위치 마커 (propCenter가 서울시청이 아닐 때) */}
      {propCenter &&
        (propCenter.lat !== 37.5665 || propCenter.lng !== 126.978) && (
          <MapMarker
            position={propCenter}
            image={{
              src: 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_blue.png',
              size: { width: 36, height: 37 },
            }}
          />
        )}
    </Map>
  );
}
