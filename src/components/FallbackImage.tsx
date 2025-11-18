import { useEffect, useState } from 'react';
import type { ImgHTMLAttributes } from 'react';

interface FallbackImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  /**
   * 대체 이미지 경로 (기본: placeholder 이미지)
   */
  fallbackSrc?: string;
}

const DEFAULT_FALLBACK = '/images/base-image.png';

/**
 * 공통 이미지 컴포넌트
 * - 원본 이미지를 불러오지 못하면 지정한 대체 이미지로 자동 교체
 * - src 변경 시마다 다시 시도
 */
export default function FallbackImage({
  src,
  fallbackSrc = DEFAULT_FALLBACK,
  onError,
  ...rest
}: FallbackImageProps) {
  const [currentSrc, setCurrentSrc] = useState<string>(src ?? fallbackSrc);

  useEffect(() => {
    setCurrentSrc(src ?? fallbackSrc);
  }, [src, fallbackSrc]);

  return (
    <img
      {...rest}
      src={currentSrc || fallbackSrc}
      onError={(event) => {
        if (currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
        }
        onError?.(event);
      }}
    />
  );
}
