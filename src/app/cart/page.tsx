"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cartCount, cartSubtotal, useCart } from "@/lib/cart";
import {
  formatCad,
  FREE_SHIPPING_THRESHOLD_CENTS,
  shippingCents,
} from "@/lib/utils";
import { productImageSrc } from "@/lib/product-image";

export default function CartPage() {
  const lines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const subtotal = cartSubtotal(lines);
  const shipping = shippingCents(subtotal);
  const total = subtotal + shipping;

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="display text-3xl text-navy-900">Your cart is empty</h1>
        <p className="mt-3 text-slate-600">
          Add research materials from the catalog to start an Interac order.
        </p>
        <Button asChild className="mt-6">
          <Link href="/shop">Browse catalog</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="display text-3xl text-navy-900">Cart</h1>
      <p className="mt-1 text-sm text-slate-500">{cartCount(lines)} items</p>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {lines.map((line) => (
            <div
              key={line.variantId}
              className="flex gap-4 rounded-xl border border-navy-100 bg-white p-4"
            >
              <div className="h-20 w-20 overflow-hidden rounded-md bg-navy-50">
                {productImageSrc(line.slug, line.imageUrl) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={productImageSrc(line.slug, line.imageUrl)}
                    alt=""
                    className="h-full w-full object-contain p-1"
                  />
                ) : null}
              </div>
              <div className="flex-1">
                <Link
                  href={`/shop/${line.slug}`}
                  className="font-semibold text-navy-900 hover:underline"
                >
                  {line.name}
                </Link>
                <p className="text-sm text-slate-500">{line.label}</p>
                <p className="mt-1 text-sm">{formatCad(line.unitCents)}</p>
                <div className="mt-2 flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    max={line.stock}
                    value={line.qty}
                    onChange={(e) =>
                      setQty(line.variantId, Number(e.target.value))
                    }
                    className="h-9 w-16 rounded border border-navy-200 px-2 text-sm"
                  />
                  <button
                    className="text-sm text-red-700 hover:underline"
                    onClick={() => remove(line.variantId)}
                  >
                    Remove
                  </button>
                </div>
              </div>
              <p className="font-medium">
                {formatCad(line.unitCents * line.qty)}
              </p>
            </div>
          ))}
        </div>
        <aside className="h-fit rounded-xl border border-navy-100 bg-white p-5">
          <h2 className="font-semibold">Summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>{formatCad(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Shipping</dt>
              <dd>{shipping === 0 ? "Free" : formatCad(shipping)}</dd>
            </div>
            <div className="flex justify-between border-t pt-2 font-semibold">
              <dt>Total</dt>
              <dd>{formatCad(total)}</dd>
            </div>
          </dl>
          {subtotal < FREE_SHIPPING_THRESHOLD_CENTS && (
            <p className="mt-3 text-xs text-slate-500">
              Add {formatCad(FREE_SHIPPING_THRESHOLD_CENTS - subtotal)} for
              free Canadian shipping.
            </p>
          )}
          <Button asChild className="mt-5 w-full">
            <Link href="/checkout">Checkout with Interac</Link>
          </Button>
        </aside>
      </div>
    </div>
  );
}
