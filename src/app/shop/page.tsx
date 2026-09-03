import type { Metadata } from "next";
import { CategoryNav } from "@/components/category-nav";
import { ShopSearchForm } from "@/components/shop-search-form";
import { ALL_CATALOG_SLUG, CATEGORIES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { productSearchWhere } from "@/lib/search";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Shop research peptides" };

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { category, q } = await searchParams;
  const searching = Boolean(q?.trim());
  const realCategory = CATEGORIES.find((c) => c.slug === category)?.slug;
  const initialOpen =
    category === ALL_CATALOG_SLUG ? ALL_CATALOG_SLUG : realCategory;

  const rows = await prisma.product.findMany({
    where: {
      active: true,
      ...(searching && q ? productSearchWhere(q) : {}),
    },
    include: { variants: true },
    orderBy: { sortOrder: "asc" },
  });

  const products = rows.map((p) => ({
    name: p.name,
    slug: p.slug,
    category: p.category,
    imageUrl: p.imageUrl,
    fromCents: Math.min(...p.variants.map((v) => v.priceCents)),
    inStock: p.variants.some((v) => v.stock > 0),
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-widest text-cyan-700">
        Catalog
      </p>
      <h1 className="display mt-1 text-3xl text-navy-900">Research peptides</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Lyophilized research materials with listed vial sizes and CAD pricing.
        Stock is live — sold-out SKUs cannot be added to the cart.
      </p>

      <ShopSearchForm category={category} q={q} />

      <CategoryNav
        products={products}
        initialOpen={initialOpen}
        searching={searching}
      />
    </div>
  );
}
