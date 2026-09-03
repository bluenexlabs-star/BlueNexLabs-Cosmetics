import { notFound } from "next/navigation";
import Link from "next/link";
import { AddToCart } from "@/components/add-to-cart";
import { ProductDescription } from "@/components/product-description";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { productImageSrc } from "@/lib/product-image";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  return { title: product?.name ?? "Product" };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { variants: { orderBy: { priceCents: "asc" } } },
  });
  if (!product || !product.active) notFound();
  const cat = CATEGORIES.find((c) => c.slug === product.category);
  const specs = JSON.parse(product.specsJson || "{}") as Record<string, string>;
  const imageSrc = productImageSrc(product.slug, product.imageUrl);

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 lg:grid-cols-2">
      <div className="rounded-2xl border border-navy-100 bg-white p-6">
        {imageSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageSrc}
            alt={product.name}
            className="mx-auto max-h-[420px] object-contain"
          />
        ) : (
          <div className="flex h-80 items-center justify-center text-slate-400">
            Image coming soon
          </div>
        )}
      </div>
      <div>
        {cat && <Badge tone="cyan">{cat.name}</Badge>}
        <h1 className="display mt-3 text-3xl text-navy-900">{product.name}</h1>
        <p className="mt-3 text-sm font-medium text-amber-800">
          Research use only. Not for human or veterinary use.
        </p>
        <ProductDescription markdown={product.description} />
        <div className="mt-6">
          <AddToCart
            productId={product.id}
            slug={product.slug}
            name={product.name}
            imageUrl={imageSrc}
            variants={product.variants}
          />
        </div>
        <dl className="mt-8 grid grid-cols-2 gap-3 text-sm">
          {Object.entries(specs).map(([k, v]) => (
            <div key={k} className="rounded-lg bg-navy-50 p-3">
              <dt className="text-xs uppercase tracking-wide text-slate-500">
                {k}
              </dt>
              <dd className="mt-1 text-navy-900">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 text-sm text-slate-500">
          Need a COA? See the{" "}
          <Link className="underline" href="/certificates">
            certificates library
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
