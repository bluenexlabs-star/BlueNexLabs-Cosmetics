import type { Metadata } from "next";
import { CERTIFICATES } from "@/lib/certificates";

export const metadata: Metadata = { title: "Certificates of analysis" };

export default function CertificatesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="display text-4xl text-navy-900">
        Certificates of analysis
      </h1>
      <p className="mt-4 text-slate-600 leading-7">
        All of our products are sourced exclusively from rigorously vetted,
        certified manufacturers, and every batch of peptides is tested to
        verify &gt;99% purity. We prioritize quality, transparency, and
        reliability across the supply chain.
      </p>

      <h2 className="mt-10 text-sm font-semibold uppercase tracking-[0.18em] text-navy-900 underline decoration-navy-900 underline-offset-4">
        Our guarantee
      </h2>
      <p className="mt-4 text-slate-600 leading-7">
        If your order does not arrive, or tests below 99% purity, we will
        reship the product at no cost. That is our commitment to consistent,
        high-purity, lab-verified research materials.
      </p>
      <p className="mt-3 text-slate-600 leading-7">
        For full transparency, Certificates of Analysis are listed below and
        linked to the Janoshik testing website so you can verify authenticity.
        Several popular lots also include endotoxin testing.
      </p>

      <ul className="mt-8 space-y-4">
        {CERTIFICATES.map((lot) => (
          <li
            key={lot.name}
            className="rounded-xl border border-navy-100 bg-white px-4 py-4"
          >
            <p className="font-medium text-navy-900">{lot.name}</p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {lot.tests.map((test) => (
                <a
                  key={test.href}
                  href={test.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-700 underline underline-offset-2 hover:text-sky-900"
                >
                  {test.label}: Janoshik link
                </a>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
