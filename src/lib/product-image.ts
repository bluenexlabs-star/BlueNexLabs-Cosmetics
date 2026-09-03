const PRODUCT_IMAGE_REV: Record<string, number> = {
  "hospira-bacteriostatic-water-30ml": 2,
  "b12-vitamin-canada": 2,
};

/** Local catalog photo for a product slug. */
export function localProductImagePath(slug: string) {
  const path = `/images/products/${slug}.png`;
  const rev = PRODUCT_IMAGE_REV[slug];
  return rev ? `${path}?v=${rev}` : path;
}

/**
 * Resolve the photo to render for a product.
 * Production DBs still store Squarespace CDN URLs from the first seed.
 * Those either 404 or show the old cube labels. Prefer the composited
 * slug PNG that ships in `public/images/products/`.
 */
export function productImageSrc(slug: string, imageUrl?: string | null) {
  const local = localProductImagePath(slug);
  if (!imageUrl) return local;
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return local;
  }
  if (imageUrl.startsWith("/images/products/")) return local;
  return imageUrl;
}
