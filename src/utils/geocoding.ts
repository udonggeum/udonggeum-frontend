/**
 * Geocoding Utilities
 *
 * 카카오맵 API를 사용한 주소 ↔ 좌표 변환 유틸리티
 */

export interface GeocodingResult {
  address: string;
  roadAddress: string | null;
  latitude: number;
  longitude: number;
  region: string; // 시도 (서울특별시, 부산광역시 등)
  district: string; // 구군 (강남구, 해운대구 등)
}

/**
 * 주소로 좌표 검색 (Address → Coordinates)
 *
 * @param address - 검색할 주소 (예: "서울특별시 강남구 테헤란로 231")
 * @returns 좌표 정보 또는 null (검색 실패 시)
 */
export async function searchAddressToCoords(
  address: string
): Promise<GeocodingResult | null> {
  return new Promise((resolve) => {
    if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
      console.error('Kakao Maps SDK not loaded');
      resolve(null);
      return;
    }

    const geocoder = new kakao.maps.services.Geocoder();

    geocoder.addressSearch(address, (result, status) => {
      if (status === kakao.maps.services.Status.OK && result.length > 0) {
        const firstResult = result[0];

        resolve({
          address: firstResult.address_name,
          roadAddress: firstResult.road_address?.address_name || null,
          latitude: parseFloat(firstResult.y),
          longitude: parseFloat(firstResult.x),
          region: firstResult.address.region_1depth_name,
          district: firstResult.address.region_2depth_name,
        });
      } else {
        console.warn('Address search failed:', address, status);
        resolve(null);
      }
    });
  });
}

/**
 * 좌표로 주소 검색 (Coordinates → Address)
 *
 * @param latitude - 위도
 * @param longitude - 경도
 * @returns 주소 정보 또는 null (검색 실패 시)
 */
export async function searchCoordsToAddress(
  latitude: number,
  longitude: number
): Promise<GeocodingResult | null> {
  return new Promise((resolve) => {
    if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
      console.error('Kakao Maps SDK not loaded');
      resolve(null);
      return;
    }

    const geocoder = new kakao.maps.services.Geocoder();

    geocoder.coord2Address(longitude, latitude, (result, status) => {
      if (status === kakao.maps.services.Status.OK && result.length > 0) {
        const firstResult = result[0];

        resolve({
          address: firstResult.address.address_name,
          roadAddress: firstResult.road_address?.address_name || null,
          latitude,
          longitude,
          region: firstResult.address.region_1depth_name,
          district: firstResult.address.region_2depth_name,
        });
      } else {
        console.warn('Coordinate search failed:', latitude, longitude, status);
        resolve(null);
      }
    });
  });
}

/**
 * 카카오맵 SDK 로드 확인
 *
 * @returns SDK 사용 가능 여부
 */
export function isKakaoMapsLoaded(): boolean {
  return !!(window.kakao && window.kakao.maps && window.kakao.maps.services);
}
