"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartLine = {
  variantId: string;
  productId: string;
  slug: string;
  name: string;
  label: string;
  sku: string;
  unitCents: number;
  qty: number;
  imageUrl?: string | null;
  stock: number;
};

type CartState = {
  lines: CartLine[];
  add: (line: Omit<CartLine, "qty">, qty?: number) => void;
  setQty: (variantId: string, qty: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
  replace: (lines: CartLine[]) => void;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      add: (line, qty = 1) => {
        const existing = get().lines.find((l) => l.variantId === line.variantId);
        if (existing) {
          const nextQty = Math.min(existing.stock, existing.qty + qty);
          set({
            lines: get().lines.map((l) =>
              l.variantId === line.variantId ? { ...l, qty: nextQty } : l,
            ),
          });
          return;
        }
        set({
          lines: [...get().lines, { ...line, qty: Math.min(line.stock, qty) }],
        });
      },
      setQty: (variantId, qty) => {
        if (qty <= 0) {
          set({ lines: get().lines.filter((l) => l.variantId !== variantId) });
          return;
        }
        set({
          lines: get().lines.map((l) =>
            l.variantId === variantId
              ? { ...l, qty: Math.min(l.stock, qty) }
              : l,
          ),
        });
      },
      remove: (variantId) =>
        set({ lines: get().lines.filter((l) => l.variantId !== variantId) }),
      clear: () => set({ lines: [] }),
      replace: (lines) => set({ lines }),
    }),
    { name: "bluenex-cart" },
  ),
);

export function cartCount(lines: CartLine[]) {
  return lines.reduce((n, l) => n + l.qty, 0);
}

export function cartSubtotal(lines: CartLine[]) {
  return lines.reduce((n, l) => n + l.qty * l.unitCents, 0);
}
