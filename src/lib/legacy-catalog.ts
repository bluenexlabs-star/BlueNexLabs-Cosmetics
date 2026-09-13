/**
 * Slugs from the inherited peptide seed (`prisma/seed-data.json`).
 * Storefront queries exclude these so leftover DB/seed rows never appear
 * as cosmetics catalog or journal content. Admin and seed scripts are unchanged.
 */
export const LEGACY_PRODUCT_SLUGS = [
  "adamax-10mg",
  "aicar-50mg",
  "b12-vitamin-canada",
  "bac-water-3ml",
  "bcp-157-10mg",
  "bpc-157-tb-500-10mg10mg",
  "bpc-157-tb-500-5mg5mg",
  "cagrilintide-5mg",
  "cjc-1259-no-dac-ipamorelin-5mg-5mg",
  "delta-sleep-inducing-peptide-10mg",
  "epithalon-10mg-canada",
  "ghk-cu-50mg",
  "glow70",
  "glutathione-1500mg",
  "hospira-bacteriostatic-water-30ml",
  "ipamorelin-10mg",
  "kisspeptin-10mg-canada-peptide",
  "klow-80mg",
  "kpv-10mg",
  "l-carnitine-600mg",
  "ll37-5mg",
  "melanotan",
  "melanotan-i",
  "mots-c-10mg-canada",
  "nad-500mg-canada",
  "oxytocin-5mg",
  "pinealon-10mg",
  "pt-141",
  "retatrutide-30mg",
  "selank-10mg",
  "semaglutide-20mg",
  "semax-10mg",
  "sermorelin-10mg",
  "snap-8-10mg",
  "ss-31-50mg",
  "tb-500-10mg",
  "tesamorelin-10mg-canada",
  "tirzepatide-10mg",
] as const;

export const LEGACY_POST_SLUGS = [
  "2026-3-13-batch-testing-and-verification",
  "2026-3-13-how-peptide-purity-is-measured",
  "2026-3-9-peptide-structure-and-stability",
  "affordable-sleep-peptides-canadian",
  "are-peptides-legal-canada",
  "are-peptides-legal-in-canada",
  "bacteriostatic-water",
  "bacteriostatic-water-canada",
  "bcp-157-canada",
  "blog-peptide-storage-guidelines-canada",
  "blog-signaling-peptides-skin-health-regeneration",
  "blog-where-to-buy-coa-certified-peptides-canada",
  "breaking-news-retatrutide-clears-first-stage-diabetes-trial",
  "breaking-news-retatrutide-clears-first-late-stage-diabetes-trial",
  "canada-skin-longevity-peptides-beauty-trends",
  "canada-vancouver-toronto",
  "certificate-of-analysis-coa-guide-canada",
  "cjc-1295-ipamorelin-research-guide",
  "cje4mafbhc8j4paewe536hsmta8c9k",
  "endotoxins-testing-coa",
  "ghk-cu-copper-peptide-canada",
  "ghk-cu-peptide-in-canada-what-it-is-how-it-works-and-why-it-s-studied-for-skin-a",
  "glp-1-peptide-research-2026",
  "grey-market-canadian-peptides",
  "health-canada-peptides-regulations",
  "how-do-peptides-work",
  "how-peptides-are-made-manufacturing-quality-control-lyophilization",
  "how-to-read-peptide-certificate-of-analysi",
  "jlll7rxnlwz575ws2d9e2c2lz9krwd",
  "kag4skcx6nlawwjjdcsrzhg29jjplb",
  "light-temperature-sensitivity-peptides",
  "melanotan-research-overview",
  "mitochondrial-peptides-the-next-frontier",
  "muscle-growth-peptides-research-guide",
  "peptide-degradation-guide-canada",
  "peptide-delivery-bioavailability-canada",
  "peptide-handling-common-errors",
  "peptide-laws-in-canada",
  "peptide-quality-purity-contamination-canada",
  "peptide-storage-handling-guide-canada",
  "research-peptide-guides",
  "retatrutide-fda-approval",
  "start-canadian-peptide-testing-company",
  "structural-peptides",
  "what-are-research-peptides",
  "what-are-research-peptides-007",
  "when-were-peptides-discovered",
  "why-do-peptide-names-end-in-tide",
  "why-does-tesamorelin-gel",
  "why-hospira-bacteriostatic-water-is-the-golden-standard-used-in-peptide-research",
] as const;

const legacyProductSet = new Set<string>(LEGACY_PRODUCT_SLUGS);
const legacyPostSet = new Set<string>(LEGACY_POST_SLUGS);

export function isLegacyProductSlug(slug: string) {
  return legacyProductSet.has(slug);
}

export function isLegacyPostSlug(slug: string) {
  return legacyPostSet.has(slug);
}

export function storefrontProductWhere<T extends Record<string, unknown>>(
  extra?: T,
) {
  return {
    active: true,
    slug: { notIn: [...LEGACY_PRODUCT_SLUGS] },
    ...extra,
  };
}

export function storefrontPostWhere<T extends Record<string, unknown>>(
  extra?: T,
) {
  return {
    published: true,
    slug: { notIn: [...LEGACY_POST_SLUGS] },
    ...extra,
  };
}
