import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCad(cents: number) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(cents / 100);
}

/** Free Canadian shipping at this product subtotal (cents). Inclusive: $299.00+. */
export const FREE_SHIPPING_THRESHOLD_CENTS = 29900;
/** Flat Canada shipping when below the free-shipping threshold (cents). */
export const STANDARD_SHIPPING_CENTS = 2500;

export function shippingCents(subtotalCents: number) {
  if (subtotalCents <= 0) return 0;
  return subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS
    ? 0
    : STANDARD_SHIPPING_CENTS;
}

export function orderNumberFromCount(count: number) {
  return `BNL-${String(count + 10001).padStart(5, "0")}`;
}
