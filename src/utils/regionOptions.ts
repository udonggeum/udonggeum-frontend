import { MOCK_REGIONS } from '@/constants/mockData';
import type { RegionsData } from '@/services/stores';

export interface RegionOption {
  id: string;
  label: string;
  region?: string;
  district?: string;
}

const normalize = (value?: string | null) => {
  if (!value) return null;
  return value.trim().toLowerCase();
};

export function createFallbackRegionOptions(): RegionOption[] {
  return MOCK_REGIONS.map((region) => {
    const nameParts = region.name.split(' ');
    const primary = nameParts[0];
    const district = nameParts.slice(1).join(' ');

    return {
      id: region.id,
      label: region.name,
      region: region.city || primary,
      district: district || undefined,
    };
  });
}

export function getRegionOptions(locationsData?: RegionsData): RegionOption[] {
  if (locationsData?.regions?.length) {
    return locationsData.regions.flatMap((regionGroup) =>
      regionGroup.districts.map((district) => ({
        id: `${regionGroup.region}-${district}`.toLowerCase().replace(/\s+/g, '-'),
        label: `${regionGroup.region} ${district}`,
        region: regionGroup.region,
        district,
      }))
    );
  }

  return createFallbackRegionOptions();
}

export function findRegionIdByNames(
  options: RegionOption[],
  regionName: string | null,
  districtName: string | null,
  fallbackId: string | null = null
): string | null {
  const normalizedRegion = normalize(regionName);
  const normalizedDistrict = normalize(districtName);

  if (options.length > 0 && (normalizedRegion || normalizedDistrict)) {
    const matched = options.find((option) => {
      const optionRegion = normalize(option.region);
      const optionDistrict = normalize(option.district);

      const regionMatches = normalizedRegion ? optionRegion === normalizedRegion : true;
      const districtMatches = normalizedDistrict ? optionDistrict === normalizedDistrict : true;

      return regionMatches && districtMatches;
    });

    if (matched) {
      return matched.id;
    }
  }

  return fallbackId ?? null;
}
