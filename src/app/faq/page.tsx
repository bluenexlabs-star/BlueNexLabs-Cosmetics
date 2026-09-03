import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = { title: "FAQ" };

const faqs: { q: string; a: ReactNode }[] = [
  {
    q: "How do I order?",
    a: `Add vials to the cart, check out with a Canadian shipping address, then pay the emailed Interac invoice to ${SITE.interacEmail}. Guest checkout is available unless we later require accounts.`,
  },
  {
    q: "Which payment methods do you accept?",
    a: `Interac e-Transfer only. This keeps card processing fees out of the vial price. Send the exact total to ${SITE.interacEmail} with your order number in the message field.`,
  },
  {
    q: "Do you ship outside Canada?",
    a: "No. Domestic shipping avoids customs seizures and brokerage. We will not redirect a parcel abroad.",
  },
  {
    q: "Are products for human use?",
    a: (
      <>
        No. Everything is sold as a research chemical for in-vitro / laboratory
        work. We provide no medical advice, dosing, or treatment claims. See
        the{" "}
        <Link className="underline" href="/terms">
          Terms and Conditions
        </Link>{" "}
        for research-use-only terms, returns, and governing law.
      </>
    ),
  },
  {
    q: "How are COAs handled?",
    a: (
      <>
        Need a COA? See the{" "}
        <Link className="underline" href="/certificates">
          certificates library
        </Link>
        .
      </>
    ),
  },
  {
    q: "What if a vial tests below 99%?",
    a: "If an independent lab shows identity failure or purity under 99% on an unopened vial from that batch, we replace it and refund the original payment.",
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
