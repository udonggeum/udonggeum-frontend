/**
 * Kakao Maps SDK Type Definitions
 *
 * 카카오맵 JavaScript API v2 타입 정의
 * @see https://apis.map.kakao.com/web/documentation/
 */

declare namespace kakao.maps {
  // ===== Core Classes =====

  class Map {
    constructor(container: HTMLElement, options: MapOptions);
    setCenter(latlng: LatLng): void;
    getCenter(): LatLng;
    setLevel(level: number, options?: { animate: boolean }): void;
    getLevel(): number;
    panTo(latlng: LatLng): void;
    relayout(): void;
  }

  interface MapOptions {
    center: LatLng;
    level?: number;
  }

  class LatLng {
    constructor(latitude: number, longitude: number);
    getLat(): number;
    getLng(): number;
  }

  class Marker {
    constructor(options: MarkerOptions);
    setMap(map: Map | null): void;
    getPosition(): LatLng;
    setPosition(position: LatLng): void;
    setDraggable(draggable: boolean): void;
  }

  interface MarkerOptions {
    map?: Map;
    position: LatLng;
    draggable?: boolean;
  }

  // ===== Services =====

  namespace services {
    class Geocoder {
      constructor();
      addressSearch(
        address: string,
        callback: (result: AddressSearchResult[], status: Status) => void
      ): void;
      coord2Address(
        lng: number,
        lat: number,
        callback: (result: Coord2AddressResult[], status: Status) => void
      ): void;
    }

    interface AddressSearchResult {
      address_name: string;
      address_type: 'REGION' | 'ROAD' | 'REGION_ADDR' | 'ROAD_ADDR';
      x: string; // longitude
      y: string; // latitude
      address: Address;
      road_address: RoadAddress | null;
    }

    interface Address {
      address_name: string;
      region_1depth_name: string; // 시도
      region_2depth_name: string; // 구군
      region_3depth_name: string; // 동
      mountain_yn: 'Y' | 'N';
      main_address_no: string;
      sub_address_no: string;
    }

    interface RoadAddress {
      address_name: string;
      region_1depth_name: string;
      region_2depth_name: string;
      region_3depth_name: string;
      road_name: string;
      underground_yn: 'Y' | 'N';
      main_building_no: string;
      sub_building_no: string;
      building_name: string;
      zone_no: string;
    }

    interface Coord2AddressResult {
      address: Address;
      road_address: RoadAddress | null;
    }

    enum Status {
      OK = 'OK',
      ZERO_RESULT = 'ZERO_RESULT',
      ERROR = 'ERROR',
    }
  }

  // ===== Event =====

  namespace event {
    function addListener(
      target: any,
      type: string,
      handler: (event: any) => void
    ): void;
    function removeListener(
      target: any,
      type: string,
      handler: (event: any) => void
    ): void;
  }
}

// Global kakao namespace
declare const kakao: {
  maps: typeof kakao.maps;
};
