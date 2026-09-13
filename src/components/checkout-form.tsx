"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { PROVINCES, SITE } from "@/lib/constants";
import { cartSubtotal, useCart } from "@/lib/cart";
import { formatCad, shippingCents } from "@/lib/utils";

type Prefill = {
  name?: string;
  email?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  requireAccount?: boolean;
  signedIn?: boolean;
};

export function CheckoutForm({ prefill }: { prefill: Prefill }) {
  const lines = useCart((s) => s.lines);
  const clear = useCart((s) => s.clear);
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const subtotal = cartSubtotal(lines);
  const shipping = shippingCents(subtotal);
  const total = subtotal + shipping;

  if (lines.length === 0) {
    return (
      <p className="text-slate-600">
        Your cart is empty.{" "}
        <Link href="/shop" className="underline">
          Continue shopping
        </Link>
      </p>
    );
  }

  return (
    <form
      className="grid gap-8 lg:grid-cols-[1fr_320px]"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        if (!form.get("ruo")) {
          toast.error("Please accept the terms to continue.");
          return;
        }
        setPending(true);
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.get("name"),
            email: form.get("email"),
            phone: form.get("phone"),
            addressLine1: form.get("addressLine1"),
            addressLine2: form.get("addressLine2"),
            city: form.get("city"),
            province: form.get("province"),
            postalCode: form.get("postalCode"),
            notes: form.get("notes"),
            ruoAccepted: true,
            lines: lines.map((l) => ({ variantId: l.variantId, qty: l.qty })),
          }),
        });
        const data = await res.json();
        setPending(false);
        if (!res.ok) {
          toast.error(data.error ?? "Could not place order");
          return;
        }
        clear();
        router.push(`/order/${data.orderId}`);
      }}
    >
      <div className="space-y-5 rounded-xl border border-navy-100 bg-white p-6">
        <h2 className="font-semibold text-navy-900">Ship to (Canada only)</h2>
        {!prefill.signedIn && (
          <p className="text-sm text-slate-600">
            {prefill.requireAccount ? (
              <>
                An account is required.{" "}
                <Link href="/login?next=/checkout" className="underline">
                  Sign in
                </Link>{" "}
                or{" "}
                <Link href="/register?next=/checkout" className="underline">
                  create one
                </Link>
                .
              </>
            ) : (
              <>
                Optional:{" "}
                <Link href="/register?next=/checkout" className="underline">
                  create an account
                </Link>{" "}
                to keep order history. Guest checkout is enabled.
              </>
            )}
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              name="name"
              required
              className="mt-1"
              defaultValue={prefill.name}
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1"
              defaultValue={prefill.email}
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              required
              className="mt-1"
              defaultValue={prefill.phone}
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="addressLine1">Address</Label>
            <Input
              id="addressLine1"
              name="addressLine1"
              required
              className="mt-1"
              defaultValue={prefill.addressLine1}
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="addressLine2">Apartment, suite (optional)</Label>
            <Input
              id="addressLine2"
              name="addressLine2"
              className="mt-1"
              defaultValue={prefill.addressLine2}
            />
          </div>
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              name="city"
              required
              className="mt-1"
              defaultValue={prefill.city}
            />
          </div>
          <div>
            <Label htmlFor="province">Province</Label>
            <select
              id="province"
              name="province"
              defaultValue={prefill.province ?? "BC"}
              className="mt-1 h-10 w-full rounded-md border border-navy-200 bg-white px-3 text-sm"
            >
              {PROVINCES.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="postalCode">Postal code</Label>
            <Input
              id="postalCode"
              name="postalCode"
              required
              className="mt-1"
              defaultValue={prefill.postalCode}
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="notes">Order notes</Label>
            <textarea
              id="notes"
              name="notes"
              className="mt-1 min-h-20 w-full rounded-md border border-navy-200 px-3 py-2 text-sm"
            />
          </div>
        </div>
        <label className="flex items-start gap-2 text-sm text-slate-700">
          <input type="checkbox" name="ruo" className="mt-1" required />
          I confirm I am purchasing cosmetic and face additives for personal
          use, will follow product labels, and I accept the{" "}
          <Link href="/terms" className="underline">
            terms
          </Link>
          .
        </label>
      </div>
      <aside className="h-fit rounded-xl border border-navy-100 bg-white p-5">
        <h2 className="font-semibold">Pay by Interac</h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-600">
          {lines.map((l) => (
            <li key={l.variantId} className="flex justify-between gap-3">
              <span>
                {l.name} ({l.label}) × {l.qty}
              </span>
              <span>{formatCad(l.unitCents * l.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between text-sm">
          <span>Shipping</span>
          <span>{shipping === 0 ? "Free" : formatCad(shipping)}</span>
        </div>
        <div className="mt-2 flex justify-between font-semibold">
          <span>Total due</span>
          <span>{formatCad(total)}</span>
        </div>
        <p className="mt-4 text-xs leading-5 text-slate-500">
          After you submit, we email an invoice with Interac details. Send
          payment to {SITE.interacEmail}. Shipments leave Burnaby after payment
          is received.
        </p>
        <Button className="mt-5 w-full" disabled={pending || prefill.requireAccount && !prefill.signedIn}>
          {pending ? "Placing order…" : "Place order"}
        </Button>
      </aside>
    </form>
  );
}
