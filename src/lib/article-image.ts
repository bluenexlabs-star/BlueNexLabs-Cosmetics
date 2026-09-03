/** Local cover photo for an article slug. */
export function localArticleImagePath(slug: string) {
  return `/images/articles/${slug}.png`;
}

/**
 * Only these slugs have composited vial PNGs in `public/images/articles/`.
 * Everything else must keep its original Squarespace/CDN or /uploads/ cover.
 */
const LOCAL_ARTICLE_COVER_SLUGS = new Set([
  "melanotan-research-overview",
  "bacteriostatic-water-canada",
  "why-does-tesamorelin-gel",
  "glp-1-peptide-research-2026",
  "ghk-cu-peptide-in-canada-what-it-is-how-it-works-and-why-it-s-studied-for-skin-a",
]);

export function hasLocalArticleCover(slug: string) {
  return LOCAL_ARTICLE_COVER_SLUGS.has(slug);
}

/**
 * Resolve the cover to render for an article.
 * Production DBs still store Squarespace CDN URLs from the first seed.
 * Remap to `/images/articles/{slug}.png` only when that file actually ships.
 * Never replace a working unique cover with a missing slug PNG.
 */
export function articleImageSrc(slug: string, coverImageUrl?: string | null) {
  const local = localArticleImagePath(slug);
  const hasLocal = hasLocalArticleCover(slug);

  if (hasLocal) {
    if (!coverImageUrl) return local;
    if (
      coverImageUrl.startsWith("http://") ||
      coverImageUrl.startsWith("https://") ||
      coverImageUrl.startsWith("/images/articles/")
    ) {
      return local;
    }
  }

  if (coverImageUrl?.startsWith("/images/articles/")) {
    const mappedSlug = coverImageUrl.slice("/images/articles/".length).replace(/\.png$/i, "");
    if (hasLocalArticleCover(mappedSlug)) return coverImageUrl;
    return "";
  }

  return coverImageUrl || "";
}
