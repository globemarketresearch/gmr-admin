import { useEffect, useState } from 'react';

/**
 * Loads an image to determine its natural width/height ratio so it can be
 * rendered without distortion (e.g. square logos forced into a wide box).
 * Returns null until the image has loaded, or on load failure.
 */
export function useImageAspectRatio(src: string | null | undefined): number | null {
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);

  useEffect(() => {
    if (!src) {
      setAspectRatio(null);
      return;
    }

    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (!cancelled && img.naturalWidth && img.naturalHeight) {
        setAspectRatio(img.naturalWidth / img.naturalHeight);
      }
    };
    img.onerror = () => {
      if (!cancelled) setAspectRatio(null);
    };
    img.src = src;

    return () => {
      cancelled = true;
    };
  }, [src]);

  return aspectRatio;
}
