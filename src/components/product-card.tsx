"use client";

import Link from "next/link";
import { CoaButton } from "@/components/coa-button";
import { Badge } from "@/components/ui/badge";
import { formatCad } from "@/lib/utils";
import { CATEGORIES } from "@/lib/constants";
import { productImageSrc } from "@/lib/product-image";
import { primaryCoaHref } from "@/lib/certificates";

export type ProductCardData = {
  name: string;
  slug: string;
  category: string;
  imageUrl: string | null;
  fromCents: number;
  inStock: boolean;
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const cat = CATEGORIES.find((c) => c.slug === product.category);
  const imageSrc = productImageSrc(product.slug, product.imageUrl);
  const hasCoa = Boolean(primaryCoaHref(product.slug));
  return (
    <div className="group flex flex-col rounded-xl border border-navy-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Link href={`/shop/${product.slug}`} className="flex flex-1 flex-col">
        <div className="relative aspect-square overflow-hidden rounded-t-xl bg-navy-50">
          {imageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageSrc}
              alt={product.name}
              className="h-full w-full object-contain p-4 transition group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
              No image
            </div>
          )}
          {!product.inStock && (
            <span className="absolute left-3 top-3 rounded-full bg-navy-950/80 px-2 py-1 text-[11px] font-medium text-white">
              Sold out
            </span>
          )}
        </div>
        <div className={`flex flex-1 flex-col gap-2 p-4 ${hasCoa ? "pb-0" : ""}`}>
          {cat && (
            <Badge tone="cyan" className="w-fit">
              {cat.name}
            </Badge>
          )}
          <h3 className="text-sm font-semibold leading-snug text-navy-900 group-hover:text-cyan-700">
            {product.name}
          </h3>
          <p className="mt-auto text-sm font-medium text-navy-800">
            {product.inStock ? `From ${formatCad(product.fromCents)}` : "Out of stock"}
          </p>
        </div>
      </Link>
      {hasCoa && (
        <div className="p-4 pt-3">
          <CoaButton slug={product.slug} className="w-full" />
        </div>
      )}
    </div>
  );
}
