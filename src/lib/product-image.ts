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
 * Remote catalog URLs fall back to the slug PNG in `public/images/products/`.
 * An explicit local path is used as stored, so pouch photos whose filename
 * differs from the product slug still render.
 */
export function productImageSrc(slug: string, imageUrl?: string | null) {
  const local = localProductImagePath(slug);
  if (!imageUrl) return local;
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return local;
  }
  if (imageUrl.startsWith("/images/products/")) {
    const pathOnly = imageUrl.split("?")[0];
    if (pathOnly === `/images/products/${slug}.png`) return local;
    return pathOnly;
  }
  return imageUrl;
}
