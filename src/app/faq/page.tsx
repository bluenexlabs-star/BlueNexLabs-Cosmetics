import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = { title: "FAQ" };

const faqs: { q: string; a: ReactNode }[] = [
  {
    q: "How do I order?",
    a: `Add products to the cart, check out with a Canadian shipping address, then pay the emailed Interac invoice to ${SITE.interacEmail}. Guest checkout is available unless we later require accounts.`,
  },
  {
    q: "Which payment methods do you accept?",
    a: `Interac e-Transfer only. This keeps card processing fees out of the product price. Send the exact total to ${SITE.interacEmail} with your order number in the message field.`,
  },
  {
    q: "Do you ship outside Canada?",
    a: "No. Domestic shipping avoids customs delays and brokerage. We will not redirect a parcel abroad.",
  },
  {
    q: "Are these cosmetic products?",
    a: (
      <>
        Yes. Items are sold as cosmetics and skin-care products for topical
        use. They are not medicines, and we do not make treatment claims. See
        the{" "}
        <Link className="underline" href="/terms">
          Terms and Conditions
        </Link>{" "}
        for intended use, returns, and governing law.
      </>
    ),
  },
  {
    q: "How is quality documented?",
    a: (
      <>
        We publish quality standards and batch documentation as the catalog
        launches. See the{" "}
        <Link className="underline" href="/certificates">
          quality page
        </Link>
        .
      </>
    ),
  },
  {
    q: "What if an item arrives damaged?",
    a: "If an item arrives damaged, incorrect, or materially defective, email us within 48 hours of delivery with photos and your order number. We will replace or refund after review.",
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="display text-4xl text-navy-900">Questions we actually get</h1>
      <div className="mt-8 space-y-4">
        {faqs.map((f) => (
          <details
            key={f.q}
            className="rounded-xl border border-navy-100 bg-white p-5"
          >
            <summary className="cursor-pointer font-semibold text-navy-900">
              {f.q}
            </summary>
            <p className="mt-3 text-sm leading-6 text-slate-600">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
