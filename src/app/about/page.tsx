import type { Metadata } from "next";

export const metadata: Metadata = { title: "About BlueNex Labs" };

export default function AboutPage() {
  return (
    <div>
      <section className="mx-auto max-w-6xl px-4 py-12 lg:py-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-blue">
              Founder & team
            </p>
            <h1 className="display mt-2 text-4xl text-navy-900 sm:text-5xl">
              Who we are
            </h1>
            <div
              className="mt-4 h-px w-14 bg-brand-blue"
              aria-hidden="true"
            />
            <div className="mt-6 space-y-5 text-[17px] leading-8 text-slate-600">
              <p>
                We are a team of very passionate individuals that have been
                researching peptides for many years and finally wanted to bring
                the research to the{" "}
                <strong className="font-semibold text-navy-900">
                  Canadian research platform
                </strong>
                .
              </p>
              <p>
                We are very involved in what we do, are hands on, and always
                learning the latest research data on peptides and any new
                discoveries.
              </p>
              <p>
                Our founder,{" "}
                <strong className="font-semibold text-navy-900">
                  Alice Kay
                </strong>
                , has a Ph.D. in Biochemistry and a long track record of
                research and development in various biotechnological elements
                and peptide science. She achieved her Ph.D. in 2024 and pursued
                a study of peptides prior to launching BlueNex Labs in 2025.
              </p>
              <p>
                Being able to provide the{" "}
                <strong className="font-semibold text-navy-900">
                  highest quality of products
                </strong>{" "}
                and the{" "}
                <strong className="font-semibold text-navy-900">
                  best customer service
                </strong>{" "}
                is the mantra of BlueNex Labs. This Canadian bench exists so
                laboratories can source COA-backed materials without waiting on
                a US warehouse or a customs hold.
              </p>
            </div>
          </div>

          <figure className="overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-sm">
            <div className="h-1 bg-brand-blue" aria-hidden="true" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/alice-kay-portrait.png"
              alt="Alice Kay, founder of BlueNex Labs, in the laboratory"
              className="aspect-[4/5] w-full object-cover object-[center_18%]"
            />
            <figcaption className="border-t border-navy-800 bg-navy-950 px-5 py-4 text-white">
              <p className="font-semibold tracking-wide">Alice Kay, Ph.D.</p>
              <p className="mt-0.5 text-sm text-slate-300">
                Founder · Biochemistry, 2024
              </p>
            </figcaption>
          </figure>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 pb-16">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-blue">
          Burnaby, British Columbia
        </p>
        <h2 className="display mt-2 text-3xl text-navy-900">
          A Canadian bench for research peptides
        </h2>
        <div className="prose-article mt-6">
          <p>
            Lots are purchased from audited manufacturers, then reviewed against
            third-party identity and purity data. Popular families carry
            endotoxin screening. Vial caps are colour-coded to the batch on the
            COA so receiving teams can match glass to paperwork in seconds.
          </p>
          <h2>What we will not do</h2>
          <p>
            We do not sell for human or veterinary use, and we do not publish
            reconstitution “protocols” for self-administration. Product copy
            stays inside laboratory context: storage, identity, and documentation.
          </p>
          <h2>Fulfillment</h2>
          <p>
            Orders ship Canada Post Xpresspost from Metro Vancouver after Interac
            e-Transfer clears. Typical transit is two to four business days.
            Shipping is $25.00 CAD, waived at $299.
          </p>
        </div>
      </div>
    </div>
  );
}
