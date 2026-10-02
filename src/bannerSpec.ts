/** Homepage hero art must match the current banners so it fills the hero without extra crop. */
export const HERO_BANNER_WIDTH = 1920;
export const HERO_BANNER_HEIGHT = 850;
export const HERO_BANNER_MAX_BYTES = 8 * 1024 * 1024;
export const HERO_BANNER_SIZE_LABEL = `${HERO_BANNER_WIDTH} × ${HERO_BANNER_HEIGHT}`;

export function bannerSizeError(width: number, height: number): string | null {
  if (width === HERO_BANNER_WIDTH && height === HERO_BANNER_HEIGHT) return null;
  return `Banner must be exactly ${HERO_BANNER_SIZE_LABEL} pixels so it covers the homepage hero. This image is ${width} × ${height}.`;
}
