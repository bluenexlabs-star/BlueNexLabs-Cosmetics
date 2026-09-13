import type { Metadata } from "next";
import Link from "next/link";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Quality & documentation" };

export default function CertificatesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="display text-4xl text-navy-900">
        Quality & documentation
      </h1>
      <p className="mt-4 text-slate-600 leading-7">
        All of our cosmetic ingredients and skin-care formulas are sourced from
        rigorously vetted suppliers. We prioritize quality, transparency, and
        reliability across the supply chain — and we will publish batch
        documentation here as the catalog launches.
      </p>

      <h2 className="mt-10 text-sm font-semibold uppercase tracking-[0.18em] text-navy-900 underline decoration-navy-900 underline-offset-4">
        Our guarantee
      </h2>
      <p className="mt-4 text-slate-600 leading-7">
        If your order does not arrive, or arrives damaged or incorrect, we will
        reship or refund after review. That is our commitment to consistent,
        well-documented cosmetic products.
      </p>
      <p className="mt-3 text-slate-600 leading-7">
        Questions about an upcoming formula? Email us from the{" "}
        <Link className="underline" href="/contact">
          contact page
        </Link>
        .
      </p>

      <ComingSoon title="Batch documents coming soon">
        Certificates and ingredient documentation will be listed here with the
        first cosmetics catalog — not before.
      </ComingSoon>
    </div>
  );
}
