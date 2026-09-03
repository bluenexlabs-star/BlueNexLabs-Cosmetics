"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  Activity,
  Brain,
  FlaskConical,
  Scale,
  Share2,
  Zap,
} from "lucide-react";
import { ProductCard, type ProductCardData } from "@/components/product-card";
import { ALL_CATALOG_SLUG, CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const ICONS = {
  metabolic: Scale,
  cellular: Share2,
  mitochondrial: Zap,
  ghs: Activity,
  cognitive: Brain,
  other: FlaskConical,
} as const;

function CategoryButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-expanded={selected}
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition",
        selected
          ? "border-sky-400 bg-navy-900 text-white ring-1 ring-sky-400"
          : "border-navy-800 bg-navy-900 text-white hover:border-sky-400 hover:bg-navy-800",
      )}
    >
      {children}
    </button>
  );
}

function AllPeptidesButton({
  selected,
  onClick,
}: {
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <CategoryButton selected={selected} onClick={onClick}>
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-400/20 text-sky-300">
        <FlaskConical className="h-5 w-5" />
      </span>
      <span>
        <span className="block text-[11px] uppercase tracking-[0.16em] text-sky-200">
          Catalog
        </span>
        <span className="block text-sm font-semibold uppercase tracking-wide">
          All peptides
        </span>
      </span>
    </CategoryButton>
  );
}

function CategoryTile({
  slug,
  selected,
  onClick,
}: {
  slug: (typeof CATEGORIES)[number]["slug"];
  selected: boolean;
  onClick: () => void;
}) {
  const cat = CATEGORIES.find((c) => c.slug === slug);
  if (!cat) return null;
  const Icon = ICONS[slug];
  return (
    <CategoryButton selected={selected} onClick={onClick}>
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-400/20 text-sky-300">
        <Icon className="h-5 w-5" />
      </span>
      <span>
        <span className="block text-sm font-semibold uppercase tracking-wide">
          {cat.shortName}
        </span>
        <span className="mt-0.5 block text-[11px] text-slate-300">
          {cat.name}
        </span>
      </span>
    </CategoryButton>
  );
}

function ProductGrid({ items }: { items: ProductCardData[] }) {
  if (items.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-slate-500">
        No products in this group.
      </p>
    );
  }
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {items.map((product) => (
        <ProductCard key={product.slug} product={product} />
      ))}
    </div>
  );
}

export function CategoryNav({
  products,
  initialOpen,
  searching,
}: {
  products: ProductCardData[];
  initialOpen?: string;
  searching?: boolean;
}) {
  const [openSlug, setOpenSlug] = useState<string | null>(
    searching ? ALL_CATALOG_SLUG : (initialOpen ?? null),
  );

  useEffect(() => {
    if (searching) setOpenSlug(ALL_CATALOG_SLUG);
  }, [searching]);

  const toggle = (slug: string) => {
    setOpenSlug((current) => (current === slug ? null : slug));
  };

  const itemsFor = (slug: string) =>
    slug === ALL_CATALOG_SLUG
      ? products
      : products.filter((p) => p.category === slug);

  return (
    <>
      <div className="mt-6 hidden gap-3 lg:grid lg:grid-cols-3">
        <AllPeptidesButton
          selected={openSlug === ALL_CATALOG_SLUG}
          onClick={() => toggle(ALL_CATALOG_SLUG)}
        />
        {CATEGORIES.map((c) => (
          <CategoryTile
            key={c.slug}
            slug={c.slug}
            selected={openSlug === c.slug}
            onClick={() => toggle(c.slug)}
          />
        ))}
      </div>
      {openSlug && (
        <div className="mt-8 hidden lg:block">
          <ProductGrid items={itemsFor(openSlug)} />
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3 lg:hidden">
        <div className="flex flex-col gap-3">
          <AllPeptidesButton
            selected={openSlug === ALL_CATALOG_SLUG}
            onClick={() => toggle(ALL_CATALOG_SLUG)}
          />
          {openSlug === ALL_CATALOG_SLUG && (
            <ProductGrid items={itemsFor(ALL_CATALOG_SLUG)} />
          )}
        </div>
        {CATEGORIES.map((c) => (
          <div key={c.slug} className="flex flex-col gap-3">
            <CategoryTile
              slug={c.slug}
              selected={openSlug === c.slug}
              onClick={() => toggle(c.slug)}
            />
            {openSlug === c.slug && <ProductGrid items={itemsFor(c.slug)} />}
          </div>
        ))}
      </div>
    </>
  );
}
