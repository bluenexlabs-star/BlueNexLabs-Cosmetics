"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CoaButton } from "@/components/coa-button";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { formatCad } from "@/lib/utils";

type Variant = {
  id: string;
  label: string;
  sku: string;
  priceCents: number;
  stock: number;
};

export function AddToCart({
  productId,
  slug,
  name,
  imageUrl,
  variants,
}: {
  productId: string;
  slug: string;
  name: string;
  imageUrl?: string | null;
  variants: Variant[];
}) {
  const add = useCart((s) => s.add);
  const router = useRouter();
  const first = variants.find((v) => v.stock > 0) ?? variants[0];
  const [variantId, setVariantId] = useState(first?.id);
  const [qty, setQty] = useState(1);
  const selected = useMemo(
    () => variants.find((v) => v.id === variantId) ?? first,
    [variantId, variants, first],
  );
  if (!selected) return null;
  const soldOut = selected.stock <= 0;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-navy-800">Vial size</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {variants.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => {
                setVariantId(v.id);
                setQty(1);
              }}
              className={`rounded-md border px-3 py-2 text-sm ${
                v.id === selected.id
                  ? "border-navy-900 bg-navy-900 text-white"
                  : "border-navy-200 bg-white"
              } ${v.stock <= 0 ? "opacity-50" : ""}`}
            >
              {v.label} · {formatCad(v.priceCents)}
              {v.stock <= 0 ? " (sold out)" : ""}
            </button>
          ))}
        </div>
      </div>
      <p className="text-3xl font-semibold text-navy-900">
        {formatCad(selected.priceCents)}
        <span className="ml-2 text-sm font-normal text-slate-500">CAD</span>
      </p>
      <p className="text-sm text-slate-500">
        {soldOut ? "Currently unavailable" : `${selected.stock} in stock`} · SKU{" "}
        {selected.sku}
      </p>
      <div className="flex items-center gap-3">
        <input
          type="number"
          min={1}
          max={Math.max(1, selected.stock)}
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
          className="h-11 w-20 rounded-md border border-navy-200 px-3"
          disabled={soldOut}
        />
        <Button
          size="lg"
          disabled={soldOut}
          onClick={() => {
            add(
              {
                variantId: selected.id,
                productId,
                slug,
                name,
                label: selected.label,
                sku: selected.sku,
                unitCents: selected.priceCents,
                imageUrl,
                stock: selected.stock,
              },
              qty,
            );
            toast.success(`${name} added to cart`);
          }}
        >
          {soldOut ? "Sold out" : "Add to cart"}
        </Button>
        <Button size="lg" variant="light" onClick={() => router.push("/cart")}>
          View cart
        </Button>
      </div>
      <CoaButton slug={slug} variantLabel={selected.label} className="w-full sm:w-auto" />
    </div>
  );
}
