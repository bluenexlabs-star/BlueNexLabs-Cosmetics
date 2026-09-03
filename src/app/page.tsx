import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { articleImageSrc } from "@/lib/article-image";
import { CATEGORIES, SITE } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { ArrowLeftRight, FileCheck2, Truck, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featured, posts] = await Promise.all([
    prisma.product.findMany({
      where: { active: true, featured: true },
      include: { variants: true },
      orderBy: { sortOrder: "asc" },
      take: 6,
    }),
    prisma.post.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      take: 3,
    }),
  ]);

  const cards = featured.map((p) => {
    const inStock = p.variants.some((v) => v.stock > 0);
    const fromCents = Math.min(...p.variants.map((v) => v.priceCents));
    return {
      name: p.name,
      slug: p.slug,
      category: p.category,
      imageUrl: p.imageUrl,
      fromCents,
      inStock,
    };
  });

  return (
    <div>
      <section className="relative overflow-hidden bg-navy-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(63,212,226,0.18),_transparent_42%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
              Burnaby, British Columbia
            </p>
            <h1 className="display mt-4 text-4xl leading-tight sm:text-5xl">
              COA-certified research peptides, fulfilled in Canada.
            </h1>
            <p className="mt-5 max-w-xl text-slate-300 leading-7">
              BlueNex Labs supplies lyophilized research materials with batch
              documentation, domestic Canada Post shipping, and Interac
              e-Transfer checkout. Every listing is research-use only.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/shop">Browse catalog</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/certificates">View COA library</Link>
              </Button>
            </div>
            <p className="mt-6 text-xs text-slate-400">
              Free shipping on orders of $299+ · $25.00 flat rate across Canada
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                icon: FileCheck2,
                title: "Batch COAs",
                body: "Purity and identity documentation for popular lots, with cap-colour batch tracking.",
              },
              {
                icon: Truck,
                title: "Domestic only",
                body: "Canada Post Xpress from Burnaby. Typical delivery 2–4 business days after payment.",
              },
              {
                icon: ShieldCheck,
                title: "Research-use only",
                body: "Not for human or veterinary use. No dosing, treatment, or medical guidance is provided.",
              },
              {
                icon: ArrowLeftRight,
                title: "Interac checkout",
                body: "Place the order, receive an invoice, pay by Interac e-Transfer. No card fees.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-white/10 bg-white/5 p-5"
              >
                <item.icon className="h-5 w-5 text-cyan-300" />
                <h2 className="mt-3 font-semibold">{item.title}</h2>
                <p className="mt-1.5 text-sm text-slate-300 leading-6">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-700">
              Catalog
            </p>
            <h2 className="display mt-1 text-3xl text-navy-900">Featured materials</h2>
          </div>
          <Link href="/shop" className="text-sm font-medium text-cyan-800 hover:underline">
            Shop all
          </Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="display text-3xl text-navy-900">Research categories</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((c) => (
              <Link
                key={c.slug}
                href={`/shop?category=${c.slug}`}
                className="rounded-xl border border-navy-100 p-5 hover:border-cyan-400 hover:shadow-sm"
              >
                <h3 className="font-semibold uppercase tracking-wide text-navy-900">
                  {c.shortName}
                </h3>
                <p className="mt-1 text-xs text-slate-500">{c.name}</p>
                <p className="mt-2 text-sm text-slate-600">{c.blurb}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex items-end justify-between">
          <h2 className="display text-3xl text-navy-900">From the research hub</h2>
          <Link href="/research" className="text-sm font-medium text-cyan-800 hover:underline">
            All articles
          </Link>
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {posts.map((post) => {
            const imageSrc = articleImageSrc(post.slug, post.coverImageUrl);
            return (
              <Link
                key={post.id}
                href={`/research/${post.slug}`}
                className="overflow-hidden rounded-xl border border-navy-100 bg-white hover:shadow-sm"
              >
                {imageSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageSrc}
                    alt=""
                    className="h-40 w-full object-cover"
                  />
                ) : null}
                <div className="p-5">
                  <p className="text-xs uppercase tracking-wide text-cyan-800">
                    {post.category}
                  </p>
                  <h3 className="mt-2 font-semibold text-navy-900">{post.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm text-slate-600">
                    {post.excerpt}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="bg-navy-900 text-white">
        <div className="mx-auto max-w-6xl px-4 py-12 text-center">
          <p className="text-sm text-slate-300">
            Questions before you order? Email{" "}
            <a className="underline" href={`mailto:${SITE.email}`}>
              {SITE.email}
            </a>
            . We reply within one business day.
          </p>
        </div>
      </section>
    </div>
  );
}
